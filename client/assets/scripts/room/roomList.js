let mvs = require("Matchvs");
let msg = require("MatvhvsMessage");
let engine = require("MatchvsEngine");
let global = require("global");
let refreshNum = 0;
let time;
let firstRoomID = 0;
cc.Class({
    extends: cc.Component,

    properties: {
        returnMenu: cc.Node,

        firstRoom: {
            default: null,
            type: cc.Node
        },

        itemTemplate: {
            default: null,
            type: cc.Node
        },

        scrollView: {
            default: null,
            type: cc.ScrollView
        },
        spacing: 0,
        totalCount: 0,
        labelInfo: {
            default: null,
            type: cc.Label
        },
        refreshNumText: {
            default: null,
            type: cc.Label
        },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.content = this.scrollView.content;
        this.items = [];
        this.initEvent();
        this.getRooomList();
        this.returnMenu.on(cc.Node.EventType.TOUCH_END, function(){
            cc.director.loadScene("menu");
        });

        this.firstRoom.on(cc.Node.EventType.TOUCH_END, function(){
            if (firstRoomID !== 0)
            {
                engine.prototype.joinRoom(firstRoomID, "china");
                global.roomID = firstRoomID;
                cc.director.loadScene("createRoom");
            }
        });
    },

    // update (dt) {},

    onDestroy:function() {
        clearInterval(time);
        refreshNum = 0;
        this.removeEvent();
        console.log("RoomList 页面销毁");
    },

    getRooomList:function () {
        let RoomFilterEx = new mvs.MsRoomFilterEx();
        RoomFilterEx.maxPlayer = global.MAX_PLAYER_COUNT;
        RoomFilterEx.mode = 0;
        RoomFilterEx.canWatch = 0;
        RoomFilterEx.pageNo = 0;
        RoomFilterEx.pageSize = 10;
        engine.prototype.getRoomListEx(RoomFilterEx);
    },

    getRoomListExResponse: function(roomListExInfo) {
        this.totalCount  = roomListExInfo.total;
        this.content.height = this.totalCount * (this.itemTemplate.height + this.spacing) + this.spacing; // get total content height
        this.content.removeAllChildren(true);
        
        for(let i = 0; i < roomListExInfo.total; i++) {
            if (i == 0)
            {
                this.firstRoom.string = roomListExInfo.roomAttrs[i].roomID;
                firstRoomID = roomListExInfo.roomAttrs[i].roomID;
            }
            let item = cc.instantiate(this.itemTemplate);
            this.content.addChild(item);
            item.setPosition(0, -item.height * (0.5 + i) - this.spacing * (i + 1));
            //item.getComponent('Item').updateItem(roomListExInfo.roomAttrs[i]);
        }
    },

    /**
     * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
     */
    initEvent () {
        cc.systemEvent.on(msg.MATCHVS_ERROE_MSG,this.onEvent,this);
        cc.systemEvent.on(msg.MATCHVS_ROOM_LIST_EX,this.onEvent,this);
        cc.systemEvent.on(msg.MATCHVS_JOIN_ROOM_RSP,this.onEvent,this);
        cc.systemEvent.on(msg.MATCHVS_NETWORK_STATE_NOTIFY,this.onEvent,this);
    },

    /**
     * 接收事件
     * @param event
     */
    onEvent :function (event) {
        let eventData = event.data;
        switch (event.type) {
            case msg.MATCHVS_ROOM_LIST_EX:
                this.getRoomListExResponse(eventData.rsp);
                break;
            case msg.MATCHVS_ERROE_MSG:
                if (eventData.errorCode === 405) {
                    console.log("房间人数已满");
                    console.warn("房间人数已满");
                    return;
                }
                if (eventData.errorCode === 406) {
                    console.log("房间已joinOver");
                    console.warn("房间已joinOver");
                    return;
                }
                console.log("[Err]errCode:"+eventData.errorCode+" errMsg:"+eventData.errorMsg);
                cc.director.loadScene('login');
                break;
            case msg.MATCHVS_JOIN_ROOM_RSP:
                global.roomID = eventData.userInfoList.roomID;
                console.log("加入指定房间成功, roomID:" +  global.roomID);
                cc.director.loadScene('createRoom');
                break;
            case msg.MATCHVS_NETWORK_STATE_NOTIFY:
                if (eventData.netNotify.userID === global.userID && eventData.netNotify.state === 1) {
                    console.log("netNotify.userID :"+eventData.netNotify.userID +"netNotify.state: "+eventData.netNotify.state);
                    cc.director.loadScene("login");
                }
                break;
        }

    },

    /**
     * 移除监听
     */
    removeEvent:function () {
        cc.systemEvent.off(msg.MATCHVS_ERROE_MSG,this.onEvent);
        cc.systemEvent.off(msg.MATCHVS_ROOM_LIST_EX,this.onEvent);
        cc.systemEvent.off(msg.MATCHVS_JOIN_ROOM_RSP,this.onEvent);
        cc.systemEvent.off(msg.MATCHVS_NETWORK_STATE_NOTIFY,this.onEvent);
    },
});
