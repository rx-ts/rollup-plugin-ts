import {SourceFileBundlerVisitorOptions} from "../transformers/source-file-bundler/source-file-bundler-visitor-options";
import {TS} from "../../../../type/ts";
import {cloneNode, preserveNode} from "@wessberg/ts-clone-node";
import {getSymbolAtLocation} from "./get-symbol-at-location";
import {SafeNode} from "../../../../type/safe-node";

export interface PreserveMetaOptions extends SourceFileBundlerVisitorOptions {}

export function preserveSymbols<T extends TS.Node>(node: T, otherNode: TS.Node, options: PreserveMetaOptions): T {
	if (node === otherNode) return node;

	(node as SafeNode)._symbol = getSymbolAtLocation({...options, node: otherNode});
	return node;
}

export function preserveMeta<T extends TS.Node>(newNode: T, oldNode: T, options: PreserveMetaOptions): T {
	return preserveNode(newNode, oldNode, options);
}

export function cloneNodeWithMeta<T extends TS.Node>(node: T, options: PreserveMetaOptions): T {
	return cloneNode<T>(node, options);
}
