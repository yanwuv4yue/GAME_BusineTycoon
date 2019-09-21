cc.Class({
    extends: cc.Component,

    properties: {
        title: {
            default: null,
            type: cc.Label
        }
    },

    start() {

    },

    onDestroy() {
        cc.log("piece node destroy!");
    }
});
