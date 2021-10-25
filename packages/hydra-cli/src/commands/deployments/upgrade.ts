import { Command, flags } from '@oclif/command'
import { upgradeDeployment } from '../../rest-client/routes/upgradeDeployment'
import Debug from 'debug'
import simpleGit, { SimpleGit, SimpleGitOptions } from 'simple-git'

const debug = Debug('qnode-cli:upgrade')
const options: Partial<SimpleGitOptions> = {
  baseDir: process.cwd(),
  binary: 'git',
}
const git: SimpleGit = simpleGit(options)
const remoteUrlName = 'origin'

export default class Upgrade extends Command {
  static description = 'Upgrade deployment'

  static flags = {
    name: flags.string({
      char: 'n',
      description: 'Deployment name',
      required: true,
    }),
  }

  async run(): Promise<void> {
    const { flags } = this.parse(Upgrade)
    debug(`Parsed flags: ${JSON.stringify(flags, null, 2)}`)
    const deploymentName = flags.name

    const remotes = await git.getRemotes(true)
    const remoteUrl = remotes.find((remote) => remote.name === remoteUrlName)
    if (!remoteUrl) {
      throw Error(`Remote url with name ${remoteUrlName} not exists`)
    }
    const branch = (await git.branch()).current

    const message = await upgradeDeployment(
      deploymentName,
      `${remoteUrl.refs.fetch}#${branch}`
    )
    this.log(message)
  }
}
