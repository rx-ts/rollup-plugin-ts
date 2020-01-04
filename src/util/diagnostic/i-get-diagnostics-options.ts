import {PluginContext} from "rollup";
import {TypescriptPluginOptions} from "../../plugin/i-typescript-plugin-options";
import {CompilerHost} from "../../service/compiler-host/compiler-host";

export interface IGetDiagnosticsOptions {
	host: CompilerHost;
	context: PluginContext;
	pluginOptions: TypescriptPluginOptions;
}
