
cc.Class({
    extends: cc.Component,

    properties: {
        title: {
            default: null,
            type: cc.Label
        },

        background: {
            default: null,
            type: cc.Sprite
        },

        company: "",
        status: "",
        picked: false
    },

    start() {

    },

    onNormalSelected() {
        this.background.spriteFrame = null;
    },

    onDestroy() {
        cc.log("chess node destroy!");
    }
});
