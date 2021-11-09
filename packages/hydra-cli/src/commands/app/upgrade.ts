import { Command, flags } from '@oclif/command'
import { upgradeDeployment } from '../../rest-client/routes/upgradeDeployment'
import Debug from 'debug'
import simpleGit, {
  RemoteWithRefs,
  SimpleGit,
  SimpleGitOptions,
} from 'simple-git'
import cliSelect from 'cli-select'

const debug = Debug('qnode-cli:upgrade')
const options: Partial<SimpleGitOptions> = {
  baseDir: process.cwd(),
  binary: 'git',
}
const git: SimpleGit = simpleGit(options)

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

    let remoteUrl: RemoteWithRefs
    const remotes = await git.getRemotes(true)
    if (remotes.length === 0) {
      this.error(`The remotes were not found`, { code: '1' })
    } else if (remotes.length === 1) {
      remoteUrl = remotes[0]
    } else {
      const selected = await cliSelect({
        cleanup: false,
        values: remotes.map((remote) => remote.name),
      }).catch(() => {
        this.error('Canceled', { code: '1' })
      })
      remoteUrl = remotes.find(
        (remote) => remote.name === selected.value
      ) as RemoteWithRefs
    }
    await git.listRemote([remoteUrl.name]).catch(() => {
      this.error(`Remote url with name ${remoteUrl.name} not exists`, {
        code: '1',
      })
    })
    const branch = (await git.branch()).current

    this.log(`🦑 Releasing (upgrade) the Squid at ${remoteUrl.name}`)
    const message = await upgradeDeployment(
      deploymentName,
      `${remoteUrl.refs.fetch}#${branch}`
    )
    this.log(message)
  }
}
