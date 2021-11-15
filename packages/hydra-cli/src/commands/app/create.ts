import { Command, flags } from '@oclif/command'
import Debug from 'debug'
import { deploy } from '../../rest-client/routes/deploy'

const debug = Debug('qnode-cli:create')

export default class Create extends Command {
  static description = 'Create'

  static flags = {
    name: flags.string({
      char: 'n',
      description: 'Deployment name',
      required: true,
    }),
    description: flags.string({
      char: 'd',
      description: 'description',
      required: false,
    }),
    logo: flags.string({
      char: 'l',
      description: 'logo url',
      required: false,
    }),
    source: flags.string({
      char: 's',
      description: 'source code url',
      required: true,
    }),
    website: flags.string({
      char: 'w',
      description: 'website url',
      required: false,
    }),
  }

  async run(): Promise<void> {
    const { flags } = this.parse(Create)
    debug(`Parsed flags: ${JSON.stringify(flags, null, 2)}`)
    const deploymentName = flags.name
    const description = flags.description
    const logoUrl = flags.logo
    const sourceCodeUrl = flags.source
    const websiteUrl = flags.website

    const createDeploymentMessage = await deploy(
      deploymentName,
      sourceCodeUrl,
      description,
      logoUrl,
      websiteUrl
    )
    this.log(createDeploymentMessage)
  }
}
