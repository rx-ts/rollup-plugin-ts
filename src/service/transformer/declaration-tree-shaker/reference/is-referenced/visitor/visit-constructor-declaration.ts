import {ConstructorDeclaration} from "typescript";
import {VisitorOptions} from "../visitor-options";

/**
 * Visits the given ConstructorDeclaration.
 * @param {ConstructorDeclaration} currentNode
 * @param {VisitorOptions} options
 */
export function visitConstructorDeclaration(currentNode: ConstructorDeclaration, {continuation}: VisitorOptions): void {
	// Check if any of the type parameters references the Node
	if (currentNode.typeParameters != null) {
		for (const typeParameter of currentNode.typeParameters) {
			continuation(typeParameter);
		}
	}

	// Check if any of the parameters references the node
	if (currentNode.parameters != null) {
		for (const parameter of currentNode.parameters) {
			continuation(parameter);
		}
	}

	// Check if the type of the function references the Node
	if (currentNode.type != null) {
		continuation(currentNode.type);
	}

	// Check if the body references the Node
	if (currentNode.body != null) {
		continuation(currentNode.body);
	}
}
