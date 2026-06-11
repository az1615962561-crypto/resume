declare global {
  interface Window {
    __PORTFOLIO_ASSETS__?: Record<string, string>
  }
}

export const projectAsset = (name: string) =>
  window.__PORTFOLIO_ASSETS__?.[name] ??
  `${import.meta.env.BASE_URL}projects/${name}`

export const publicAsset = (name: string) =>
  window.__PORTFOLIO_ASSETS__?.[name] ?? `${import.meta.env.BASE_URL}${name}`
