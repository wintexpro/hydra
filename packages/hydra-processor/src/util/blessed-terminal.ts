import * as blessed from 'blessed'

export const screen = blessed.screen({
  smartCSR: true,
  title: 'Log dashboard',
})

// ---------------------------------------------------------------
// The main box
const logWidgetsHeight = 70
const systemLog = blessed.log({
  top: '0',
  left: '0%',
  width: '50%',
  height: (logWidgetsHeight + 2).toString() + '%',
  scrollable: true,
  alwaysScroll: true,
  tags: false,
  mouse: true,
  keys: true,
  border: {
    type: 'line',
  },
  scrollbar: {
    ch: ' ',
  },
  style: {
    scrollbar: {
      bg: 'blue',
    },
  },
})
const userLog = blessed.log({
  top: '0',
  left: '50%',
  width: '50%',
  height: (logWidgetsHeight + 2).toString() + '%',
  scrollable: true,
  alwaysScroll: true,
  tags: false,
  mouse: true,
  keys: true,
  border: {
    type: 'line',
  },
  scrollbar: {
    ch: ' ',
  },
  style: {
    scrollbar: {
      bg: 'blue',
    },
  },
})

// ---------------------------------------------------------------
// Status Bar
const statusBarBox = blessed.box({
  top: logWidgetsHeight.toString() + '%',
  width: '100%',
  height: (100 - logWidgetsHeight + 1).toString() + '%',
  tags: true,
  align: 'center',
  border: {
    type: 'line',
  },
  scrollbar: {
    ch: ' ',
  },
  style: {
    scrollbar: {
      bg: 'blue',
    },
  },
})

class LoggerForLogWidgets {
  logToSystemBox(message: string | string[]) {
    systemLog.insertBottom(message)
    return this
  }

  logToUserBox(message: string) {
    userLog.insertBottom(message)
    return this
  }
}

class LoggerForStatusBar {
  logProgress(percent: number) {
    statusBarBox.setLine(1, `${percent}%`)
    statusBarBox.setLine(2, `${pBar(percent)}`)
    return this
  }
}

// custom progress bar
const pBar = (percent: number): string => {
  const width = 50
  const onePercentWidth = Number((width / 100).toPrecision(1))
  const bar = ''
    .padEnd(Math.floor(onePercentWidth * percent), '█')
    .padEnd(width, '░')
  return '[' + bar + ']'
}

export const blessedLogger = new LoggerForLogWidgets()
export const statusBarLogger = new LoggerForStatusBar()

screen.append(systemLog)
screen.append(userLog)
screen.append(statusBarBox)

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], () => {
  return process.exit(0)
})

systemLog.focus()
screen.render()
