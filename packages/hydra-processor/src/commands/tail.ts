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

    if (flags.type !== 'system' && flags.type !== 'user') {
      console.log(`Invalid log type ${flags.type}`)
      return
    }
    const fileName = userLogFileName
    const spawn = require('child_process').spawn
    const tail = spawn('tail', ['-f', fileName])
    tail.stdout.on('data', function (data: Buffer) {
      console.log(`${data.toString('utf8')}`)
    })
  }
}
