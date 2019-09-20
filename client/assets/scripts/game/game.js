let mvs = require("Matchvs");
let msg = require("MatvhvsMessage");
let engine = require("MatchvsEngine");
let ChessNode = require("chessNode");
let config = require("config");
let common = require("common");

cc.Class({
    extends: cc.Component,

    properties: {
        chessNodes: [cc.Prefab],
        board: cc.Layout,
        pieces: cc.Layout
    },

    onLoad() {
        // 注册监听事件
        this.initEvent();

        this.loadChessBoard()
            .then(() => this.waitMyTurn())
            .then(() => this.addPiece())
            .then((pieceTitle) => this.getPieceNotice(pieceTitle))
            .then(() => this.addPiece())
            .then((pieceTitle) => this.getPieceNotice(pieceTitle))
            .then(() => this.addPiece())
            .then((pieceTitle) => this.getPieceNotice(pieceTitle))
            .then(() => this.addPiece())
            .then((pieceTitle) => this.getPieceNotice(pieceTitle))
            .then(() => this.addPiece())
            .then((pieceTitle) => this.getPieceNotice(pieceTitle))
            .then(() => this.addPiece())
            .then((pieceTitle) => this.getPieceNotice(pieceTitle));
    },

    start() {

    },

    /**
     * 生命周期，销毁
     */
    onDestroy () {
        this.removeEvent();
    },

    // 等待我的回合
    waitMyTurn() {
        // TODO
        return new Promise(function (resolve, reject) {
            cc.log("My turn!");
            resolve();
        });
    },

    // 通知获得棋子
    getPieceNotice(pieceTitle) {
        // TODO
        return new Promise(function (resolve, reject) {
            cc.log("I get the piece: " + pieceTitle);
            resolve();
        });
    },

    // 放置棋子
    onPieceClicked(chessNode) {
        // TODO
        chessNode.onNormalSelected();

        // 将放置棋子动作广播给其他客户端
        let event = {
            action: msg.EVENT_PLAYER_CHESS_DOWN,
            param: {
                chessTitle: chessNode.title.string
            }
        }
        engine.prototype.sendEvent(event);
    },

    // 加载棋盘
    loadChessBoard() {
        var self = this;
        return new Promise(function (resolve, reject) {
            cc.loader.loadRes("prefab/chessNode", function (err, prefab) {
                if (err != null) {
                    reject(err);

                } else {
                    let board = self.board;
                    let chessBoardSize = config.CHESS_BOARD_SIZE > 10 ? 10 : config.CHESS_BOARD_SIZE;
                    let baseWidth = board.node.getContentSize().width / chessBoardSize;
                    let chessNodeSize = new cc.size(baseWidth, baseWidth);
                    cc.log("ChessNode Size: " + chessNodeSize);
                    for (let i = 0; i < chessBoardSize; i++) {
                        for (let j = 0; j < chessBoardSize; j++) {
                            let newNode = cc.instantiate(prefab);
                            newNode.setContentSize(chessNodeSize);
                            let title = newNode.getComponent(ChessNode).title;
                            title.fontSize = baseWidth * 0.5;
                            title.lineHeight = baseWidth * 0.5;
                            title.string = self.getColumnTitle(i) + (j + 1);

                            let hashcode = common.hashCode(title.string);
                            let length = chessBoardSize * chessBoardSize;
                            let index = hashcode % length;
                            while (self.chessNodes[index] != null) {
                                index = index + 1;
                                if (index >= length) index = 0;
                            }
                            self.chessNodes[index] = newNode;
                            board.node.addChild(newNode);
                        }
                    }
                    // self.logChessNodes();
                    resolve();
                }
            });
        });
    },

    // 追加棋子
    addPiece() {
        var self = this;
        // 随机取棋
        let chessNode = self.getRandomChessNode();
        if (chessNode != null) {
            let chessTitle = chessNode.getComponent(ChessNode).title.string;
            return new Promise(function (resolve, reject) {
                cc.loader.loadRes("prefab/chessNode", function (err, prefab) {
                    if (err != null) {
                        reject(err);

                    } else {
                        let pieces = self.pieces;
                        let piecesSize = config.CHESS_PIECE_SIZE > 6 ? 6 : config.CHESS_PIECE_SIZE;
                        let spaceX = pieces.getComponent(cc.Layout).spacingX;
                        let baseWidth = (pieces.node.getContentSize().width - spaceX * (piecesSize - 1)) / piecesSize;
                        let pieceNodeSize = new cc.size(baseWidth, baseWidth);
                        let newPieceNode = cc.instantiate(prefab);
                        newPieceNode.setContentSize(pieceNodeSize);
                        newPieceNode.anchorY = 1.0;
                        // piece点击事件绑定
                        newPieceNode.on(cc.Node.EventType.TOUCH_END, function () {
                            // 玩家事件
                            self.onPieceClicked(chessNode.getComponent(ChessNode));
                            // 注销点击事件
                            newPieceNode.off(cc.Node.EventType.TOUCH_END);
                            // 销毁节点
                            newPieceNode.destroy();
                        });
                        let title = newPieceNode.getComponent(ChessNode).title;
                        title.node.anchorY = 1.0;
                        title.fontSize = baseWidth * 0.5;
                        title.lineHeight = baseWidth * 0.5;
                        title.string = chessTitle;
                        pieces.node.addChild(newPieceNode);

                        resolve(chessTitle);
                    }
                });
            });
        }
    },

    // 随机取棋
    getRandomChessNode() {
        let length = this.chessNodes.length;
        let index = parseInt(Math.random() * length, 10);
        for (let count = 0; count < length; count++) {
            let chessNode = this.chessNodes[index].getComponent(ChessNode);
            if (!chessNode.picked) {
                chessNode.picked = true;
                return this.chessNodes[index];
            }
            cc.log(chessNode.title.string + " is picked!");
            index = index + 1;
            if (index >= length) index = 0;
        }
        cc.log("all picked!");
        return null;
    },

    // 获取棋子
    getChessNode(chessTitle) {
        let hashcode = common.hashCode(chessTitle);
        let length = this.chessNodes.length;
        let index = hashcode % length;
        for (let count = 0; count < length; count++) {
            let title = this.chessNodes[index].getComponent(ChessNode).title;
            if (title.string === chessTitle) {
                return this.chessNodes[index];
            }
            index = index + 1;
            if (index >= length) index = 0;
        }
        return null;
    },

    getColumnTitle(column) {
        switch (column) {
            case 0: return "A";
            case 1: return "B";
            case 2: return "C";
            case 3: return "D";
            case 4: return "E";
            case 5: return "F";
            case 6: return "G";
            case 7: return "H";
            case 8: return "I";
            case 9: return "J";
            default: return "";
        }
    },

    logChessNodes() {
        let size = parseInt(Math.sqrt(this.chessNodes.length), 10);
        for (let i = 0; i < size; i++) {
            let titles = "";
            for (let j = 0; j < size; j++) {
                let node = this.chessNodes[i * size + j];
                if (node !== null) {
                    if (titles !== "") titles = titles + " ";
                    titles = titles + node.getComponent(ChessNode).title.string;
                }
            }
            cc.log("[" + titles + "]");
        }
    },

    /**
     * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
     */
    initEvent () {
        cc.systemEvent.on(msg.MATCHVS_SEND_EVENT_NOTIFY, this.onEvent, this);
    },

    /**
     * 时间接收
     * @param event
     */
    onEvent (event){
        let eventData = event.data;
        console.log("onEvent:",eventData);
        switch(event.type) {
            case msg.MATCHVS_SEND_EVENT_NOTIFY:
                let data = JSON.parse(eventData.eventInfo.cpProto);
                if (data.action == msg.EVENT_PLAYER_CHESS_DOWN) {
                    console.log("chess down!", data)
                    let title = data.param.chessTitle
                    let node = this.getChessNode(title).getComponent("chessNode")
                    node.onNormalSelected()
                }
                break;
        }
    },

    /**
     * 移除监听
     */
    removeEvent() {
        cc.systemEvent.off(msg.MATCHVS_SEND_EVENT_NOTIFY, this.onEvent);
    },
});
