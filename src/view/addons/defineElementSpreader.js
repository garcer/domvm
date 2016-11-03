import { isArr, isObj, isVal } from '../../utils';
import { defineElement } from '../defineElement';

// allows for children to be spread OR explicit array
export function defineElementSpreader(flags) {
	return function() {
		var args = arguments,
			len = args.length,
			tag = args[0],
			body,
			attrs;

		if (len > 1) {
			var bodyIdx = 1;

			if (isObj(args[1])) {
				attrs = args[1];
				bodyIdx = 2;
			}

			if (len == bodyIdx + 1) {
				var last = args[bodyIdx];
				body = isVal(last) || isArr(last) ? last : [last];
			}
			else
				body = Array.prototype.slice.call(args, bodyIdx);
		}

		return defineElement(tag, attrs, body, flags);
	};
}