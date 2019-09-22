import { OutputChunk } from 'rollup'

/**
 * Gets the entry filename for the given OutputChunk
 */
export function getEntryFileNameForChunk(
  chunk: OutputChunk,
  canEmitForFile: (id: string) => boolean,
): string {
  return Object.keys(chunk.modules)
    .filter(canEmitForFile)
    .slice(-1)[0]
}
