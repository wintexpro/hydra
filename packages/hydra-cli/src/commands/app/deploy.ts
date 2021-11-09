import { Command, flags } from '@oclif/command'
import simpleGit, {
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

    // show warning if head origin commit is not the same as the
    // local origin commit or there are unstaged or uncomitted changes
    const status = await git.status()
    const diffs = await git.diffSummary([
      currentBranch,
      `${remoteUrl.name}`,
      `${currentBranch}`,
    ])
    if (
      (status.files && status.files.length) ||
      diffs.changed ||
      diffs.deletions ||
      diffs.insertions ||
      (diffs.files && diffs.files.length)
    ) {
      this.warn(
        `Head origin commit is not the same as the local origin commit or there are unstaged or uncomitted changes`
      )
      this.log(`Are you sure?`)
      const selected = await cliSelect({
        cleanup: false,
        values: ['yes', 'no'],
      }).catch(() => {
        this.error('Canceled', { code: '1' })
      })
      if (selected.value === 'no') {
        this.error('Canceled', { code: '1' })
      }
    }

    this.log(`🦑 Releasing the Squid at ${remoteUrl.name}`)
    const message = await deploy(
      deploymentName,
      `${remoteUrl.refs.fetch}#${currentBranch}`
    )
    this.log(message)
  }
}
