import { Command, flags } from '@oclif/command'
import simpleGit, { SimpleGit, SimpleGitOptions } from 'simple-git'
import Debug from 'debug'
import { deploy } from '../rest-client/routes/deploy'
import { cli } from 'cli-ux'

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

    const remotes = await git.getRemotes(true)
    let remotesCLIList = ''
    for (let i = 1; i <= remotes.length; i++) {
      remotesCLIList += `\n${i}. ${remotes[i - 1].name}`
    }
    const remoteNumber = await cli.prompt(
      `Enter corresponding remote number: ${remotesCLIList}\n`,
      { required: true }
    )
    const remoteUrl = remotes[Number(remoteNumber) - 1]
    if (remoteUrl === undefined) {
      throw Error(`Incorrect input`)
    }
    const currentBranch = (await git.branch()).current

    // show warning if head origin commit is not the same as the
    // local origin commit or there are unstaged or uncomitted changes
    const status = await git.status()
    const diffs = await git.diffSummary([
      currentBranch,
      `${remoteUrl.name}`,
      `${currentBranch}`, // TODO check on real case!
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
      const enterResult = await cli.prompt(
        `Are you sure (enter corresponding remote number): \n1.yes\n[any other key].no\n`,
        { required: true }
      )
      if (enterResult !== '1') {
        this.log('Canceled')
        return
      }
    }

    const message = await deploy(
      deploymentName,
      `${remoteUrl.refs.fetch}#${currentBranch}`
    )
    this.log(message)
  }
}
