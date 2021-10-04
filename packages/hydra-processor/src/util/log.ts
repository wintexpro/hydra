import { format, transports, loggers, Logger } from 'winston'

const isLogToConsole = process.env.CONSOLE === 'true'

loggers.add('system', {
  levels: {
    error: 0,
    warn: 1,
    info: 3,
  },
  transports: [
    isLogToConsole // TODO
      ? new transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple(),
            format.label({ label: 'SYSTEM' }),
            format.printf(({ level, message, label }) => {
              return `[${label}] ${level}: ${message}`
            })
          ),
        })
      : new transports.File({
          filename: 'system.log',
          format: format.combine(
            format.simple(),
            format.splat(),
            format.label({ label: 'SYSTEM' }) // TODO ставить метку, когда пишем в консоль
          ),
        }),
  ],
})
loggers.add('user', {
  levels: {
    error: 0,
    warn: 1,
    info: 3,
  },
  transports: [
    isLogToConsole // TODO
      ? new transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple(),
            format.label({ label: 'USER' }),
            format.printf(({ level, message, label }) => {
              return `[${label}] ${level}: ${message}`
            })
          ),
        })
      : new transports.File({
          filename: 'user.log',
          format: format.combine(
            format.simple(),
            format.splat(),
            format.label({ label: 'USER' }) // TODO ставить метку, когда пишем в консоль
          ),
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
