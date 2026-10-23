const { afterPack } = require('./deps')

const fs = require('fs').promises

// 仅保留中文/英文语言包，减小绿色版体积
const keepLocales = new Set(['zh-CN.pak', 'zh-TW.pak', 'en-US.pak'])
const trimLocales = async(appOutDir) => {
  const localesDir = `${appOutDir}/locales`
  let files
  try {
    files = await fs.readdir(localesDir)
  } catch (_) {
    return
  }
  const drop = files.filter(f => f.endsWith('.pak') && !keepLocales.has(f))
  await Promise.all(drop.map(f => fs.rm(`${localesDir}/${f}`, { force: true })))
  console.log(`[locales] kept ${[...keepLocales].join(', ')}, removed ${drop.length}`)
}

// https://github.com/electron-userland/electron-builder/issues/4630
// https://github.com/electron-userland/electron-builder/issues/4630#issuecomment-782020139

module.exports = async(context) => {
  await afterPack()
  const { electronPlatformName, appOutDir } = context
  if (electronPlatformName === 'win32') await trimLocales(appOutDir)
  if (electronPlatformName !== 'darwin') return
  const {
    productFilename,
    info: {
      _metadata: { macLanguagesInfoPlistStrings },
    },
  } = context.packager.appInfo

  const resPath = `${appOutDir}/${productFilename}.app/Contents/Resources`

  // 创建APP语言包文件
  return Promise.all(
    Object.entries(macLanguagesInfoPlistStrings).map(([lang, config]) => {
      let infos = Object.entries(config).map(([k, v]) => `"${k}" = "${v}";`).join('\n')
      return fs.writeFile(`${resPath}/${lang}.lproj/InfoPlist.strings`, infos)
    }),
  )
}
