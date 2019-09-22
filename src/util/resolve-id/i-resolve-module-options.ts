import { CompilerOptions } from 'typescript'

import { IResolveCache } from '../../service/cache/resolve-cache/i-resolve-cache'
import { ModuleResolutionHost } from '../../service/module-resolution-host/module-resolution-host'

export interface IResolveModuleOptions {
  id: string
  parent: string
  options: CompilerOptions
  moduleResolutionHost: ModuleResolutionHost
  resolveCache: IResolveCache
  cwd: string
}
