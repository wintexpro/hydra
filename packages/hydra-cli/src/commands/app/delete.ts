import { Command, flags } from '@oclif/command'
import Debug from 'debug'
import {
  destroyDeployment,
  destroyVersion,
} from '../../rest-client/routes/destroy'

const debug = Debug('qnode-cli:delete')

export default class Delete extends Command {
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
      required: false,
    }),
  }

  async run(): Promise<void> {
    const { flags } = this.parse(Delete)
    debug(`Parsed flags: ${JSON.stringify(flags, null, 2)}`)
    const deploymentName = flags.name
    const version = flags.version

    let message
    if (version) {
      message = await destroyVersion(deploymentName, version)
    } else {
      message = await destroyDeployment(deploymentName)
    }
    this.log(message)
  }
}
