import { Command, flags } from '@oclif/command'
import { cli } from 'cli-ux'
import { deploymentList } from '../../rest-client/routes/deployments'
import Debug from 'debug'

const debug = Debug('qnode-cli:deployment-list')
export default class Ls extends Command {
  static description = 'Deployments list'

  static flags = {
    'no-truncate': flags.boolean({
      description: 'no truncate data in columns: true by default',
      required: false,
      default: false,
    }),
  }

  async run(): Promise<void> {
    const { flags } = this.parse(Ls)
    debug(`Parsed flags: ${JSON.stringify(flags, null, 2)}`)
    const noTruncate = flags['no-truncate']

    const deployments = await deploymentList()
    if (deployments) {
      cli.table(
        deployments,
        {
          id: {},
          status: {},
          deployment: {},
          aliasVersion: { header: 'Alias version' },
          deploymentVersion: { header: 'deployment version' },
          artifactUrl: { header: 'artifactUrl' },
          deploymentUrl: { header: 'deploymentUrl' },
          tag: {},
          createdAt: { header: 'Created at' },
        },
        { 'no-truncate': noTruncate }
      )
    }
  }
}
