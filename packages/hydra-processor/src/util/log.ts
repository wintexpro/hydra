import { truncateSync } from 'fs'
import { format, transports, loggers, Logger } from 'winston'

const isLogToConsole = process.env.LOG_TO_CONSOLE === 'true'
const isBlessedLogs = process.env.BLESSED_LOGS === 'true'

const systemFormat = format.printf(({ level, message, label }) => {
  return `['SYSTEM'] ${level} ${label || ''}: ${message}`
})
const userFormat = format.printf(({ level, message, label }) => {
  return `['USER'] ${level} ${label || ''}: ${message}`
})
const systemLogFileName = `system-${Date.now()}.log`
const userLogFileName = `user-${Date.now()}.log`

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

export const system = loggers.get('system')
export const user = loggers.get('user')

// optional blessed terminal
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let logProgress = (_n: number): void => {
  return undefined
}
if (isBlessedLogs) {
  import('./blessed-terminal').then((blessed) => {
    system.stream({ start: -1 }).on('log', function (log) {
      blessed.logToSystemBox(log.message)
    })

    user.stream({ start: -1 }).on('log', function (log) {
      blessed.logToUserBox(log.message)
    })
    blessed.screen.render()
    logProgress = (percent: number): void => {
      blessed.logProgress(percent)
    }
  })
}

export { logProgress }
declare global {
  namespace NodeJS {
    interface Global {
      log: Logger
    }
  }
  const log: Logger
}
global.log = user
