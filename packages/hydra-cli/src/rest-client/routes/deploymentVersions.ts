import { baseUrl } from '../baseUrl'
import { getCreds } from '../../creds'
import { request } from '../request'

type DeploymentVersionStatus = 'CREATED' | 'BUILDING' | 'ERROR' | 'OK'

export type DeploymentVersionListResponse = {
  name: string
  version: string
  artifactUrl: string
  deploymentUrl: string
  status: DeploymentVersionStatus
  createdAt: number
}

export async function deploymentVersionList(
  deploymentName: string
): Promise<DeploymentVersionListResponse[] | undefined> {
  const apiUrl = `${baseUrl}/client/project/${deploymentName}/versions`
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
