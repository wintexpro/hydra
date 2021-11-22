import { baseUrl } from '../baseUrl'
import { getCreds } from '../../creds'
import { request } from '../request'
import queryString from 'query-string'
export async function log(
  name: string,
  version: string,
  follow: boolean,
  lines: number
): Promise<void> {
  const apiUrl = `${baseUrl}/client/project/${name}/logs`
  const params = queryString.stringify({
    version,
    follow,
    lines,
  })
  const response = await request(`${apiUrl}?${params}`, {
    method: 'get',
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json',
      authorization: `token ${getCreds()}`,
    },
  })
  response.body.on('data', console.log)
  response.body.on('finish', () => console.log('Finished'))
}
