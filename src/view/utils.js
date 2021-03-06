import { startsWith } from '../utils';

export function isEvProp(name) {
	return startsWith(name, "on");
}

export function isSplProp(name) {
	return name[0] == "_";
}

export function isStyleProp(name) {
	return name == "style";
}

export function repaint(node) {
	node && node.el && node.el.offsetHeight;
}

// tests interactive props where real val should be compared
export function isDynProp(tag, attr) {
//	switch (tag) {
//		case "input":
//		case "textarea":
//		case "select":
//		case "option":
			switch (attr) {
				case "value":
				case "checked":
				case "selected":
				case "selectedIndex":
					return true;
			}
//	}

	return false;
}