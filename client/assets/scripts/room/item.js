let engine = require("MatchvsEngine");
cc.Class({
    extends: cc.Component,

    properties: {
        roomName: {
            default: null,
            type: cc.Label
        },
        roomState: {
            default: null,
            type:cc.Label
        },
        roomPlayer: {
            default: null,
            type:cc.Label
        },
        joinRoom: cc.Node,
        itemID: 0
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        var self = this;
        this.node.on('touchend', function () {
            console.log("Item " + this.itemID + ' clicked');
        }, this);
        this.joinRoom.on(cc.Node.EventType.TOUCH_END, function (event) {
            engine.prototype.joinRoom(self.roomName.string, "china");
            console.log();
        })
    },

    // update (dt) {},

    updateItem: function(obj) {
        this.roomName.string = obj.roomID;
        console.log(obj.roomID);
        if (obj.state == 1) {
            this.roomState.string = "开放";
        } else {
            this.roomState.string = "关闭";
        }
        this.roomPlayer.string = obj.gamePlayer + "/" + obj.maxPlayer;
    }
});
