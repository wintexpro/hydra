import { Command } from '@oclif/command'
import Debug from 'debug'
import { destroyApp, destroyDeployment } from '../../rest-client/routes/destroy'
import { parseNameAndVersion } from '../../utils/helper'

const debug = Debug('qnode-cli:delete')

export default class Kill extends Command {
  static description = 'Kill squid or version'
  static args = [
    {
      name: 'nameAndVersion',
      description: 'name@version',
      required: true,
    },
  ]

  async run(): Promise<void> {
    const { flags, args } = this.parse(Kill)
    debug(`Parsed flags: ${JSON.stringify(flags, null, 2)}, args: ${args}`)
    const nameAndVersion = args.nameAndVersion
    const { squidName, versionName } = parseNameAndVersion(nameAndVersion, this)

    let message
    if (versionName) {
      message = await destroyDeployment(squidName, versionName)
    } else {
      message = await destroyApp(squidName)
    }
    this.log(message)
  }
}
