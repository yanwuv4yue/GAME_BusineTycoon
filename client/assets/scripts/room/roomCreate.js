let mvs = require("Matchvs");
let msg = require("MatvhvsMessage");
let engine = require("MatchvsEngine");
let global = require("global");
let sence = require("sence");
cc.Class({
    extends: cc.Component,

    properties: {
        owner: {
            default: null,
            type: cc.Label
        },
        player0: {
            default: null,
            type: cc.Label
        },
        player1: {
            default: null,
            type: cc.Label
        },
        gameStart: cc.Node,
        leaveRoom: cc.Node,
        userList :[],
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        console.log("createRoom begin...");

        let self = this;

        this.playerViewList = [this.player0, this.player1];

        if (global.roomID !== "") {
            engine.prototype.getRoomDetail(global.roomID);
        }

        this.initEvent();

        // 游戏开始
        this.gameStart.on(cc.Node.EventType.TOUCH_END, function(){
            self.startGameFunc();
        });

        this.leaveRoom.on(cc.Node.EventType.TOUCH_END, function(){
            engine.prototype.leaveRoom("");
            self.leaveRoomFunc();
        });
    },

    // update (dt) {},

    /**
     * 生命周期，销毁
     */
    onDestroy () {
        this.removeEvent();
        console.log("create Room 页面销毁");
    },

    /**
     * 展示玩家信息
     */
    initUserView: function(userProfile, userID, owner) {
        let info = JSON.parse(userProfile);
        console.log("=====", info);
        if (userID === owner)
        {
            this.owner.string = info.name;
        }
        else
        {
            for(let i = 0; i < this.playerViewList.length; i++) {
                console.log("-----", this.playerViewList[i].string, "-----", info.name);
                if (this.playerViewList[i].string === "待加入") {
                    this.playerViewList[i].string = info.name;
                    return;
                }
            }
        }
        
    },

    /**
     * 玩家退出将玩家的信息从页面上消去
     * @param info
     */
    removeView: function(info) {
        let userID = info.userID;
        for(let i = 0; i < this.userList.length; i++) {
            if(userID === this.userList[i].userID) {
                this.userList.splice(i,1);
                this.playerViewList[i].string = "待加入";
            }
        }

        if (userID === global.userID) {
            this.leaveRoomFunc();
        }
    },

    /**
     * 开始游戏
     */
    startGameFunc: function() {
        cc.director.loadScene(sence.GAME);
    },

    /**
     * 退出房间
     */
    leaveRoomFunc: function() {
        global.roomID = ""
        cc.director.loadScene(sence.LOBBY);
    },

    /**
     * 房主是通过joinRoom和getRoomDetail获得房间信息 ,非房主玩家是通过getRoomDetail获得房间信息
     * @param rsp
     */
    joinRoom: function (rsp) {
        if (rsp.owner === global.userID) {
            global.isRoomOwner = true;
        } else {
            global.isRoomOwner = false;
        }
        if (global.roomID !== "") {
            
        } else {
            global.roomID = rsp.roomID;
        }
    },

    /**
     * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
     */
    initEvent () {
        cc.systemEvent.on(msg.MATCHVS_ERROE_MSG,this.onEvent,this);
        cc.systemEvent.on(msg.MATCHVS_KICK_PLAYER,this.onEvent,this);
        cc.systemEvent.on(msg.MATCHVS_KICK_PLAYER_NOTIFY,this.onEvent,this);
        cc.systemEvent.on(msg.MATCHVS_JOIN_ROOM_RSP,this.onEvent,this);
        cc.systemEvent.on(msg.MATCHVS_SET_ROOM_PROPETY,this.onEvent,this);
        cc.systemEvent.on(msg.MATCHVS_SET_ROOM_PROPETY_NOTIFY,this.onEvent,this);
        cc.systemEvent.on(msg.MATCHVS_JOIN_ROOM_NOTIFY,this.onEvent,this);
        cc.systemEvent.on(msg.MATCHVS_ROOM_DETAIL,this.onEvent,this);
        cc.systemEvent.on(msg.MATCHVS_LEAVE_ROOM_NOTIFY,this.onEvent,this);
        cc.systemEvent.on(msg.MATCHVS_SEND_EVENT_NOTIFY,this.onEvent,this);
        cc.systemEvent.on(msg.MATCHVS_NETWORK_STATE_NOTIFY,this.onEvent,this);
    },

    /**
     * 时间接收
     * @param event
     */
    onEvent (event){
        let eventData = event.data;
        console.log("onEvent:",eventData);
        switch(event.type) {
            case msg.MATCHVS_JOIN_ROOM_NOTIFY:
                this.userList.push(eventData.roomUserInfo);
                this.initUserView(eventData.roomUserInfo.userProfile, eventData.roomUserInfo.userID, 0);
                break;
            case msg.MATCHVS_KICK_PLAYER:
                this.removeView(eventData.kickPlayerRsp);
                break;
            case msg.MATCHVS_KICK_PLAYER_NOTIFY:
                this.removeView(eventData.kickPlayerNotify);
                break;
            case msg.MATCHVS_SET_ROOM_PROPETY:
                this.setRoomPropertyResponse(eventData.rsp);
                break;
            case msg.MATCHVS_SET_ROOM_PROPETY_NOTIFY:
                this.setRoomPropertyResponse(eventData.rsp);
                break;
            case msg.MATCHVS_ROOM_DETAIL:
                console.log("..........", eventData.rsp);
                global.roomOwnerID = eventData.rsp.owner;
                this.joinRoom(eventData.rsp);
                for (let i in eventData.rsp.userInfos) {
                    console.log("this is ", i + 1, " user ", eventData.rsp.userInfos[i].userID, "and I am", global.userID);
                    this.initUserView(eventData.rsp.userInfos[i].userProfile, eventData.rsp.userInfos[i].userID, eventData.rsp.owner);
                    if (global.userID !== eventData.rsp.userInfos[i].userID) {
                        this.userList.push(eventData.rsp.userInfos[i]);
                    }
                }
                break;
            // 玩家退出房间事件
            case msg.MATCHVS_LEAVE_ROOM_NOTIFY:
                // 若退出的玩家为房主，则其他玩家一起退出
                if (global.roomOwnerID == eventData.leaveRoomInfo.userID)
                {
                    engine.prototype.leaveRoom();
                    cc.director.loadScene(sence.LOBBY);
                }
                this.removeView(eventData.leaveRoomInfo)
                break;
            case msg.MATCHVS_SEND_EVENT_NOTIFY:
                let data = JSON.parse(eventData.eventInfo.cpProto);
                if (data.action == msg.EVENT_GAME_START) {
                    this.startGame();
                }
                break;
            case msg.MATCHVS_ERROE_MSG:
                if (eventData.errorCode !== 400) {
                    cc.director.loadScene(sence.LOGIN);
                }
                break;
            case msg.MATCHVS_NETWORK_STATE_NOTIFY:
                if (eventData.netNotify.state === 1) {
                    engine.prototype.kickPlayer(eventData.netNotify.userID,"你断线了，被提出房间");
                }
                break;
        }
    },

    /**
     * 移除监听
     */
    removeEvent() {
        cc.systemEvent.off(msg.MATCHVS_ERROE_MSG,this.onEvent);
        cc.systemEvent.off(msg.MATCHVS_KICK_PLAYER,this.onEvent);
        cc.systemEvent.off(msg.MATCHVS_KICK_PLAYER_NOTIFY,this.onEvent);
        cc.systemEvent.off(msg.MATCHVS_JOIN_ROOM_RSP,this.onEvent);
        cc.systemEvent.off(msg.MATCHVS_SET_ROOM_PROPETY,this.onEvent);
        cc.systemEvent.off(msg.MATCHVS_SET_ROOM_PROPETY_NOTIFY,this.onEvent);
        cc.systemEvent.off(msg.MATCHVS_JOIN_ROOM_NOTIFY,this.onEvent);
        cc.systemEvent.off(msg.MATCHVS_ROOM_DETAIL,this.onEvent);
        cc.systemEvent.off(msg.MATCHVS_LEAVE_ROOM_NOTIFY,this.onEvent);
        cc.systemEvent.off(msg.MATCHVS_SEND_EVENT_NOTIFY,this.onEvent);
        cc.systemEvent.off(msg.MATCHVS_NETWORK_STATE_NOTIFY,this.onEvent);
    },
});
