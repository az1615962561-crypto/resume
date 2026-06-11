import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = join(projectRoot, 'dist')
const htmlPath = join(distDir, 'index.html')
const portraitPath = join(distDir, 'portrait.png')

let html = await readFile(htmlPath, 'utf8')

const cssHref = html.match(/<link rel="stylesheet" crossorigin href="([^"]+)">/)?.[1]
const scriptSrc = html.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/)?.[1]

if (!cssHref || !scriptSrc) {
  throw new Error('Unable to find the built CSS or JavaScript asset.')
}

const resolveAsset = (assetPath) =>
  join(distDir, assetPath.replace(/^\.?\//, ''))

const [css, javascript, portrait] = await Promise.all([
  readFile(resolveAsset(cssHref), 'utf8'),
  readFile(resolveAsset(scriptSrc), 'utf8'),
  readFile(portraitPath),
])

const portraitDataUrl = `data:image/png;base64,${portrait.toString('base64')}`
const inlinedJavaScript = javascript
  .replaceAll('./portrait.png', portraitDataUrl)
  .replaceAll('/portrait.png', portraitDataUrl)
  .replaceAll('</script>', '<\\/script>')

html = html
  .replace(
    `<script type="module" crossorigin src="${scriptSrc}"></script>`,
    `<script type="module">${inlinedJavaScript}</script>`,
  )
  .replace(
    `<link rel="stylesheet" crossorigin href="${cssHref}">`,
    `<style>${css}</style>`,
  )

const outputPath = join(projectRoot, '打开Demo.html')
await writeFile(outputPath, html)
console.log(`Standalone demo created: ${outputPath}`)
