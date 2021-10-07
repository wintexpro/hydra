import { truncateSync } from 'fs'
import { format, transports, loggers, Logger } from 'winston'
import { blessedLogger } from './blessed-terminal'

const isLogToConsole = process.env.CONSOLE === 'true'

const systemFormat = format.printf(({ level, message, label }) => {
  return `['SYSTEM'] ${level} ${label || ''}: ${message}`
})
const userFormat = format.printf(({ level, message, label }) => {
  return `['USER'] ${level} ${label || ''}: ${message}`
})
const systemLogFileName = 'system.log'
const userLogFileName = 'user.log'

loggers.add('system', {
  levels: {
    error: 0,
    warn: 1,
    info: 3,
    debug: 4,
  },
  level: 'debug',
  transports: [
    isLogToConsole // TODO
      ? new transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple(),
            systemFormat
          ),
        })
      : new transports.File({
          filename: systemLogFileName,
          // note: winston.stream().on() works only with json-formatted logs
          format: format.combine(format.json(), format.splat()),
        }),
  ],
})
loggers.add('user', {
  levels: {
    error: 0,
    warn: 1,
    info: 3,
    debug: 4,
  },
  level: 'debug',
  transports: [
    isLogToConsole // TODO
      ? new transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple(),
            userFormat
          ),
        })
      : new transports.File({
          filename: userLogFileName,
          // note: winston.stream().on() works only with json-formatted logs
          format: format.combine(format.json(), format.splat()),
        }),
  ],
})

truncateSync(systemLogFileName)
truncateSync(userLogFileName)

export const system = loggers.get('system')
export const user = loggers.get('user')

system.stream({ start: -1 }).on('log', function (log) {
  blessedLogger.logToSystemBox(log.message)
})

user.stream({ start: -1 }).on('log', function (log) {
  blessedLogger.logToUserBox(log.message)
})

export {}
declare global {
  namespace NodeJS {
    interface Global {
      log: Logger
    }
  }
  const log: Logger
}
global.log = user
