let msg = require("MatvhvsMessage");
let engine = require("MatchvsEngine");
let global = require("global");
cc.Class({
    extends: cc.Component,

    properties: {
        loginButton: cc.Node,
        begin: 1000,
        end: 9999,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        console.log("login page...");

        let self = this;
        this.initEvent();

        // 初始化mvs引擎
        engine.prototype.init(global.channel, global.platform, global.gameID);

        // 登录按钮事件绑定
        this.loginButton.on(cc.Node.EventType.TOUCH_END, function(){
            console.log("click login button...");
            cc.director.loadScene("menu");
            global.userID = Math.round(Math.random() * (this.end - this.begin) + this.begin);
            self.startLogin(global.userID, self);
        }, this);
    },

    // update (dt) {},

    /**
     * 生命周期，页面销毁
     */
    onDestroy () {
        this.removeEvent();
        console.log("Login页面销毁");
    },

    /**
     * 开始登录
     * @param {*} key 
     * @param {*} self 
     */
    startLogin:function(key, self){
        try {
            var userData = JSON.parse(cc.sys.localStorage.getItem(key));
            console.log(userData);
            if (userData.name !== "") {
                global.name = userData.name;
            } else {
                global.name = userData.userID;
            }
            global.avatar = userData.avatar;
            global.userID = userData.userID;
            self.login(userData.id, userData.token);
        } catch (error) {
            console.warn("startLogin for error:"+error.message);
            engine.prototype.registerUser();
        }
    },

    /**
     * 登录信息
     * @param id
     * @param token
     */
    login: function (id, token) {
        global.userID = id;
        console.log('开始登录...用户ID:' + id + " gameID " + global.gameID);
        engine.prototype.login(id, token);
    },

    /**
     * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
     */
    initEvent:function () {
        cc.systemEvent.on(msg.MATCHVS_INIT,this.onEvent,this);
        cc.systemEvent.on(msg.MATCHVS_RE_CONNECT,this.onEvent,this);
        cc.systemEvent.on(msg.MATCHVS_ERROE_MSG,this.onEvent,this);
        cc.systemEvent.on(msg.MATCHVS_REGISTER_USER,this.onEvent,this);
        cc.systemEvent.on(msg.MATCHVS_LOGIN,this.onEvent,this);
    },

    /**
     * 事件接收方法
     * @param event
     */
    onEvent:function (event) {
        let eventData = event.data;
        switch (event.type){
            case msg.MATCHVS_INIT:
                global.isInit = true;
                break;
            case msg.MATCHVS_REGISTER_USER:
                cc.sys.localStorage.setItem(global.playerID,JSON.stringify(eventData.userInfo));
                this.login(eventData.userInfo.id,eventData.userInfo.token);
                break;
            case msg.MATCHVS_LOGIN:
                if (eventData.MsLoginRsp.roomID != null && eventData.MsLoginRsp.roomID !== '0') {
                    console.log("开始重连"+ eventData.MsLoginRsp.roomID);
                    engine.prototype.reconnect();
                } else {
                    cc.director.loadScene("Lobby");
                }
                break;
            case msg.MATCHVS_RE_CONNECT:
                global.roomID = eventData.roomUserInfoList.roomID;
                if (eventData.roomUserInfoList.owner === global.userID) {
                    global.isRoomOwner = true;
                } else {
                    global.isRoomOwner = false;
                }
                if (eventData.roomUserInfoList.state === 1) {
                    if (eventData.roomUserInfoList.roomProperty === "") {
                        engine.prototype.leaveRoom();
                        cc.director.loadScene("Lobby");
                    } else  {
                        cc.director.loadScene('CreateRoom');
                    }
                } else {
                    cc.director.loadScene("zyankenGame");
                }
                break;
            case msg.MATCHVS_ERROE_MSG:
                console.log("[Err]errCode:"+eventData.errorCode+" errMsg:"+eventData.errorMsg);
                break;
        }
    },

    /**
     * 移除监听
     */
    removeEvent:function () {
        cc.systemEvent.off(msg.MATCHVS_INIT,this.onEvent);
        cc.systemEvent.off(msg.MATCHVS_RE_CONNECT,this.onEvent);
        cc.systemEvent.off(msg.MATCHVS_ERROE_MSG,this.onEvent);
        cc.systemEvent.off(msg.MATCHVS_REGISTER_USER,this.onEvent);
        cc.systemEvent.off(msg.MATCHVS_LOGIN,this.onEvent);
    },
});
