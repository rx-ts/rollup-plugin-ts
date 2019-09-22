import { sync } from 'find-up'
import { join } from 'path'
import {
  CompilerHost,
  CompilerOptions,
  CustomTransformers,
  IScriptSnapshot,
  LanguageServiceHost,
  ScriptKind,
  ScriptSnapshot,
  SourceFile,
  getDefaultLibFileName,
} from 'typescript'

import { DEFAULT_LIB_NAMES } from '../../constant/constant'
import { IExtendedDiagnostic } from '../../diagnostic/i-extended-diagnostic'
import { getNewLineCharacter } from '../../util/get-new-line-character/get-new-line-character'
import { getScriptKindFromPath } from '../../util/get-script-kind-from-path/get-script-kind-from-path'
import { CustomTransformersFunction } from '../../util/merge-transformers/i-custom-transformer-options'
import {
  ensureAbsolute,
  isInternalFile,
  setExtension,
} from '../../util/path/path-util'

import { IFile, IFileInput } from './i-file'
import { ILanguageServiceOptions } from './i-language-service-options'

/**
 * An implementation of a LanguageService for Typescript
 */
export class IncrementalLanguageService
  implements LanguageServiceHost, CompilerHost {
  /**
   * A Map between filenames and emitted code
   */
  emittedFiles = new Map<string, string>()

  /**
   * The Set of all files that has been added manually via the public API
   */
  publicFiles = new Set<string>()

  /**
   * The nearest Typescript Lib directory from the given cwd
   */

  private readonly _LIB_DIRECTORY = sync('node_modules/typescript/lib', {
    cwd: this._options.cwd,
    type: 'directory',
  })

  /**
   * A Map between file names and their IFiles
   */
  private readonly _files = new Map<string, IFile>()

  /**
   * The CustomTransformersFunction to use, if any
   */
  private readonly _transformers: CustomTransformersFunction | undefined

  constructor(private readonly _options: ILanguageServiceOptions) {
    this._addDefaultLibs()
    this._addDefaultFileNames()
    this._transformers = _options.transformers
  }

  /**
   * Writes a file. Will simply put it in the emittedFiles Map
   */
  writeFile(fileName: string, data: string): void {
    this.emittedFiles.set(fileName, data)
  }

  /**
   * Gets a SourceFile from the given fileName
   */
  getSourceFile(fileName: string): SourceFile | undefined {
    const program = this._options.languageService().getProgram()
    if (program == null) {
      return undefined
    }
    return program.getSourceFile(fileName)
  }

  /**
   * Returns true if the LanguageServiceHost has the given file
   */
  hasFile(fileName: string): boolean {
    return this._files.has(fileName)
  }

  /**
   * Gets the fileName, if any, that is has been added to the LanguageServiceHost and looks like the given one.
   * For example, if a file without any file extension is provided as input, any file that has an extension but the
   * same base name will be returned
   */
  getClosestFileName(fileName: string): string | undefined {
    const absolute = ensureAbsolute(this._options.cwd, fileName)

    if (this.hasFile(fileName)) {
      return fileName
    }
    if (this.hasFile(absolute)) {
      return absolute
    }
    for (const extension of this._options.supportedExtensions) {
      const withExtension = setExtension(fileName, extension)
      const absoluteWithExtension = ensureAbsolute(
        this._options.cwd,
        withExtension,
      )
      if (this.hasFile(withExtension)) {
        return withExtension
      }
      if (this.hasFile(absoluteWithExtension)) {
        return absoluteWithExtension
      }
    }
    return undefined
  }

  /**
   * Gets all diagnostics reported of transformers for the given filename
   */
  getTransformerDiagnostics(fileName?: string): readonly IExtendedDiagnostic[] {
    // If diagnostics for only a specific file should be retrieved, try to get it from the files map and return its transformer diagnostics
    if (fileName != null) {
      const fileMatch = this._files.get(fileName)
      if (fileMatch == null) {
        return []
      }
      return fileMatch.transformerDiagnostics
    }

    // Otherwise, take all transformer diagnostics for all files
    else {
      return ([] as IExtendedDiagnostic[]).concat.apply(
        [],
        [...this._files.values()].map(v => v.transformerDiagnostics),
      )
    }
  }

  /**
   * Adds a File to the CompilerHost
   */
  addFile(file: IFileInput, internal = false): void {
    const existing = this._files.get(file.file)

    // Don't proceed if the file contents are completely unchanged
    if (existing != null && existing.code === file.code) {
      return
    }

    this._files.set(file.file, {
      ...file,
      scriptKind: getScriptKindFromPath(file.file),
      snapshot: ScriptSnapshot.fromString(file.code),
      version: existing != null ? existing.version + 1 : 0,
      transformerDiagnostics: [],
    })

    if (!internal) {
      // Add the file to the Set of files that has been added manually by the user
      this.publicFiles.add(file.file)
    }

    // Remove the file from the emit cache
    this._options.emitCache.delete(file.file)
  }

  /**
   * Deletes a file from the LanguageService
   */
  deleteFile(fileName: string): boolean {
    const filesResult = this._files.delete(fileName)
    const publicFilesResult = this.publicFiles.delete(fileName)
    const cacheResult = this._options.emitCache.delete(fileName)
    return filesResult || publicFilesResult || cacheResult
  }

  /**
   * Returns true if the given file exists
   */
  fileExists(fileName: string): boolean {
    // Check if the file exists cached
    if (this._files.has(fileName)) {
      return true
    }

    // Otherwise, check if it exists on disk
    return this._options.fileSystem.fileExists(fileName)
  }

  /**
   * Gets the current directory
   */
  getCurrentDirectory(): string {
    return this._options.cwd
  }

  /**
   * Reads the given file
   */
  readFile(fileName: string, encoding?: string): string | undefined {
    // Check if the file exists within the cached files and return it if so
    const result = this._files.get(fileName)
    if (result != null) {
      return result.code
    }

    // Otherwise, try to properly resolve the file
    return this._options.fileSystem.readFile(fileName, encoding)
  }

  /**
   * Reads the given directory
   */
  readDirectory(
    path: string,
    extensions?: readonly string[],
    exclude?: readonly string[],
    include?: readonly string[],
    depth?: number,
  ): string[] {
    return this._options.fileSystem.readDirectory(
      path,
      extensions,
      exclude,
      include,
      depth,
    )
  }

  /**
   * Gets the real path for the given path. Meant to resolve symlinks
   */
  realpath(path: string): string {
    return this._options.fileSystem.realpath(path)
  }

  /**
   * Gets the default lib file name based on the given CompilerOptions
   */
  getDefaultLibFileName(options: CompilerOptions): string {
    return getDefaultLibFileName(options)
  }

  /**
   * Gets the newline to use
   */
  getNewLine(): string {
    return this._options.parsedCommandLine.options.newLine != null
      ? getNewLineCharacter(this._options.parsedCommandLine.options.newLine)
      : this._options.fileSystem.newLine
  }

  /**
   * Returns true if file names should be treated as case-sensitive
   */
  useCaseSensitiveFileNames(): boolean {
    return this._options.fileSystem.useCaseSensitiveFileNames
  }

  /**
   * Gets the CompilerOptions provided in the constructor
   */
  getCompilationSettings(): CompilerOptions {
    return this._options.parsedCommandLine.options
  }

  /**
   * Gets the Custom Transformers to use, depending on the current emit mode
   */
  getCustomTransformers(): CustomTransformers | undefined {
    const languageService = this._options.languageService()
    if (this._transformers == null) {
      return undefined
    }
    return this._transformers({
      languageService,
      languageServiceHost: this,
      program: languageService.getProgram(),

      /**
       * This hook can add diagnostics from within CustomTransformers. These will be emitted alongside Typescript diagnostics seamlessly
       */
      addDiagnostics: (...diagnostics) => {
        diagnostics.forEach(diagnostic => {
          // Skip diagnostics that doesn't point to a specific file
          if (diagnostic.file == null) {
            return
          }
          const fileMatch = this._files.get(diagnostic.file.fileName)
          // If no file matches the one of the diagnostic, skip it
          if (fileMatch == null) {
            return
          }

          // Add the diagnostic
          fileMatch.transformerDiagnostics.push(diagnostic)
        })
      },
    })
  }

  /**
   * Gets all Script file names
   */
  getScriptFileNames(): string[] {
    return [...this._files.keys()]
  }

  /**
   * Gets the ScriptKind for the given file name
   */
  getScriptKind(fileName: string): ScriptKind {
    return this._assertHasFileName(fileName).scriptKind
  }

  /**
   * Gets a ScriptSnapshot for the given file
   */
  getScriptSnapshot(fileName: string): IScriptSnapshot | undefined {
    const file = this._assertHasFileName(fileName)
    return file.snapshot
  }

  /**
   * Gets the Script version for the given file name
   */
  getScriptVersion(fileName: string): string {
    return String(this._assertHasFileName(fileName).version)
  }

  /**
   * Gets the canonical filename for the given file
   */
  getCanonicalFileName(fileName: string): string {
    return this.useCaseSensitiveFileNames() ? fileName : fileName.toLowerCase()
  }

  /**
   * Gets all directories within the given directory path
   */
  getDirectories(directoryName: string): string[] {
    return this._options.fileSystem.getDirectories(directoryName)
  }

  /**
   * Returns true if the given directory exists
   */
  directoryExists(directoryName: string): boolean {
    return this._options.fileSystem.directoryExists(directoryName)
  }

  /**
   * Adds all default lib files to the LanguageService
   */
  private _addDefaultLibs(): void {
    DEFAULT_LIB_NAMES.forEach(libName => {
      if (this._LIB_DIRECTORY == null) {
        return
      }

      const path = join(this._LIB_DIRECTORY, libName)
      const code = this._options.fileSystem.readFile(path)
      if (code == null) {
        return
      }

      this.addFile(
        {
          file: libName,
          code,
        },
        true,
      )
    })
  }

  /**
   * Adds all default declaration files to the LanguageService
   */
  private _addDefaultFileNames(): void {
    this._options.parsedCommandLine.fileNames.forEach(file => {
      const code = this._options.fileSystem.readFile(
        ensureAbsolute(this._options.cwd, file),
      )
      if (code != null) {
        this.addFile(
          {
            file,
            code,
          },
          true,
        )
      }
    })
  }

  /**
   * Asserts that the given file name exists within the LanguageServiceHost
   */
  private _assertHasFileName(fileName: string): IFile {
    if (!this._files.has(fileName)) {
      // If the file exists on disk, add it
      const code = this._options.fileSystem.readFile(fileName)
      if (code != null) {
        this.addFile({ file: fileName, code }, isInternalFile(fileName))
      } else {
        throw new ReferenceError(`The given file: '${fileName}' doesn't exist!`)
      }
    }
    return this._files.get(fileName)
  }
}
