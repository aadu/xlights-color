
interface ElectronApi {
  readonly versions: Readonly<NodeJS.ProcessVersions>
  readonly dialog: Readyonly<Electron.Dialog>
}

declare interface Window {
  electron: Readonly<ElectronApi>
  electronRequire?: NodeRequire
}
