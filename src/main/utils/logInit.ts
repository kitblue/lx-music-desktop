import log from 'electron-log/node'
import { app } from 'electron'
import { join } from 'path'
import { mkdirSync } from 'fs'

log.transports.file.level = 'info'

// 绿色版适配：日志路径显式锚定到 userData/logs。
// 便携模式下 appData 会被改写到程序目录，若沿用默认 logs 路径解析顺序，
// 日志仍可能落到系统盘；这里惰性解析，保证与 userData 一致。
log.transports.file.resolvePathFn = () => {
  const dir = join(app.getPath('userData'), 'logs')
  try {
    mkdirSync(dir, { recursive: true })
  } catch {}
  return join(dir, 'main.log')
}
