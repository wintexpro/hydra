import * as blessed from 'blessed'

export const screen = blessed.screen({
  smartCSR: true,
  title: 'Log dashboard',
})

const logWidgetsHeight = 70
const systemLog = blessed.log({
  top: '0',
  left: '0%',
  width: '100%',
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

export function logToSystemBox(message: string | string[]): void {
  systemLog.insertBottom(message)
  screen.render()
}

export function logProgress(percent: number): void {
  statusBarBox.setLine(1, `${percent}%`)
  statusBarBox.setLine(2, `${pBar(percent)}`)
  screen.render()
}

// custom progress bar
function pBar(percent: number): string {
  const width = 50
  const onePercentWidth = Number((width / 100).toPrecision(1))
  const bar = ''
    .padEnd(Math.floor(onePercentWidth * percent), '█')
    .padEnd(width, '░')
  return '[' + bar + ']'
}

screen.append(systemLog)
screen.append(statusBarBox)

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], () => {
  return process.exit(0)
})

statusBarBox.focus()
screen.render()
