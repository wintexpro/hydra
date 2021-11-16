import { Command, flags } from '@oclif/command'
import { userLogFileName } from '../util'
import { Tail as NodeTail } from 'tail'
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
      const tail = new NodeTail(fileName)
      tail.on('line', function (data) {
        console.log(data)
      })
      tail.on('error', function (e) {
        console.error(`Tail error: ${(e as { message: string }).message}`)
        console.log(`Shutting down...`)
        process.exit(1)
      })
      tail.watch()
    } catch (e) {
      console.error(`Error: ${(e as { message: string }).message}`)
      console.log(`Shutting down...`)
      process.exit(1)
    }
  }
}
