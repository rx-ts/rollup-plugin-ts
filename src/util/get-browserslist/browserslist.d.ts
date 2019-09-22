// tslint:disable-next-line: no-namespace
declare module 'browserslist' {
  namespace browserslist {
    const findConfig: (
      cwd?: string,
    ) => {
      defaults?: string[]
    }
    const readConfig: (
      path: string,
    ) => {
      defaults?: string[]
    }
  }
  export = browserslist
}
