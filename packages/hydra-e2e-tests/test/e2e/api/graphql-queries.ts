import { gql } from 'graphql-request'

// to be replaced with a ws subsription
export const GET_INDEXER_HEAD = gql`
  query {
    indexerStatus {
      head
    }
  }
`

export const SUBSTRATE_EVENTS_LIMIT_BY_ONE = gql`
  query {
    substrate_event(limit: 1) {
      blockTimestamp
    }
  }
`

export const FIND_TRANSFER_BY_VALUE = gql`
  query FindTransferByValue($value: BigInt, $block: Int) {
    transfers(where: { value_eq: $value, block_eq: $block }) {
      value
      to
      from
      block
      fromAccount {
        hex
      }
      toAccount {
        hex
      }
      extrinsicId
    }
  }
`

export const ACCOUNTS_BY_VALUE_GT_SOME = gql`
  query accountsByValueGtSome($value: BigInt) {
    accounts(where: { outgoingTx_some: { value_gt: $value } }) {
      id
    }
  }
`

export const ACCOUNTS_BY_VALUE_GT_EVERY = gql`
  query accountsByValueGtEvery($value: BigInt) {
    accounts(where: { outgoingTx_every: { value_gt: $value } }) {
      id
    }
  }
`

export const ACCOUNTS_BY_VALUE_GT_NONE = gql`
  query accountsByValueGtNone($value: BigInt) {
    accounts(where: { outgoingTx_none: { value_gt: $value } }) {
      id
    }
  }
`

export const FTS_COMMENT_QUERY = gql`
  query Search($text: String!) {
    commentSearch(text: $text) {
      highlight
    }
  }
`

export const FETCH_INSERTED_AT_FIELD_FROM_TRANSFER = gql`
  query {
    transfers(limit: 1) {
      insertedAt
      createdAt
      updatedAt
      timestamp
    }
  }
`

export const FTS_COMMENT_QUERY_WITH_WHERE_CONDITION = gql`
  query Search($text: String!, $skip: Int, $from: Bytes!) {
    commentSearch(text: $text, skip: $skip, whereTransfer: { from_eq: $from }) {
      highlight
      rank
    }
  }
`

export const LAST_BLOCK_TIMESTAMP = gql`
  query {
    blockTimestamps(limit: 1, orderBy: blockNumber_DESC) {
      timestamp
    }
  }
`

// export const INTERFACE_TYPES_WITH_RELATIONSHIP = gql`
//   query InterfaceQuery {
//     events {
//       indexInBlock
//       ... on BoughtMemberEvent {
//         inExtrinsic {
//           id
//           hash
//         }
//       }
//     }
//   }
// `

export const PROCESSOR_SUBSCRIPTION = gql`
  subscription {
    stateSubscription {
      indexerHead
      chainHead
      lastProcessedEvent
      lastCompleteBlock
    }
  }
`

export const HOOKS = gql`
  query {
    blockHooks {
      blockNumber
      type
    }
  }
`

export const TRANSFER_IN_QUERY = gql`
  query {
    transfers(
      where: { id_in: ["xxxx", "yyyy"], fromAccount: { hex_endsWith: "abc" } }
    ) {
      id
    }
  }
`

export const VARIANT_FILTER_MISREABLE_ACCOUNTS = gql`
  query {
    accounts(where: { status_json: { isTypeOf_eq: "Miserable" } }) {
      status {
        __typename
        ... on Miserable {
          hates
        }
      }
    }
  }
`

export const EVENT_INTERFACE_QUERY = gql`
  query {
    events(
      where: { inBlock_lt: 2, type_in: [EventA, EventB, EventC] }
      orderBy: [indexInBlock_DESC, network_DESC]
    ) {
      indexInBlock
      inExtrinsic
      network
      ... on EventA {
        field1
      }
      ... on EventB {
        field2
      }
      ... on EventC {
        field3
        complexField {
          arg1
          arg2
        }
      }
    }
  }
`

export const INTERFACES_FILTERING_BY_ENUM = gql`
  query InterfaceQuery {
    events(where: { type_in: [EventA] }) {
      indexInBlock
    }
  }
`

export const TYPED_JSONFIELD_FILTERING = gql`
  query {
    systemEvents {
      params {
        name
        type
        value
        additionalData {
          data
        }
      }
    }
  }
`

export const ARRAY_FIELD_QUERY_ANY = gql`
  query {
    systemEvents(where: { arrayField_containsAny: ["aaa"] }) {
      id
    }
  }
`
