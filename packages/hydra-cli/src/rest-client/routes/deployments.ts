import { baseUrl } from '../baseUrl'
import { getCreds } from '../../creds'
import { request } from '../request'

type DeploymentListResponse = {
  id: number
  name: string
  description: string
  logoUrl: string
  sourceCodeUrl: string
  websiteUrl: string
}

export async function deploymentList(): Promise<
  DeploymentListResponse[] | undefined
> {
  const apiUrl = `${baseUrl}/client/project`
  const response = await request(apiUrl, {
    method: 'get',
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json',
      authorization: `token ${getCreds()}`,
    },
  })
  const responseBody: DeploymentListResponse[] = await response.json()
  if (response.status === 200) {
    return responseBody
  }
}
