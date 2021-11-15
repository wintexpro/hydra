import { Command, flags } from '@oclif/command'
import simpleGit, {
  DefaultLogFields,
  LogOptions,
  RemoteWithRefs,
  SimpleGit,
  SimpleGitOptions,
} from 'simple-git'
import Debug from 'debug'
import { deploy } from '../../rest-client/routes/deploy'
import cliSelect from 'cli-select'

const debug = Debug('qnode-cli:deploy')
const options: Partial<SimpleGitOptions> = {
  baseDir: process.cwd(),
  binary: 'git',
}
const git: SimpleGit = simpleGit(options)

export default class Deploy extends Command {
  static description = 'Deploy'

  static flags = {
    name: flags.string({
      char: 'n',
      description: 'Deployment name',
      required: true,
    }),
  }

  async run(): Promise<void> {
    const { flags } = this.parse(Deploy)
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

    const currentBranch = (await git.branch()).current
    const status = await git.status()
    if (status.files && status.files.length) {
      this.error(`There are unstaged or uncomitted changes`)
    }
    await git.fetch()
    const localCommit = await git.log([
      '-n',
      1,
      currentBranch,
    ] as LogOptions<DefaultLogFields>)
    const remoteCommit = await git.log([
      '-n',
      1,
      `${remoteUrl.name}/${currentBranch}`,
    ] as LogOptions<DefaultLogFields>)
    if (
      !localCommit.latest ||
      !remoteCommit.latest ||
      localCommit.latest.hash !== remoteCommit.latest.hash
    ) {
      this.error(
        `Head origin commit is not the same as the local origin commit`
      )
    }

    this.log(`🦑 Releasing the Squid at ${remoteUrl.name}`)
    const message = await deploy(
      deploymentName,
      `${remoteUrl.refs.fetch}#${remoteCommit.latest.hash}`
    )
    this.log(message)
  }
}
