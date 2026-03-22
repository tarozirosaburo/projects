#pragma once

class Board {
    public:
    //正しい使い方を公開する、仕様
    static const int size = 8;

    enum class Stone {
        Empty = 0,
        Black = 1,
        White = -1
    };

    Board();//初期盤面
    void print() const;//盤面表示
    bool canPlace(int x, int y, Stone t) const;//石を置けるか
    void place(int x, int y, Stone t);//石を置いて反転

    bool hasAnyMove(Stone t) const;//おける手があるか
    int countStone(Stone t) const;//石の数を計算する

    private:
    //バグを防ぐために隠す、実装
    static Stone opposite(Stone s);
    Stone board[size][size];//0:空, 1:黒, -1:白

    bool inBoard(int x, int y) const;
    //->bool inBoard(const Board* this, int x, int y)の略
};