import { user } from './log'
import { Logger } from 'winston'

export namespace NodeJS {
  export interface Global {
    log: (message: string) => Logger
  }
}
global.log = user
