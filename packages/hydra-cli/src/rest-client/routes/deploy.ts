import { baseUrl } from '../baseUrl'

export type ResponseBody = {
  id: string
  status: 'CREATED' | 'DEPLOYING' | 'ERROR' | 'OK'
  name: string
  artifactUrl: string
  version: number
}

export async function deploy(
  deploymentName: string,
  artifactUrl: string
): Promise<string> {
  const apiUrl = `${baseUrl}/client/deployment`
  const response = await fetch(apiUrl, {
    method: 'post',
    body: JSON.stringify({
      name: deploymentName,
      artifactUrl,
    }),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    headers: { 'Content-Type': 'application/json' },
  })
  const message = JSON.stringify(await response.json())
  if (response.status === 200) {
    return `Success, message: ${message}`
  } else {
    throw new Error(`Failed, status ${response.status}, message: ${message}`)
  }
}
