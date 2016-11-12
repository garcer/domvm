import { ELEMENT, TEXT, COMMENT, VVIEW, VMODEL, FRAGMENT } from './VTYPES';
import { VNode } from './VNode';

export function defineFragment(body, flags) {
	var node = new VNode(FRAGMENT);

	node.body = body;

	if (flags != null)
		node.flags = flags;

	return node;
}