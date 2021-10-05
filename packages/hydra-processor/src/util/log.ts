import { format, transports, loggers, Logger } from 'winston'

const isLogToConsole = process.env.CONSOLE === 'true'

const systemFormat = format.printf(({ level, message, label }) => {
  return `['SYSTEM'] ${level} ${label || ''}: ${message}`
})

const userFormat = format.printf(({ level, message, label }) => {
  return `['USER'] ${level} ${label || ''}: ${message}`
})

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
          filename: 'system.log',
          format: format.combine(format.simple(), format.splat(), systemFormat),
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
          filename: 'user.log',
          format: format.combine(format.simple(), format.splat(), userFormat),
        }),
  ],
})

export const system = loggers.get('system')
export const user = loggers.get('user')

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
