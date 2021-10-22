import YAML from 'yaml'
import YamlValidator from 'yaml-validator'
import fs from 'fs'
import path from 'path'
import semver from 'semver'
import { camelCase, upperFirst, compact } from 'lodash'
import { HandlerFunc } from './QueryEventProcessingPack'
import { Range, parseRange, system } from '../util'

export const STORE_CLASS_NAME = 'DatabaseManager'
export const CONTEXT_CLASS_NAME = 'SubstrateEvent'
export const EVENT_SUFFIX = 'Event'
export const CALL_SUFFIX = 'Call'

const label = 'hydra-processor:manifest'

const manifestValidatorOptions = {
  structure: {
    version: 'string',
    'description?': 'string',
    'repository?': 'string',
    'indexerVersionRange?': 'string',
    mappings: {
      mappingsModule: 'string',
      'imports?': ['string'],
      'range?': 'string',
      'eventHandlers?': [
        {
          event: 'string',
          handler: 'string',
          'filter?': {
            'height?': 'string',
            'specVersion?': 'string',
          },
        },
      ],
      'extrinsicHandlers?': [
        {
          extrinsic: 'string',
          handler: 'string',
          'triggerEvents?': ['string'],
          'filter?': {
            'height?': 'string',
            'specVersion?': 'string',
          },
        },
      ],
      'preBlockHooks?': [
        {
          handler: 'string',
          'filter?': {
            'height?': 'string',
          },
        },
      ],
      'postBlockHooks?': [
        {
          handler: 'string',
          'filter?': {
            'height?': 'string',
          },
        },
      ],
    },
  },

  onWarning: function (error: unknown, filepath: unknown) {
    throw new Error(`${filepath} has error: ${JSON.stringify(error)}`)
  },
}

interface HandlerInput {
  handler: string
  filter?: {
    height?: string
    specVersion?: string
  }
}

interface MappingsDefInput {
  mappingsModule: string
  range?: string
  imports?: string[]
  eventHandlers?: Array<{ event: string } & HandlerInput>
  extrinsicHandlers?: Array<
    { extrinsic: string; triggerEvents?: string[] } & HandlerInput
  >
  preBlockHooks?: Array<HandlerInput>
  postBlockHooks?: Array<HandlerInput>
}

export interface MappingsDef {
  mappingsModule: Record<string, unknown>
  imports: string[]
  range: Range
  eventHandlers: EventHandler[]
  extrinsicHandlers: ExtrinsicHandler[]
  preBlockHooks: MappingHandler[]
  postBlockHooks: MappingHandler[]
}

export interface Filter {
  height: Range
  specVersion?: Range
}

export interface MappingHandler {
  filter: Filter
  handler: HandlerFunc
  types: string[]
}

export interface EventHandler extends MappingHandler {
  event: string
}

export interface ExtrinsicHandler extends MappingHandler {
  extrinsic: string
  triggerEvents: string[]
}

export function hasExtrinsic(
  handler: unknown
): handler is { extrinsic: string } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (handler as any).extrinsic !== undefined
}

export function hasEvent(handler: unknown): handler is { event: string } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (handler as any).event !== undefined
}

export interface ProcessorManifest {
  version: string
  description?: string
  repository?: string
  indexerVersionRange?: string
  mappings: MappingsDef
}

export function parseManifest(manifestLoc: string): ProcessorManifest {
  const validator = new YamlValidator(manifestValidatorOptions)
  validator.validate([manifestLoc])

  if (validator.report()) {
    throw new Error(
      `Failed to load the manifest file at location ${manifestLoc}: ${validator.logs.join(
        '\n'
      )}`
    )
  }

  const parsed = YAML.parse(fs.readFileSync(manifestLoc, 'utf8')) as {
    version: string
    hydraVersion: string
    indexerVersionRange?: string
    description?: string
    repository?: string
    mappings: MappingsDefInput
  }

  if (
    parsed.indexerVersionRange &&
    !semver.validRange(parsed.indexerVersionRange)
  ) {
    throw new Error(
      `Invalid indexer version range format: ${parsed.indexerVersionRange}. Make sure it satisfies the semver format`
    )
  }

  validate(parsed.mappings)

  return {
    ...parsed,
    mappings: buildMappingsDef(parsed.mappings),
  }
}

function validate(parsed: MappingsDefInput): void {
  if (
    parsed.eventHandlers === undefined &&
    parsed.extrinsicHandlers === undefined
  ) {
    throw new Error(`At least one event or extrinsic handler must be defined`)
  }
}

function buildMappingsDef(parsed: MappingsDefInput): MappingsDef {
  system.debug(`Parsed mappings def: ${JSON.stringify(parsed, null, 2)}`, {
    label,
  })
  const {
    mappingsModule,
    range,
    eventHandlers,
    extrinsicHandlers,
    preBlockHooks,
    postBlockHooks,
    imports,
  } = parsed

  if (mappingsModule === undefined) {
    throw new Error(`Cannot resolve mappings module ${mappingsModule}`)
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const resolvedModule = require(path.resolve(mappingsModule)) as Record<
    string,
    unknown
  >

  const globalRange = parseRange(range)

  const parseHandler = function (
    def:
      | (HandlerInput & {
          event: string
        })
      | (HandlerInput & { extrinsic: string })
      | HandlerInput
  ): MappingHandler {
    const { handler, filter } = def
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const name = handler
      ? extractName(handler)
      : defaultHandlerName(def as { event: string } | { extrinsic: string })

    return {
      ...def,
      filter: {
        height:
          filter && filter.height ? parseRange(filter.height) : globalRange,
        specVersion:
          filter && filter.specVersion
            ? parseRange(filter.specVersion)
            : undefined,
      },
      handler: resolveHandler(resolvedModule, name),
      types: extractTypes(handler),
    }
  }

  return {
    mappingsModule: resolvedModule,
    imports: [mappingsModule, ...(imports || [])].map((p) => path.resolve(p)),
    range: parseRange(range),
    eventHandlers: eventHandlers
      ? eventHandlers.map((item) => parseHandler(item) as EventHandler)
      : [],
    extrinsicHandlers: extrinsicHandlers
      ? extrinsicHandlers.map(
          (item) =>
            ({
              triggerEvents: item.triggerEvents || ['system.ExtrinsicSuccess'],
              ...parseHandler(item),
            } as ExtrinsicHandler)
        )
      : [],
    preBlockHooks: preBlockHooks
      ? preBlockHooks.map((name) => parseHandler(name))
      : [],
    postBlockHooks: postBlockHooks
      ? postBlockHooks.map((name) => parseHandler(name))
      : [],
  }
}

export function extractTypes(handler: string | undefined): string[] {
  if (handler === undefined) {
    return []
  }
  if (!handler.match(/\w+(\(\s*(([\w.]+(,\s*[\w.]+\s*)*))?\))?$/)) {
    throw new Error(`Malformed handler signature: ${handler}`)
  }

  const split = compact(handler.split(/[()]/))

  if (split.length === 1) {
    // it was of the form handlerName()
    return []
  }

  if (split.length !== 2) {
    throw new Error(`Cannot parse types from ${handler}`)
  }
  return compact(split[1].split(',')).map((s) => s.trim())
}

export function extractName(handler: string): string {
  if (handler.includes('(')) {
    return handler.split('(')[0]
  }
  return handler
}

export function defaultHandlerName(
  eventOrExtrinsic: { event: string } | { extrinsic: string }
): string {
  const input = hasExtrinsic(eventOrExtrinsic)
    ? eventOrExtrinsic.extrinsic
    : eventOrExtrinsic.event
  const suffix = hasExtrinsic(eventOrExtrinsic) ? CALL_SUFFIX : '' // no suffix for events
  const [module, name] = input.split('.').map((s) => s.trim())
  // module name camelcased, name pascalcased
  return `${camelCase(module)}_${upperFirst(camelCase(name))}${suffix}`
}

function resolveHandler(
  mappingsModule: Record<string, unknown>,
  name: string
): HandlerFunc {
  if (
    mappingsModule[name] === undefined ||
    typeof mappingsModule[name] !== 'function'
  ) {
    throw new Error(`Cannot resolve the handler ${name} in the mappings module`)
  }
  return mappingsModule[name] as HandlerFunc
}
