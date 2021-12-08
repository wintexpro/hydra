import { Command, flags } from '@oclif/command'
import Debug from 'debug'
import { updateSquid } from '../../rest-client/routes/update'

const debug = Debug('qnode-cli:update')

export default class Update extends Command {
  static description = 'Update squid'
  static args = [
    {
      name: 'name',
      description: 'squid name',
      required: true,
    },
  ]

  static flags = {
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
      required: false,
    }),
    website: flags.string({
      char: 'w',
      description: 'website url',
      required: false,
    }),
  }

  async run(): Promise<void> {
    const { flags, args } = this.parse(Update)
    debug(`Parsed flags: ${JSON.stringify(flags, null, 2)}, args: ${args}`)
    const name = args.name
    const description = flags.description
    const logoUrl = flags.logo
    const sourceCodeUrl = flags.source
    const websiteUrl = flags.website

    this.log(`🦑 Updating ${name}`)
    const message = await updateSquid(
      name,
      description,
      logoUrl,
      sourceCodeUrl,
      websiteUrl
    )
    this.log(message)
  }
}
