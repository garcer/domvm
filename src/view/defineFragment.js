import { ELEMENT, TEXT, COMMENT, VVIEW, VMODEL, FRAGMENT } from './VTYPES';
import { VNode } from './VNode';

export function defineFragment(body) {
	var node = new VNode(FRAGMENT);
	node.body = body;
	return node;
}