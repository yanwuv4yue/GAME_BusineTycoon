let mvs = require("Matchvs");
let msg = require("MatvhvsMessage");
let engine = require("MatchvsEngine");
let global = require("global");
cc.Class({
    extends: cc.Component,

    properties: {
        userID: {
            default: null,
            type: cc.Label
        },
        createRoom: cc.Node,
        roomList: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        console.log("menu page...");

        this.initEvent();

        this.userID.string += global.userID;

        // 创建房间
        this.createRoom.on(cc.Node.EventType.TOUCH_END, function() {
            console.log("createRoom click...");
            global.syncFrame = false;
            let create = new mvs.MsCreateRoomInfo();
            create.name = 'roomName';
            create.maxPlayer = global.MAX_PLAYER_COUNT;
            create.mode = 0;
            create.canWatch = 0;
            create.visibility = 1;
            console.log(create);
            engine.prototype.createRoom(create, "Matchvs");
            
        }, this);

        // 查看房间列表
        this.roomList.on(cc.Node.EventType.TOUCH_END, function() {
            global.syncFrame = false;
            cc.director.loadScene("roomList");
        });
    },

    // update (dt) {},
    /**
     * 生命周期，页面销毁
     */
    onDestroy:function () {
        this.removeEvent();
        console.log("Lobby页面销毁");
    },

    /**
     * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
     */
    initEvent () {
        cc.systemEvent.on(msg.MATCHVS_ERROE_MSG,this.onEvent,this);
        cc.systemEvent.on(msg.MATCHVS_CREATE_ROOM,this.onEvent,this);
        cc.systemEvent.on(msg.MATCHVS_NETWORK_STATE_NOTIFY,this.onEvent,this);
    },
    /**
     * 接收事件
     * @param event
     */
    onEvent (event) {
        let eventData = event.data;
        if (event.type === msg.MATCHVS_ERROE_MSG) {
            cc.director.loadScene('login');
        } else if (event.type === msg.MATCHVS_CREATE_ROOM) {
            global.roomID = eventData.rsp.roomID;
            cc.director.loadScene("createRoom");
        } else if (event.type === msg.MATCHVS_NETWORK_STATE_NOTIFY){
            if (eventData.netNotify.userID === global.userID && eventData.netNotify.state === 1) {
                console.log("netNotify.userID :"+eventData.netNotify.userID +"netNotify.state: "+eventData.netNotify.state);
                cc.director.loadScene("login");
            }
        }
    },
    /**
     * 移除监听
     */
    removeEvent() {
        cc.systemEvent.off(msg.MATCHVS_ERROE_MSG,this.onEvent);
        cc.systemEvent.off(msg.MATCHVS_CREATE_ROOM,this.onEvent);
        cc.systemEvent.off(msg.MATCHVS_NETWORK_STATE_NOTIFY,this.onEvent);
    },
});
