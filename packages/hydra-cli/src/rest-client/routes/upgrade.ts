import { baseUrl } from '../baseUrl'
import { getCreds } from '../../creds'
import { request } from '../request'

export async function upgradeDeployment(
  deploymentName: string,
  version: string,
  artifactUrl: string
): Promise<string | undefined> {
  const apiUrl = `${baseUrl}/client/project/${deploymentName}/version`
  const response = await request(apiUrl, {
    method: 'post',
    body: JSON.stringify({
      artifactUrl,
      version,
    }),
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json',
      authorization: `token ${getCreds()}`,
    },
  })
  const responseBody = await response.json()
  if (response.status === 200) {
    return `Created new version of deployment with name ${responseBody.name}, version: ${version}`
  } else if (response.status === 404) {
    return 'Deployment not exists'
  }
}
