import { baseUrl } from '../baseUrl'
import { getCreds } from '../../creds'
import { request } from '../request'
import { DeploymentVersionStatus } from './deploymentVersions'

type ResponseBody = {
  id: string
  name: string
  aliasVersion: string
  deploymentUrl: string
  deploymentVersion: {
    name: string
    version: number
    tag: string
    artifactUrl: string
    status: DeploymentVersionStatus
    createdAt: number
  }
}

export type DeploymentListResponse = {
  id: string
  status: DeploymentVersionStatus
  deployment: string // name
  aliasVersion: string
  deploymentVersion: string // name
  artifactUrl: string
  deploymentUrl: string
  tag: string
  createdAt: number
}

export async function deploymentList(): Promise<
  DeploymentListResponse[] | undefined
> {
  const apiUrl = `${baseUrl}/client/deployment`
  const response = await request(apiUrl, {
    method: 'get',
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json',
      authorization: `token ${getCreds()}`,
    },
  })
  const responseBody: ResponseBody[] = await response.json()
  if (response.status === 200) {
    const deploymentList: DeploymentListResponse[] = []
    if (Array.isArray(responseBody) && responseBody.length) {
      responseBody.forEach((deployment) =>
        deploymentList.push({
          id: deployment.id,
          status: deployment.deploymentVersion?.status,
          deployment: deployment.name,
          aliasVersion: deployment.aliasVersion,
          deploymentVersion: deployment.deploymentVersion?.name,
          artifactUrl: deployment.deploymentVersion?.artifactUrl,
          deploymentUrl: deployment.deploymentUrl,
          tag: deployment.deploymentVersion?.tag,
          createdAt: deployment.deploymentVersion?.createdAt,
        })
      )
    }
    return deploymentList
  }
}
