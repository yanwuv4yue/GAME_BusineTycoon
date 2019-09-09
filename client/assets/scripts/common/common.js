export const loadImg = (container, url) => {
	cc.loader.load(url, function (err, texture) {
		var sprite  = new cc.SpriteFrame(texture);
		container.spriteFrame = sprite;
	});
}

export default {
    loadImg
}