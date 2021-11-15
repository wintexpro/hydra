import { baseUrl } from '../baseUrl'
import { getCreds } from '../../creds'
import { request } from '../request'

export async function destroyVersion(
  deploymentName: string,
  version: number
): Promise<string | undefined> {
  const apiUrl = `${baseUrl}/client/project/${deploymentName}/version?version=${version}`
  const response = await request(apiUrl, {
    method: 'delete',
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json',
      authorization: `token ${getCreds()}`,
    },
  })
  const responseBody = await response.json()
  if (response.status === 200) {
    return `Destroyed deployment version with name ${responseBody.projectName}`
  }
}

export async function destroyDeployment(
  deploymentName: string
): Promise<string | undefined> {
  const apiUrl = `${baseUrl}/client/project/${deploymentName}`
  const response = await request(apiUrl, {
    method: 'delete',
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json',
      authorization: `token ${getCreds()}`,
    },
  })
  const responseBody = await response.json()
  if (response.status === 200) {
    return `Destroyed deployment version with name ${responseBody.name}`
  }
}
