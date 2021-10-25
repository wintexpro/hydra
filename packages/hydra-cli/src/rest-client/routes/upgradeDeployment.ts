import { baseUrl } from '../baseUrl'
import { getCreds } from '../../creds'
import { request } from '../request'

export async function upgradeDeployment(
  deploymentName: string,
  artifactUrl?: string
): Promise<string | undefined> {
  const apiUrl = `${baseUrl}/client/deployment/${deploymentName}`
  const response = await request(apiUrl, {
    method: 'put',
    body: JSON.stringify({
      artifactUrl,
    }),
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json',
      authorization: `token ${getCreds()}`,
    },
  })
  const responseBody = await response.json()
  if (response.status === 200) {
    return `Upgraded deployment with name ${responseBody.name}`
  } else if (response.status === 404) {
    return 'Deployment not exists'
  }
}
