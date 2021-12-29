import Command from '@oclif/command'
import cliSelect from 'cli-select'
import cli from 'cli-ux'
import {
  DefaultLogFields,
  LogOptions,
  RemoteWithRefs,
  SimpleGit,
} from 'simple-git'
import {
  DeployPipelineStatusEnum,
  getDeployPipeline,
} from '../rest-client/routes/pipeline'

export function parseNameAndVersion(
  nameAndVersion: string,
  command: Command
): {
  squidName: string
  versionName: string
} {
  if (
    (nameAndVersion.match(/.+@.+/gi) || []).length === 0 ||
    (nameAndVersion.match(/@/g) || []).length !== 1
  ) {
    command.error(
      'Required format: <name>@<version>. Symbol @ not allowed in names'
    )
  }
  const squidName = nameAndVersion.split('@')[0]
  const versionName = nameAndVersion.split('@')[1]
  return { squidName, versionName }
}

function buildPipelineErrorMessage(text: string, errorMessage: string): string {
  return `${text} ${errorMessage ? `: ${errorMessage}` : ''}`
}

export async function pollDeployPipelines(
  squidName: string,
  versionName: string,
  deploymentUrl: string,
  command: Command
): Promise<void> {
  let inProgress = true
  let lastStatus
  while (inProgress) {
    const pipeline = await getDeployPipeline(squidName, versionName)
    if (pipeline) {
      if (pipeline.status !== lastStatus) {
        lastStatus = pipeline.status
        cli.action.stop('✔️')
      }
      switch (pipeline?.status) {
        case DeployPipelineStatusEnum.CREATED:
          cli.action.start('◷ Preparing your squid')
          if (pipeline.isErrorOccurred) {
            command.error(
              buildPipelineErrorMessage(
                `❌ An error occurred during building process`,
                pipeline.comment
              )
            )
          }
          break
        case DeployPipelineStatusEnum.IMAGE_BUILDING:
          cli.action.start('◷ Building your squid')
          if (pipeline.isErrorOccurred) {
            command.error(
              buildPipelineErrorMessage(
                `❌ An error occurred during building process`,
                pipeline.comment
              )
            )
          }
          break
        case DeployPipelineStatusEnum.IMAGE_PUSHING:
          cli.action.start('◷ Publishing your squid')
          if (pipeline.isErrorOccurred) {
            command.error(
              buildPipelineErrorMessage(
                `❌ An error occurred during pushing process`,
                pipeline.comment
              )
            )
          }
          break
        case DeployPipelineStatusEnum.DEPLOYING:
          cli.action.start('◷ Almost ready')
          if (pipeline.isErrorOccurred) {
            command.error(
              buildPipelineErrorMessage(
                `❌ An error occurred during deploying process`,
                pipeline.comment
              )
            )
          }
          break
        case DeployPipelineStatusEnum.OK:
          command.log(
            `◷ Your squid almost ready and will be accessible on ${deploymentUrl}`
          )
          inProgress = false
          break
        default:
          command.error('❌ An error occurred. Unexpected status of pipeline.')
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 3000))
  }
}

export async function buildRemoteUrlFromGit(
  git: SimpleGit,
  command: Command
): Promise<string> {
  let remoteUrl: RemoteWithRefs
  const remotes = await git.getRemotes(true)
  if (remotes.length === 0) {
    command.error(`The remotes were not found`, { code: '1' })
  } else if (remotes.length === 1) {
    remoteUrl = remotes[0]
  } else {
    const selected = await cliSelect({
      cleanup: false,
      values: remotes.map((remote) => remote.name),
    }).catch(() => {
      command.error('Canceled', { code: '1' })
    })
    remoteUrl = remotes.find(
      (remote) => remote.name === selected.value
    ) as RemoteWithRefs
  }
  await git.listRemote([remoteUrl.name]).catch(() => {
    command.error(`Remote url with name ${remoteUrl.name} not exists`, {
      code: '1',
    })
  })
  const branch = (await git.branch()).current
  const status = await git.status()
  if (status.files && status.files.length) {
    command.error(`There are unstaged or uncommitted changes`)
  }
  await git.fetch()
  const remoteBranchRefs = await git.listRemote([
    `${remoteUrl.name}`,
    `${branch}`,
  ])
  if (remoteBranchRefs === '') {
    command.error(`Remote branch "${remoteUrl.name}/${branch}" not exists`)
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
    command.error(
      `Head origin commit is not the same as the local origin commit`
    )
  }
  return `${remoteUrl.refs.fetch}${
    remoteUrl.refs.fetch.endsWith('.git') ? '' : '.git'
  }#${remoteCommit.latest.hash}`
}
