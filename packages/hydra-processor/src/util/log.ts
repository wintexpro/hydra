import { copyFileSync, truncateSync } from 'fs'
import { format, transports, loggers, Logger } from 'winston'

export enum LogMode {
  CONSOLE = 'CONSOLE',
  FILE = 'FILE',
  BLESSED = 'BLESSED',
  SERVER = 'SERVER',
}

export const logMode = process.env.LOG_MODE || LogMode.FILE
if (!Object.values(LogMode).includes(logMode as LogMode)) {
  const errorMessage = `LOG_MODE flag: invalid value ${logMode}. Possible values: ${Object.values(
    LogMode
  ).join(',')}`
  console.log(errorMessage)
  throw new Error(errorMessage)
}

const systemFormat = format.printf(({ level, message, label }) => {
  return `['SYSTEM'] ${level} ${label || ''}: ${message}`
})
const userFormat = format.printf(({ level, message, label }) => {
  return `['USER'] ${level} ${label || ''}: ${message}`
})
export const systemLogFileName = `system.log`
export const userLogFileName = `user.log`

loggers.add('system', {
  levels: {
    error: 0,
    warn: 1,
    info: 3,
    debug: 4,
  },
  level: 'debug',
})

loggers.add('user', {
  levels: {
    error: 0,
    warn: 1,
    info: 3,
    debug: 4,
  },
  level: 'debug',
})

const system = loggers.get('system')
const user = loggers.get('user')

if (logMode === LogMode.CONSOLE) {
  system.configure({
    transports: [
      new transports.Console({
        format: format.combine(
          format.colorize(),
          format.simple(),
          systemFormat
        ),
      }),
    ],
  })
  user.configure({
    transports: [
      new transports.Console({
        format: format.combine(format.colorize(), format.simple(), userFormat),
      }),
    ],
  })
} else if (logMode === LogMode.FILE || logMode === LogMode.BLESSED) {
  system.configure({
    transports: [
      new transports.File({
        filename: systemLogFileName,
        // note: winston.stream().on() works only with json-formatted logs
        format: format.combine(format.json(), format.splat()),
      }),
    ],
  })
  user.configure({
    transports: [
      new transports.File({
        filename: userLogFileName,
        // note: winston.stream().on() works only with json-formatted logs
        format: format.combine(format.json(), format.splat()),
      }),
    ],
  })
} else if (logMode === LogMode.SERVER) {
  system.configure({
    transports: [new transports.Console({ silent: true })],
  })
  user.configure({
    transports: [
      new transports.Console({
        format: format.combine(format.colorize(), format.simple(), userFormat),
      }),
    ],
  })
}

export function initLogFiles(): void {
  copyFileSync(systemLogFileName, `old.${Date.now()}.${systemLogFileName}`)
  truncateSync(systemLogFileName)
  copyFileSync(userLogFileName, `old.${Date.now()}.${userLogFileName}`)
  truncateSync(userLogFileName)
}

// optional blessed terminal
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let logProgress = (_n: number): void => {
  return undefined
}
if (logMode === LogMode.BLESSED) {
  import('./blessed-terminal').then((blessed) => {
    blessed.screen.render()
    logProgress = (percent: number): void => {
      blessed.logProgress(percent)
    }
  })
}

export { logProgress, system, user }
declare global {
  namespace NodeJS {
    interface Global {
      log: Logger
    }
  }
  const log: Logger
}
global.log = user
