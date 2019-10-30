export const loadImg = (container, url) => {
	cc.loader.load(url, function (err, texture) {
		var sprite = new cc.SpriteFrame(texture);
		container.spriteFrame = sprite;
	});
}

export const hashCode = (str) => {
	var h = 0, off = 0;
	var len = str.length;
	for (var i = 0; i < len; i++) {
		h = 31 * h + str.charCodeAt(off++);
	}
	var t = -2147483648 * 2;
	while (h > 2147483647) {
		h += t
	}
	return h;
}

// 动态加载资源
export const loadRes = (path) => {
	return new Promise(function (resolve, reject) {
		cc.loader.loadRes(path, function (err, res) {
			if (err != null) {
				return reject(err);
			} else {
				return resolve(res);
			}
		});
	});
}

export default {
	loadImg,
	hashCode,
	loadRes
}