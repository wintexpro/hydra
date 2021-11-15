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
import { upgradeDeployment } from '../../rest-client/routes/upgrade'

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
    version: flags.string({
      char: 'v',
      description: 'version name',
      required: true,
    }),
    description: flags.string({
      char: 'd',
      description: 'description',
      required: false,
    }),
    logo: flags.string({
      char: 'l',
      description: 'logo url',
      required: false,
    }),
    source: flags.string({
      char: 's',
      description: 'source code url',
      required: true,
    }),
    website: flags.string({
      char: 'w',
      description: 'website url',
      required: false,
    }),
  }

  async run(): Promise<void> {
    const { flags } = this.parse(Deploy)
    debug(`Parsed flags: ${JSON.stringify(flags, null, 2)}`)
    const deploymentName = flags.name
    const version = flags.version
    const description = flags.description
    const logoUrl = flags.logo
    const sourceCodeUrl = flags.source
    const websiteUrl = flags.website

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
    const status = await git.status()
    if (status.files && status.files.length) {
      this.error(`There are unstaged or uncommitted changes`)
    }
    await git.fetch()
    const remoteBranchRefs = await git.listRemote([
      `${remoteUrl.name}`,
      `${branch}`,
    ])
    if (remoteBranchRefs === '') {
      this.error(`Remote branch "${remoteUrl.name}/${branch}" not exists`)
    }
    const localCommit = await git.log([
      '-n',
      1,
      branch,
    ] as LogOptions<DefaultLogFields>)
    const remoteCommit = await git.log([
      '-n',
      1,
      `${remoteUrl.name}/${branch}`,
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
    const createDeploymentMessage = await deploy(
      deploymentName,
      sourceCodeUrl,
      description,
      logoUrl,
      websiteUrl
    )
    this.log(createDeploymentMessage)
    const upgradeDeploymentMessage = await upgradeDeployment(
      deploymentName,
      version,
      `${remoteUrl.refs.fetch}#${remoteCommit.latest.hash}`
    )
    this.log(upgradeDeploymentMessage)
  }
}
