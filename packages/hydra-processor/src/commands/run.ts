import { Command, flags } from '@oclif/command'
import { ProcessorRunner } from '../start'
import { system, initLogFiles, logMode, LogMode } from '../util/log'
import dotenv from 'dotenv'
import { logError } from '@subsquid/hydra-common'

export default class Run extends Command {
  static flags = {
    manifest: flags.string({
      char: 'm',
      description: 'Manifest file',
    }),
    indexer: flags.string({
      description: 'Indexer URL to source events',
    }),
    env: flags.string({
      char: 'e',
      description: 'Path to a file with environment variables',
      default: './.env',
    }),
    id: flags.string({
      description: 'ID of the processor (useful for multi-processor setups)',
    }),
  }

  async run(): Promise<void> {
    if (logMode === LogMode.FILE) {
      initLogFiles()
    }
    system.info('Starting Hydra Processor')

    const { flags } = this.parse(Run)

    dotenv.config({ path: flags.env })

    if (flags.indexer) {
      process.env.INDEXER_ENDPOINT_URL = flags.indexer
    }

    if (flags.manifest) {
      process.env.MANIFEST_PATH = flags.manifest
    }

    if (flags.id) {
      process.env.ID = flags.id
    }

    const processor = new ProcessorRunner()
    try {
      await processor.process()
    } catch (e) {
      system.error(`${logError(e)}`)
      process.exitCode = 1
    } finally {
      system.info(`Shutting down...`)
      await processor.shutDown()
    }
  }
}
