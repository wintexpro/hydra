import { Command, flags } from '@oclif/command'
import Debug from 'debug'
import { destroy } from '../rest-client/routes/destroy'

const debug = Debug('qnode-cli:destroy')

export default class Destroy extends Command {
  static description = 'Destroy deployment'

  static flags = {
    name: flags.string({
      char: 'n',
      description: 'Deployment name',
      required: true,
    }),
    version: flags.integer({
      char: 'v',
      description: 'Deployment version',
      required: true,
    }),
  }

  async run(): Promise<void> {
    const { flags } = this.parse(Destroy)
    debug(`Parsed flags: ${JSON.stringify(flags, null, 2)}`)
    const deploymentName = flags.name
    const version = flags.version

    const message = await destroy(deploymentName, version)
    this.log(message)
  }
}
