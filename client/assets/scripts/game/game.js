let ChessNode = require("chessNode");
let config = require("config");

cc.Class({
    extends: cc.Component,

    properties: {
        chessNodes: [cc.Prefab],
        board: cc.Layout
    },

    onLoad() {
        var self = this;

        // 加载棋盘
        cc.loader.loadRes("prefab/chessNode", function (err, prefab) {
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

                    self.chessNodes[i * chessBoardSize + j] = newNode;
                    board.node.addChild(newNode);
                }
            }
        });
    },

    start() {

    },

    // update (dt) {},

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
    }
});
