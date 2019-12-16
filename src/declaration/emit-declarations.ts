import {Resolver} from "../util/resolve-id/resolver";
import {SupportedExtensions} from "../util/get-supported-extensions/get-supported-extensions";
import {FileSystem} from "../util/file-system/file-system";
import {OutputBundle, OutputOptions, PluginContext} from "rollup";
import {TS} from "../type/ts";
import {dirname, join, normalize, relative, basename} from "path";
import {IncrementalLanguageService} from "../service/language-service/incremental-language-service";
import {TypescriptPluginOptions} from "../plugin/i-typescript-plugin-options";
import {ModuleDependencyMap} from "../util/module/get-module-dependencies";
import {isOutputChunk} from "../util/is-output-chunk/is-output-chunk";
import {getDeclarationOutDir} from "../util/get-declaration-out-dir/get-declaration-out-dir";
import {getOutDir} from "../util/get-out-dir/get-out-dir";
import {mergeChunksWithAmbientDependencies} from "../util/chunk/merge-chunks-with-ambient-dependencies";
import {getChunkToOriginalFileMap} from "../util/chunk/get-chunk-to-original-file-map";
import {ensurePosix, setExtension} from "../util/path/path-util";
import {DECLARATION_EXTENSION, DECLARATION_MAP_EXTENSION, ROLLUP_PLUGIN_MULTI_ENTRY} from "../constant/constant";
import {bundleDeclarationsForChunk} from "./bundle-declarations-for-chunk";
import {ChunkForModuleCache} from "../service/transformer/declaration-bundler/declaration-bundler-options";
import {
	ReferenceCache,
	SourceFileToNodeToReferencedIdentifiersCache
} from "../service/transformer/declaration-bundler/transformers/reference/cache/reference-cache";
import {NodeIdentifierCache} from "../service/transformer/declaration-bundler/transformers/trace-identifiers/trace-identifiers";

export interface EmitDeclarationsOptions {
	resolver: Resolver;
	supportedExtensions: SupportedExtensions;
	fileSystem: FileSystem;
	pluginContext: PluginContext;
	bundle: OutputBundle;
	cwd: string;
	compilerOptions: TS.CompilerOptions;
	languageServiceHost: IncrementalLanguageService;
	pluginOptions: TypescriptPluginOptions;
	outputOptions: OutputOptions;
	moduleDependencyMap: ModuleDependencyMap;
	multiEntryFileNames: Set<string> | undefined;
	canEmitForFile(id: string): boolean;
}

export interface PreparePathsOptions {
	fileName: string;
	relativeOutDir: string;
	absoluteOutDir: string;
}

export interface PreparePathsResult {
	fileName: string;
	relative: string;
	absolute: string;
}

function preparePaths({relativeOutDir, absoluteOutDir, fileName}: PreparePathsOptions): PreparePathsResult {
	const absolutePath = join(absoluteOutDir, fileName);
	const relativePath = join(relativeOutDir, fileName);

	return {
		fileName,
		absolute: absolutePath,
		relative: relativePath
	};
}

export function emitDeclarations(options: EmitDeclarationsOptions) {
	const {typescript} = options.pluginOptions;
	const chunks = Object.values(options.bundle).filter(isOutputChunk);

	const relativeDeclarationOutDir = normalize(getDeclarationOutDir(options.cwd, options.compilerOptions, options.outputOptions));
	const absoluteDeclarationOutDir = join(options.cwd, relativeDeclarationOutDir);

	const relativeOutDir = getOutDir(options.cwd, options.outputOptions);
	const absoluteOutDir = join(options.cwd, relativeOutDir);
	const generateMap = Boolean(options.compilerOptions.declarationMap);
	const mergeChunksResult = mergeChunksWithAmbientDependencies(chunks, options.moduleDependencyMap);
	const chunkToOriginalFileMap = getChunkToOriginalFileMap(absoluteOutDir, mergeChunksResult);
	const sourceFileToNodeToReferencedIdentifiersCache: SourceFileToNodeToReferencedIdentifiersCache = new Map();
	const nodeIdentifierCache: NodeIdentifierCache = new Map();
	const chunkForModuleCache: ChunkForModuleCache = new Map();
	const referenceCache: ReferenceCache = new Map();
	const printer = typescript.createPrinter({newLine: options.compilerOptions.newLine});

	const sharedOptions = {
		...options,
		typescript,
		chunkToOriginalFileMap,
		generateMap,
		nodeIdentifierCache,
		chunkForModuleCache,
		printer,
		referenceCache,
		sourceFileToNodeToReferencedIdentifiersCache,
		isMultiChunk: mergeChunksResult.mergedChunks.length > 1
	};

	for (const chunk of mergeChunksResult.mergedChunks) {
		const chunkPaths = preparePaths({
			fileName: normalize(chunk.fileName),
			relativeOutDir: getOutDir(options.cwd, options.outputOptions),
			absoluteOutDir: join(options.cwd, relativeOutDir)
		});

		let declarationPaths = preparePaths({
			fileName: setExtension(chunk.fileName, DECLARATION_EXTENSION),
			relativeOutDir: relativeDeclarationOutDir,
			absoluteOutDir: absoluteDeclarationOutDir
		});

		let declarationMapPaths = preparePaths({
			fileName: setExtension(chunk.fileName, DECLARATION_MAP_EXTENSION),
			relativeOutDir: relativeDeclarationOutDir,
			absoluteOutDir: absoluteDeclarationOutDir
		});

		// Rewrite the declaration paths
		if (options.pluginOptions.hook.outputPath != null) {
			const declarationResult = options.pluginOptions.hook.outputPath(declarationPaths.absolute, "declaration");
			const declarationMapResult = options.pluginOptions.hook.outputPath(declarationMapPaths.absolute, "declarationMap");

			if (declarationResult != null) {
				declarationPaths = preparePaths({
					fileName: basename(declarationResult),
					relativeOutDir: relative(options.cwd, dirname(declarationResult)),
					absoluteOutDir: dirname(declarationResult)
				});
			}

			if (declarationMapResult != null) {
				declarationMapPaths = {
					// Don't allow diverging from the declaration paths.
					// The two files must be placed together
					fileName: basename(declarationMapResult),
					relative: join(dirname(declarationPaths.relative), basename(declarationMapResult)),
					absolute: join(dirname(declarationPaths.absolute), basename(declarationMapResult))
				};
			}
		}

		// We'll need to work with POSIX paths for now
		let emitFileDeclarationFilename = ensurePosix(join(relative(relativeOutDir, dirname(declarationPaths.relative)), declarationPaths.fileName));
		let emitFileDeclarationMapFilename = ensurePosix(
			join(relative(relativeOutDir, dirname(declarationMapPaths.relative)), declarationMapPaths.fileName)
		);

		// Rollup does not allow emitting files outside of the root of the whatever 'dist' directory that has been provided.
		while (emitFileDeclarationFilename.startsWith("../") || emitFileDeclarationFilename.startsWith("..\\")) {
			emitFileDeclarationFilename = emitFileDeclarationFilename.slice("../".length);
		}
		while (emitFileDeclarationMapFilename.startsWith("../") || emitFileDeclarationMapFilename.startsWith("..\\")) {
			emitFileDeclarationMapFilename = emitFileDeclarationMapFilename.slice("../".length);
		}

		// Now, make sure to normalize the file names again
		emitFileDeclarationFilename = normalize(emitFileDeclarationFilename);
		emitFileDeclarationMapFilename = normalize(emitFileDeclarationMapFilename);

		const rawLocalModuleNames = chunk.modules;
		const modules = rawLocalModuleNames.filter(options.canEmitForFile);
		const rawEntryFileName = rawLocalModuleNames.slice(-1)[0];
		let entryModules = [modules.slice(-1)[0]];

		// If the entry filename is equal to the ROLLUP_PLUGIN_MULTI_ENTRY constant,
		// the entry is a combination of one or more of the local module names.
		// Luckily we should know this by now after having parsed the contents in the transform hook
		if (rawEntryFileName === ROLLUP_PLUGIN_MULTI_ENTRY && options.multiEntryFileNames != null) {
			// Reassign the entry file names accordingly
			entryModules = [...options.multiEntryFileNames];
		}

		// Don't emit declarations when there is no compatible entry file
		if (entryModules.length < 1 || entryModules.some(entryFileName => entryFileName == null)) continue;

		const bundleResult = bundleDeclarationsForChunk({
			...sharedOptions,
			chunk: {
				paths: chunkPaths,
				isEntry: chunk.isEntry,
				modules,
				entryModules
			},
			declarationPaths,
			declarationMapPaths
		});

		// Now, add the declarations as an asset
		options.pluginContext.emitFile({
			type: "asset",
			source: bundleResult.code,
			fileName: emitFileDeclarationFilename
		});

		// If there is a SourceMap for the declarations, add that asset too
		if (bundleResult.map != null) {
			options.pluginContext.emitFile({
				type: "asset",
				source: bundleResult.map.toString(),
				fileName: emitFileDeclarationMapFilename
			});
		}
	}
}