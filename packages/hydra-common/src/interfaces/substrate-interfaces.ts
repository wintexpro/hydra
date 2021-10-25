export interface EventParam {
  type: string
  name: string
  value: unknown
}

export interface ExtrinsicArg {
  type: string
  name: string
  value: unknown
}

export interface EventInfo {
  id: string
  name: string
  extrinsic: string
}

export interface ExtrinsicInfo {
  id: string
  name: string
}

export interface SubstrateBlock {
  /**
   * Unique block id, following the format <block height>-<first hex digits of the hash>
   */
  id: string

  /**
   * Current block hash
   */
  hash: string

  /**
   * Block height
   */
  height: number

  /**
   * Block timestamp as set by timestamp.now()
   */
  timestamp: number

  /**
   * Hash of the parent block
   */
  parentHash: string

  /**
   * State Merkle root
   */
  stateRoot: string

  /**
   * Extrinsics Merkle root
   */
  extrinsicsRoot: string

  /**
   * Raw JSON with substrate runtime version
   */
  runtimeVersion: unknown

  /**
   * Raw JSON with last runtime upgrade information
   */
  lastRuntimeUpgrade: unknown

  /**
   * An array with basic event information
   */
  events: EventInfo[]

  /**
   * An array with basic extrinsic information
   */
  extrinsics: ExtrinsicInfo[]
}

export interface SubstrateEvent {
  /**
   * Event name, in the form section.method
   */
  name: string

  /**
   * Event method (as defined in the runtime metadata)
   */
  method: string

  /**
   * Event section
   */
  section?: string

  /**
   * Array of raw JSON object with event parameters
   */
  params: Array<EventParam>

  /**
   * Ordinal index in the event array of the current block
   */
  indexInBlock: number

  /**
   * Event id, in the form <blockNumber>-<index>
   */
  id: string

  /**
   * Block height it appeared in
   */
  blockNumber: number

  /**
   * If it was emitted in the ApplyExtrinsic phase, the undeflying extrinsic information
   */
  extrinsic?: SubstrateExtrinsic

  /**
   * Timestamp of the block, as set by call timestamp.now()
   */
  blockTimestamp: number
}

/**
 * Interface representing the raw extrinsic data fetch from the block
 */
export interface SubstrateExtrinsic {
  /**
   * extrinsic id
   */
  id: string

  /**
   * extrinsic method
   */
  method: string

  /**
   * extrinsic section
   */
  section: string

  /**
   * extrinsic version information
   */
  versionInfo?: string

  /**
   * Raw JSON with extrinsic metadata information
   */
  meta?: unknown

  /**
   * Raw JSON with extrinsic era
   */
  era?: unknown

  /**
   * Hex string representing the extrinsic signer
   */
  signer: string

  /**
   * An array of raw JSON with extrinsic arguments
   */
  args: ExtrinsicArg[]

  /**
   * Hex string with the signature
   */
  signature?: string

  /**
   * Hex string of the extrinsic hash
   */
  hash?: string

  /**
   * Extrinsic tip
   */
  tip: bigint

  /**
   * Ordinal index in the event array of the current block
   */
  indexInBlock: number
}
