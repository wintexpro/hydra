import { Command, flags } from '@oclif/command'
import { userLogFileName } from '../util'

export default class Tail extends Command {
  static flags = {
    type: flags.string({
      char: 't',
      description: 'Which log to read: system or user',
      default: 'system',
    }),
  }

  async run(): Promise<void> {
    console.log('Running tail for Hydra Processor')
    const { flags } = this.parse(Tail)
    try {
      if (flags.type !== 'system' && flags.type !== 'user') {
        throw Error(`Invalid log type ${flags.type}`)
      }
      const fileName = userLogFileName
      const spawn = require('child_process').spawn
      spawn('tail', ['-f', fileName], { stdio: 'inherit' })
    } catch (e) {
      console.error(`Error: ${(e as { message: string }).message}`)
      console.log(`Shutting down...`)
      process.exit(1)
    }
  }
}
