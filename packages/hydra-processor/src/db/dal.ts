import { getRepository, Connection, createConnection } from 'typeorm'

import { ProcessedEventsLogEntity } from '../entities/ProcessedEventsLogEntity'
import { system } from '../util'
import config from './ormconfig'

const label = 'hydra-processor:dal'

export async function createDBConnection(): Promise<Connection> {
  const _config = config()
  system.debug(`DB config: ${JSON.stringify(_config, null, 2)}`, { label })
  return createConnection(_config)
}

/**
 * Get last event processed by the given mappings processor
 *
 * @param processorID Name of the processor
 */
export async function loadState(
  processorID: string
): Promise<ProcessedEventsLogEntity | undefined> {
  return await getRepository(ProcessedEventsLogEntity).findOne({
    where: {
      processor: processorID,
    },
    order: {
      eventId: 'DESC',
      lastScannedBlock: 'DESC',
    },
  })
}

/**
 * Get last event processed by the given mappings processor
 *
 * @param processorID Name of the processor
 */
export async function countProcessedEvents(
  processorID: string
): Promise<number> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { cnt } = await getRepository(ProcessedEventsLogEntity)
    .createQueryBuilder('events')
    .select('COUNT(DISTINCT(events.event_id))', 'cnt')
    .where({ processor: processorID })
    .getRawOne()!

  system.debug(`Total events count ${String(cnt)}`, { label })

  return Number.parseInt(cnt) || 0
}
