import { EmitOutput } from 'typescript'

import { IEmitCache } from './i-emit-cache'
import { IGetEmitOutputWithCachingOptions } from './i-get-emit-output-with-caching-options'

/**
 * A cache over EmitOutputs
 */
export class EmitCache implements IEmitCache {
  /**
   * A memory-persistent cache of EmitOutputs for files over time
   */
  private readonly _EMIT_CACHE: Map<string, EmitOutput> = new Map()

  /**
   * Gets an EmitOutput from the emit cache
   */
  getFromCache(fileName: string, dtsOnly = false): EmitOutput | undefined {
    return this._EMIT_CACHE.get(this._computeCacheKey(fileName, dtsOnly))
  }

  /**
   * Deletes the entry matching the combination of fileName and whether or not only to emit declarations from the cache
   */
  delete(fileName: string): boolean {
    const dtsCacheResult = this._EMIT_CACHE.delete(
      this._computeCacheKey(fileName, true),
    )
    const nonDtsCacheResult = this._EMIT_CACHE.delete(
      this._computeCacheKey(fileName, false),
    )
    return dtsCacheResult || nonDtsCacheResult
  }

  /**
   * Sets the given EmitOutput in the emit cache
   */
  setInCache(
    emitOutput: EmitOutput,
    fileName: string,
    dtsOnly = false,
  ): EmitOutput {
    this._EMIT_CACHE.set(this._computeCacheKey(fileName, dtsOnly), emitOutput)
    return emitOutput
  }

  /**
   * Gets EmitOut and optionally retrieves it from the cache if it exists there already.
   * If not, it will compute it, update the cache, and then return it
   */
  get({
    fileName,
    dtsOnly,
    languageService,
  }: IGetEmitOutputWithCachingOptions): EmitOutput {
    const cacheResult = this.getFromCache(fileName, dtsOnly)
    if (cacheResult != null) {
      return cacheResult
    }

    // Otherwise, generate new emit output and cache it before returning it
    const freshResult = languageService.getEmitOutput(fileName, dtsOnly)
    return this.setInCache(freshResult, fileName, dtsOnly)
  }

  /**
   * Computes a cache key from the given combination of a file name and whether or not only to emit
   * declaration files
   */
  private _computeCacheKey(fileName: string, dtsOnly = false): string {
    return `${fileName}.${Number(dtsOnly)}`
  }
}
