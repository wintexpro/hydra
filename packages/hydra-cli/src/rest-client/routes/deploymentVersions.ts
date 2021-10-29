import { baseUrl } from '../baseUrl'
import { getCreds } from '../../creds'
import { request } from '../request'

export type DeploymentVersionStatus = 'CREATED' | 'BUILDING' | 'ERROR' | 'OK'

export type DeploymentVersionListResponse = {
  name: string
  version: number
  tag: string
  artifactUrl: string
  status: DeploymentVersionStatus
  createdAt: number
}

export async function deploymentVersionList(
  deploymentName: string
): Promise<DeploymentVersionListResponse[] | undefined> {
  const apiUrl = `${baseUrl}/client/deployment/${deploymentName}/versions`
  const response = await request(apiUrl, {
    method: 'get',
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json',
      authorization: `token ${getCreds()}`,
    },
  })
  const responseBody: DeploymentVersionListResponse[] = await response.json()
  if (response.status === 200) {
    return responseBody
  }
}
