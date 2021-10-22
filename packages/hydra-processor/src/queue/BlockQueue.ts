import { getProcessorSource } from '../ingest'
import { getConfig as conf, getManifest } from '../start/config'
import { system } from '../util/log'
import { uniq, last, first, union, mapValues, chunk } from 'lodash'
import pWaitFor from 'p-wait-for'
import delay from 'delay'

import { IndexerStatus, IStateKeeper, getStateKeeper } from '../state'
import { eventEmitter, ProcessorEvents } from '../start/processor-events'
import {
  BlockData,
  IBlockQueue,
  MappingFilter,
  Kind,
  RangeFilter,
  EventData,
} from './IBlockQueue'
import { MappingsDef } from '../start/manifest'
import { SubstrateEvent } from '@subsquid/hydra-common'
import { IndexerQuery, IProcessorSource } from '../ingest/IProcessorSource'
import { parseEventId } from '../util/utils'
import { unionAll, Range, numbersIn, intersectWith } from '../util'

const label = 'hydra-processor:event-queue'

export function getMappingFilter(mappingsDef: MappingsDef): MappingFilter {
  const { eventHandlers, extrinsicHandlers, range } = mappingsDef

  return {
    events: eventHandlers.map((h) => h.event),
    extrinsics: {
      names: extrinsicHandlers.map((h) => h.extrinsic),
      triggerEvents: extrinsicHandlers.reduce<string[]>(
        (acc, h) => union(acc, h.triggerEvents),
        [] as string[]
      ),
    },
    range,
    // blockHooks: union(preBlockHooks, postBlockHooks).reduce<{
    //   height?: Range[]
    // }>((acc, h) => union(acc, h.range ? [h.range] : []), []),
  }
}

export class BlockQueue implements IBlockQueue {
  _started = false
  _hasNext = true
  indexerStatus!: IndexerStatus
  eventQueue: EventData[] = []
  stateKeeper!: IStateKeeper
  dataSource!: IProcessorSource
  mappingFilter!: MappingFilter
  rangeFilter!: RangeFilter
  indexerQueries!: { [key in Kind]?: Partial<IndexerQuery> }
  heightsWithHooks!: Range[]

  async init(): Promise<void> {
    system.info(`Waiting for the indexer head to be initialized`)

    this.stateKeeper = await getStateKeeper()
    this.dataSource = await getProcessorSource()
    this.mappingFilter = getMappingFilter(getManifest().mappings)

    await pWaitFor(async () => {
      this.indexerStatus = await this.dataSource.getIndexerStatus()
      return this.indexerStatus.head >= 0
    })

    this.rangeFilter = this.getInitialRange()

    this.heightsWithHooks = unionAll(
      getManifest().mappings.preBlockHooks.map((h) => h.filter.height),
      getManifest().mappings.postBlockHooks.map((h) => h.filter.height)
    )
    this.indexerQueries = prepareIndexerQueries(this.mappingFilter)
  }

  getInitialRange(): RangeFilter {
    const { lastScannedBlock, lastProcessedEvent } = this.stateKeeper.getState()

    return {
      id: {
        gt: lastProcessedEvent,
      },
      block: this.nextBlockRange({
        lte: lastScannedBlock,
      }),

      limit: conf().QUEUE_BATCH_SIZE,
    }
  }

  async start(): Promise<void> {
    this._started = true

    system.info('Starting the event queue')

    await Promise.all([this.pollIndexer(), this.fill()])
  }

  stop(): void {
    this._started = false
  }

  async pollIndexer(): Promise<void> {
    // TODO: uncomment this block when eventSource will emit
    // this.eventsSource.on('NewIndexerHead', (h: number) => {
    //   system.debug(`New Indexer Head: ${h}`, { label })
    //   this.indexerHead = h
    // });
    // For now, simply update indexerHead regularly
    while (this._started && this._hasNext) {
      this.indexerStatus = await this.dataSource.getIndexerStatus()
      eventEmitter.emit(
        ProcessorEvents.INDEXER_STATUS_CHANGE,
        this.indexerStatus
      )
      await delay(conf().POLL_INTERVAL_MS)
    }
  }

  hasNext(): boolean {
    return this._hasNext
  }

  private async poll(): Promise<EventData | undefined> {
    await pWaitFor(() => this.eventQueue.length > 0 || !this._hasNext)
    const out = this.eventQueue.shift()
    if (this.eventQueue.length === 0) {
      eventEmitter.emit(ProcessorEvents.QUEUE_DRAINED, out)
    }
    return out
  }

  async peak(): Promise<EventData | undefined> {
    await pWaitFor(() => this.eventQueue.length > 0 || !this._hasNext)
    return first(this.eventQueue)
  }

  async *blocksWithEvents(): AsyncGenerator<BlockData, void, void> {
    // FIXME: this method only produces blocks with some event.

    while (this._started) {
      system.debug(`Sealing new block`, { label })

      let nextEventData = await this.poll()

      if (nextEventData === undefined) {
        system.debug(`The queue is empty and all the events were fetched`, {
          label,
        })
        return
      }

      const events = [nextEventData]

      const block = await this.dataSource.getBlock(
        nextEventData.event.blockNumber
      )

      system.debug(`Next block: ${block.id}`, { label })
      // wait until all the events up to blockNumber are fully fetched
      pWaitFor(() => this.rangeFilter.block.gt >= block.height)

      while (
        !this.isEmpty() &&
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        first(this.eventQueue)!.event.blockNumber === block.height
      ) {
        nextEventData = (await this.poll()) as EventData
        events.push(nextEventData)
      }

      // the event is from a new block, yield the current
      system.debug(`Yielding block ${block.id}`, { label })
      if (conf().VERBOSE)
        system.debug(`Block contents: ${JSON.stringify(block, null, 2)}`, {
          label,
        })

      yield {
        block,
        events,
      }
    }
  }

  isEmpty(): boolean {
    return this.eventQueue.length === 0
  }

  // Long running loop where events are fetched
  private async fill(): Promise<void> {
    while (this._started && this._hasNext) {
      await pWaitFor(
        () =>
          this.eventQueue.length <=
          conf().EVENT_QUEUE_MAX_CAPACITY - conf().QUEUE_BATCH_SIZE
      )

      system.debug(
        `Queue size: ${this.eventQueue.length}, max capacity: ${
          conf().EVENT_QUEUE_MAX_CAPACITY
        }`,
        { label }
      )

      const events: EventData[] = await this.fetchNextBatch()

      this.eventQueue.push(...events)

      system.debug(`Pushed ${events.length} events to the queue`, { label })

      if (events.length > 0) {
        this.rangeFilter.id.gt = last(events)?.event.id as string
      }

      if (events.length < conf().QUEUE_BATCH_SIZE) {
        // This means that we have exhausted all the events up to lastScannedblock + WINDOW
        if (conf().VERBOSE)
          system.debug(
            `Fully fetched the next batch of ${
              conf().QUEUE_BATCH_SIZE
            }: fetched only ${events.length} events`,
            { label }
          )

        await this.shiftRangeFilter()
      }

      eventEmitter.emit(
        ProcessorEvents.QUEUE_SIZE_CHANGE,
        this.eventQueue.length
      )

      system.debug(
        `Event queue state:
          \tIndexer head: ${this.indexerStatus.head}
          \tChain head: ${this.indexerStatus.chainHeight} 
          \tQueue size: ${this.eventQueue.length}
          \tLast fetched event: ${this.rangeFilter.id.gt}
          \tBlock range: ${JSON.stringify(this.rangeFilter.block)}`,
        { label }
      )
    }
  }

  private async shiftRangeFilter(): Promise<void> {
    if (this.rangeFilter.block.lte >= this.mappingFilter.range.to) {
      system.info(
        `All the events up to block ${this.mappingFilter.range.to} has been fetched.`
      )
      this.rangeFilter.block.gt = this.mappingFilter.range.to
      this._hasNext = false
      return
    }
    // wait until there're more blocks to fetch
    await pWaitFor(() => this.rangeFilter.block.lte < this.indexerStatus.head)

    this.rangeFilter.block = this.nextBlockRange(this.rangeFilter.block)
    eventEmitter.emit(
      ProcessorEvents.QUEUE_LAST_COMPLETE_BLOCK_CHANGE,
      this.rangeFilter.block.gt
    )
  }

  nextBlockRange(last: { lte: number }): { gt: number; lte: number } {
    return {
      gt: last.lte,
      lte: Math.min(
        last.lte + conf().BLOCK_WINDOW,
        this.mappingFilter.range.to,
        this.indexerStatus.head
      ),
    }
  }

  async *blocksWithHooks(range: Range): AsyncGenerator<BlockData, void, void> {
    const ranges = intersectWith(range, this.heightsWithHooks)

    system.debug(`Fetching hooks in ranges: ${JSON.stringify(ranges)}`, {
      label,
    })

    const heights = ranges
      .reduce((acc: number[], r) => [...acc, ...numbersIn(r)], [])
      .sort()

    const chunks = chunk(heights, conf().BATCH_SIZE)

    for (const c of chunks) {
      const blocks = await this.dataSource.fetchBlocks(c)
      for (const block of blocks) {
        yield { block, events: [] }
      }
    }
  }

  private async fetchNextBatch() {
    const queries = mapValues(
      this.indexerQueries,
      // add range and limit to the indexer queries
      (query) => ({ ...this.rangeFilter, ...query } as IndexerQuery)
    )

    system.debug(`Fetching next batch`, { label })
    const events = await this.dataSource.nextBatch(queries)

    // collect the events object into an array with types
    const trimmed = sortAndTrim(events)
    if (conf().VERBOSE) {
      system.debug(
        `Enqueuing events: ${JSON.stringify(trimmed.map((e) => e.event.id))}`,
        { label }
      )
    }

    const blockHeights = uniq(
      trimmed.map((e) => parseEventId(e.event.id).blockHeight)
    )

    if (conf().VERBOSE)
      system.debug(`Requesting blocks: ${blockHeights}`, { label })

    // prefetch to the cache
    await this.dataSource.fetchBlocks(blockHeights)

    return trimmed
  }
}

/**
 *
 * @param events an object containg events for different mapping types
 * @param size output batch size
 * @returns an array of events enriched with the mapping type
 */
export function sortAndTrim(
  events: { [key in Kind]?: SubstrateEvent[] },
  size = conf().QUEUE_BATCH_SIZE
): EventData[] {
  // collect all mapping type event arrays into a single big array
  let mappingData: EventData[] = []
  for (const e in events) {
    const kind = e as keyof typeof events
    mappingData.push(
      ...(events[kind] || []).map((event) => {
        return { event, kind }
      })
    )
  }

  // sort the events so that the mappings are exectuted in the right order
  mappingData = mappingData
    .sort((e1, e2) => (e1.event.id < e2.event.id ? -1 : 1))
    .slice(0, size)

  return mappingData
}

export function prepareIndexerQueries(
  filter: MappingFilter
): { [key in Kind]?: Partial<IndexerQuery> } {
  const { events, extrinsics } = filter
  const queries: { [key in Kind]?: Partial<IndexerQuery> } = {}

  if (events.length > 0) {
    queries[Kind.EVENT] = {
      event: { in: events },
    }
  }

  const { names, triggerEvents } = extrinsics
  if (names.length > 0) {
    queries[Kind.EXTRINSIC] = {
      event: { in: triggerEvents },
      extrinsic: { in: names },
    }
  }

  // TODO: block queries here

  system.debug(`Queries: ${JSON.stringify(queries, null, 2)}`, { label })
  return queries
}
