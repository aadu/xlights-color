
interface ElectronApi {
  readonly versions: Readonly<NodeJS.ProcessVersions>
  dialog: Electron.Dialog,
  readir?: any,
  readFile?: any
}

declare interface Window {
  electron: Readonly<ElectronApi>
  electronRequire?: NodeRequire
}
