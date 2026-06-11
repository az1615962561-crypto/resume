import { readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = join(projectRoot, 'dist')
const htmlPath = join(distDir, 'index.html')
const portraitPath = join(distDir, 'portrait.png')
const faviconPath = join(distDir, 'favicon.svg')
const projectsDir = join(distDir, 'projects')

let html = await readFile(htmlPath, 'utf8')

const cssHref = html.match(/<link rel="stylesheet" crossorigin href="([^"]+)">/)?.[1]
const scriptSrc = html.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/)?.[1]

if (!cssHref || !scriptSrc) {
  throw new Error('Unable to find the built CSS or JavaScript asset.')
}

const resolveAsset = (assetPath) =>
  join(distDir, assetPath.replace(/^\.?\//, ''))

const [css, javascript, portrait, favicon, projectNames] = await Promise.all([
  readFile(resolveAsset(cssHref), 'utf8'),
  readFile(resolveAsset(scriptSrc), 'utf8'),
  readFile(portraitPath),
  readFile(faviconPath),
  readdir(projectsDir),
])

const projectAssets = await Promise.all(
  projectNames
    .filter((name) => name.endsWith('.png'))
    .map(async (name) => ({
      name,
      dataUrl: `data:image/png;base64,${(await readFile(join(projectsDir, name))).toString('base64')}`,
    })),
)

const standaloneAssets = Object.fromEntries([
  ['portrait.png', `data:image/png;base64,${portrait.toString('base64')}`],
  ...projectAssets.map(({ name, dataUrl }) => [name, dataUrl]),
])
const standaloneAssetScript = `<script>window.__PORTFOLIO_ASSETS__=${JSON.stringify(standaloneAssets)}</script>`
const inlinedJavaScript = javascript.replaceAll('</script>', '<\\/script>')

html = html
  .replace('./favicon.svg', `data:image/svg+xml;base64,${favicon.toString('base64')}`)
  .replace(
    `<script type="module" crossorigin src="${scriptSrc}"></script>`,
    () => `${standaloneAssetScript}<script type="module">${inlinedJavaScript}</script>`,
  )
  .replace(
    `<link rel="stylesheet" crossorigin href="${cssHref}">`,
    () => `<style>${css}</style>`,
  )

const outputPath = join(projectRoot, '打开Demo.html')
await writeFile(outputPath, html)
console.log(`Standalone demo created: ${outputPath}`)
