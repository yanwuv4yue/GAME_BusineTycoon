
cc.Class({
    extends: cc.Component,

    properties: {
        title: {
            default: null,
            type: cc.Label
        },

        company: "",
        status: "",
        picked: false
    },

    start() {

    },

    onNormalSelected() {
        let sprite = this.node.getComponent(cc.Sprite);
        sprite.spriteFrame = null;
    },

    onDestroy() {
        cc.log("chess node destroy!");
    }
});
