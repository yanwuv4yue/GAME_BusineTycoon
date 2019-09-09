let msg = require("MatvhvsMessage");
let engine = require("MatchvsEngine");
let global = require("global");
let sence = require("sence");

let self;
cc.Class({
    extends: cc.Component,

    properties: {
        loginButton: cc.Node,
        begin: 1000,
        end: 9999,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        console.log("login page...");

        self = this;

        this.initEvent();

        // 初始化mvs引擎
        engine.prototype.init(global.channel, global.platform, global.gameID);

        // 登录按钮事件绑定
        this.loginButton.on(cc.Node.EventType.TOUCH_END, function(){
            console.log("click login button...");
            // TODO 获取用户的唯一主键，用于登录操作，后续改为获取微信的openID
            global.userID = Math.round(Math.random() * (this.end - this.begin) + this.begin);
            self.startLogin(global.userID, self);
            cc.director.loadScene(sence.LOBBY);
        }, this);
    },

    // start () {},

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
     * @param {*} userID 
     * @param {*} self 
     */
    startLogin:function(userID, self){
        try {
            var userData = JSON.parse(cc.sys.localStorage.getItem(userID));
            console.log("当前缓存中用户ID", userID, "的信息为：", userData);
            if (userData != null) {
                global.userID = userData.userID;
                global.name = userData.name;
                global.avatar = userData.avatar;
                self.login(userID, userData.token);
            }
            else
            {
                // 当缓存中不存在用户信息时直接注册新的用户数据
                engine.prototype.registerUser();
            }
        } catch (error) {
            console.warn("startLogin for error:"+error.message);
            // 登录失败时重新注册，注册成功后回调函数会自动触发登录操作
            engine.prototype.registerUser();
        }
    },

    /**
     * 登录信息
     * @param userID
     * @param token
     */
    login: function (userID, token) {
        console.log("开始登录...用户ID:", userID);
        engine.prototype.login(userID, token);
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
            // mvs初始化
            case msg.MATCHVS_INIT:
                global.isInit = true;
                break;
            // mvs用户注册
            case msg.MATCHVS_REGISTER_USER:
                cc.sys.localStorage.setItem(global.userID, JSON.stringify(eventData.userInfo));
                this.login(eventData.userInfo.userID, eventData.userInfo.token);
                break;
            // mvs登录
            case msg.MATCHVS_LOGIN:
                if (eventData.MsLoginRsp.roomID != null && eventData.MsLoginRsp.roomID !== '0') {
                    console.log("开始重连"+ eventData.MsLoginRsp.roomID);
                    engine.prototype.reconnect();
                } else {
                    console.log("登录成功回调：", eventData);
                    cc.director.loadScene(sence.LOBBY);
                }
                break;
            // mvs重连
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
                        cc.director.loadScene(sence.LOBBY);
                    } else  {
                        cc.director.loadScene(sence.ROOM_CREATE);
                    }
                } else {
                    cc.director.loadScene(sence.GAME);
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
