import { Command, flags } from '@oclif/command'
import { cli } from 'cli-ux'
import { deploymentList } from '../../rest-client/routes/deployments'
import Debug from 'debug'
import { deploymentVersionList } from '../../rest-client/routes/deploymentVersions'

const debug = Debug('qnode-cli:deployment-list')
export default class Ls extends Command {
  static description = 'Deployments list'

  static flags = {
    'deployment-name': flags.string({
      char: 'n',
      description: 'deployment name',
      required: false,
    }),
    truncate: flags.boolean({
      description: 'no truncate data in columns: false by default',
      required: false,
      default: false,
    }),
  }

  async run(): Promise<void> {
    const { flags } = this.parse(Ls)
    debug(`Parsed flags: ${JSON.stringify(flags, null, 2)}`)
    const noTruncate = !flags.truncate
    const deploymentName = flags['deployment-name']

    if (deploymentName) {
      const deploymentVersions = await deploymentVersionList(deploymentName)
      if (deploymentVersions) {
        cli.table(
          deploymentVersions,
          {
            name: {},
            version: { header: 'Alias version' },
            artifactUrl: { header: 'artifactUrl' },
            deploymentUrl: { header: 'deploymentUrl' },
            status: {},
            createdAt: { header: 'Created at' },
          },
          { 'no-truncate': noTruncate }
        )
      }
    } else {
      const deployments = await deploymentList()
      if (deployments) {
        cli.table(
          deployments,
          {
            deployment: {},
            aliasVersion: { header: 'Alias version' },
          },
          { 'no-truncate': noTruncate }
        )
      }
    }
  }
}
