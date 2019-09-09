let global = {
    RANDOM_MATCH: 1,  // 随机匹配
    PROPERTY_MATCH: 2,  // 属性匹配
    channel: 'Matchvs',
    platform: 'alpha',
    gameID: 217092,
    gameVersion: 1,
    appKey: '845160d97c26484a9c02bf2851f9c191#C',
    matchType: 1,
    tagsInfo: {"title": "A"},
    frameInfo: {"title" : "frameInfo"},

    userID: 0,
    name: "",
    avatar: "",
    
    playerUserIds: [],
    isInit:false,

    roomID: 0,
    roomOwnerID: 0,
    isRoomOwner: false,

    syncFrame: true,
    FRAME_RATE: 20,
    playertime: 60,
    isGameOver: false,
    mapType: "",
    FPS:30,//数据帧每秒采样次数
};

module.exports = global;