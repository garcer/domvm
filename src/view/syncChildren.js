import { FRAGMENT } from './VTYPES';
import { hydrate } from './hydrate';
import { prevSib, nextSib, insertBefore, insertAfter, removeChild, parentEl } from './dom';

//import { DEBUG } from './DEBUG';

function nextNode(node, body) {
	return body[node.idx + 1];
}

function prevNode(node, body) {
	return body[node.idx - 1];
}

function tmpEdges(fn, parEl, lftSib, rgtSib) {
	// get outer immute edges
	var lftLft = prevSib(lftSib);
	var rgtRgt = nextSib(rgtSib);

	fn(lftLft, rgtRgt);

	return {
		lftSib: lftLft ? nextSib(lftLft) : parEl.firstChild,
		rgtSib: rgtRgt ? prevSib(rgtRgt) : parEl.lastChild,
	};
}

function headTailTry(parEl, lftSib, lftNode, rgtSib, rgtNode) {
//	DEBUG && console.log("try head/tail magic");

	var areAdjacent	= rgtNode.idx === lftNode.idx + 1;
	var headToTail = areAdjacent ? false : lftSib._node === rgtNode;
	var tailToHead = areAdjacent ? true  : rgtSib._node === lftNode;

	if (headToTail || tailToHead) {
		return tmpEdges(function(lftLft, rgtRgt) {
			if (tailToHead)
				insertBefore(parEl, rgtSib, lftSib);

			if (headToTail)
				insertBefore(parEl, lftSib, rgtRgt);
		}, parEl, lftSib, rgtSib);
	}

	return null;
}

// init vm,

// selection sort of DOM (cause move cost >> cmp cost)
// todo: skip removed
function sortDOM(parEl, lftSib, rgtSib, cmpFn) {
//	DEBUG && console.log("selection sort!");

	return tmpEdges(function(lftLft, rgtRgt) {
		var min = null;

		for (var i = lftSib; i !== rgtRgt; i = nextSib(i)) {
			lftSib = min = i;

			for (var j = nextSib(i); j !== rgtRgt; j = nextSib(j)) {
				if (cmpFn(min, j) > 0)
					min = j;
			}

			if (min === i)
				continue;

			insertBefore(parEl, min, lftSib);

			i = min;
		}
	}, parEl, lftSib, rgtSib);
}

function cmpElNodeIdx(a, b) {
	return a._node.idx - b._node.idx;
}

export function syncChildren(node) {
	var parEl = node.type == FRAGMENT ? parentEl(node) : node.el;
	var body = node.body;

	// breaking condition is convergance

	var lftNode		= body[0],
		lftSib		= node.type == FRAGMENT ? nextSib(node.vm()._frag[0]) : parEl.firstChild,
		rgtNode		= body[body.length - 1],
		rgtSib		= node.type == FRAGMENT ? prevSib(node.vm()._frag[1]) : parEl.lastChild,
		newSibs		= null;

	var tmpSib = null;

	if (lftSib == null) {
		body.forEach(node2 => parEl.appendChild(hydrate(node2)));
		return;
	}
	else if (lftNode == null) {
//		DEBUG && console.log("todo: full dehydrate");
	}

	converge:
	while (1) {
//		DEBUG && console.log("from_left");
//		from_left:
		while (1) {
			if (lftSib)
				var lsNode = lftSib._node;

			if (lftSib && lsNode.type == FRAGMENT) {
				console.log("poo from lft!", lsNode);
//				break converge;
			}

			// remove any non-recycled sibs whose el.node has the old parent
			if (lftSib && lsNode.parent != node) {		// && !lsNode.recycled &&
				tmpSib = nextSib(lftSib);
				lsNode.vmid != null ? lsNode.vm().unmount(true) : removeChild(parEl, lftSib);
				lftSib = tmpSib;
				continue;
			}

			if (lftNode == null)		// reached end
				break converge;
			else if (lftNode.el == null) {
				insertBefore(parEl, hydrate(lftNode), lftSib);		// lftNode.vmid != null ? lftNode.vm().mount(parEl, false, true, lftSib) :
				lftNode = nextNode(lftNode, body);
			}
			else if (lftNode.type == FRAGMENT && lftSib._node == lftNode) {
				lftSib = nextSib(lftNode.vm()._frag[1]);
				lftNode = nextNode(lftNode, body);
			}
			else if (lftNode.el === lftSib) {
				lftNode = nextNode(lftNode, body);
				lftSib = nextSib(lftSib);
				// if reached right bounding edge of fragment node
				if (lftSib != null && lftSib._node == node)
					break converge;
			}
			else
				break;
		}

//		DEBUG && console.log("from_right");
//		from_right:
		while(1) {
			if (rgtSib)
				var rsNode = rgtSib._node;

			if (rgtSib && rsNode.type == FRAGMENT) {
				console.log("poo from rgt!", rsNode);
//				break converge;
			}

			if (rgtSib && rsNode.parent != node) {
				tmpSib = prevSib(rgtSib);
				rsNode.vmid != null ? rsNode.vm().unmount(true) : removeChild(parEl, rgtSib);
				rgtSib = tmpSib;
				continue;
			}

			if (rgtNode == lftNode)		// converged
				break converge;
			if (rgtNode.el == null) {
				insertAfter(parEl, hydrate(rgtNode), rgtSib);		// rgtNode.vmid != null ? rgtNode.vm().mount(parEl, false, true, nextSib(rgtSib) :
				rgtNode = prevNode(rgtNode, body);
			}
			else if (rgtNode.el === rgtSib) {
				rgtNode = prevNode(rgtNode, body);
				rgtSib = prevSib(rgtSib);
				// if reached left bounding edge of fragment node
				if (rgtSib != null && rgtSib._node == node)
					break converge;
			}
			else
				break;
		}

		if (newSibs = headTailTry(parEl, lftSib, lftNode, rgtSib, rgtNode)) {
			lftSib = newSibs.lftSib;
			rgtSib = newSibs.rgtSib;
			continue;
		}

		newSibs = sortDOM(parEl, lftSib, rgtSib, cmpElNodeIdx);
		lftSib = newSibs.lftSib;
		rgtSib = newSibs.rgtSib;
	}
}