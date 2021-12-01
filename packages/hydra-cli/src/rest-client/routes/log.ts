import { baseUrl } from '../baseUrl'
import { getCreds } from '../../creds'
import queryString from 'query-string'
import * as fetch from 'node-fetch'

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

  // using not wrapped fetch fro better streaming (.clone in wrap breaks body stream)
  const response = await fetch.default(`${apiUrl}?${params}`, {
    method: 'get',
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json',
      authorization: `token ${getCreds()}`,
    },
  })
  response.body.on('data', (data) => {
    const dataString = data.toString()
    if (dataString.length > 0) {
      process.stdout.write(dataString)
    }
  })
}
