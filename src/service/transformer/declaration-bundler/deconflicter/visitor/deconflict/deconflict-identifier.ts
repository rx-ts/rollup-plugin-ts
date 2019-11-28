import {DeconflicterVisitorOptions} from "../../deconflicter-visitor-options";
import {TS} from "../../../../../../type/ts";
import {getBindingFromLexicalEnvironment} from "../../util/get-binding-from-lexical-environment";

/**
 * Deconflicts the given Identifier.
 */
export function deconflictIdentifier({node, lexicalEnvironment, typescript}: DeconflicterVisitorOptions<TS.Identifier>): TS.Identifier | undefined {
	const textContResult = getBindingFromLexicalEnvironment(lexicalEnvironment, node.text);
	const isIdentical = textContResult === node.text;

	console.log(
		require("util").inspect(
			{
				lexicalEnvironment,
				textContResult,
				text: node.text
			},
			{colors: true, depth: Infinity}
		)
	);

	if (isIdentical || textContResult == null) {
		return node;
	}

	return typescript.createIdentifier(textContResult);
}
