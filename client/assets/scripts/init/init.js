let sence = require("sence");
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

        console.log("system init begin...");

        // 页面暂停三秒后进入登录页面
        setTimeout(() => {
            cc.director.loadScene(sence.LOGIN);
        }, 1000);

        console.log("system init end...");
    },

    // start () {},

    // update (dt) {},
});
