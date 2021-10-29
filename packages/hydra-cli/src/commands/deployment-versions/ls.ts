import { Command, flags } from '@oclif/command'
import { cli } from 'cli-ux'
import { deploymentVersionList } from '../../rest-client/routes/deploymentVersions'
import Debug from 'debug'

const debug = Debug('qnode-cli:deployment-version-list')

export default class Ls extends Command {
  static description = 'Deployment version list'

  static flags = {
    'deployment-name': flags.string({
      description: 'deployment name',
      required: true,
    }),
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
    const deploymentName = flags['deployment-name']

    const deployments = await deploymentVersionList(deploymentName)
    if (deployments) {
      cli.table(
        deployments,
        {
          name: {},
          version: { header: 'Alias version' },
          tag: {},
          artifactUrl: { header: 'artifactUrl' },
          status: {},
          createdAt: { header: 'Created at' },
        },
        { 'no-truncate': noTruncate }
      )
    }
  }
}
