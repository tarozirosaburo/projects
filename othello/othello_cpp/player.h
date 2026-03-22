#pragma once//一回だけ読む
#include "board.h"

class Player {
    public:
    enum class Disc {
        Black, White
    };

    struct Move {
        int x;
        int y;
    };

    //暗黙的変換を防ぐ、Playerは必ず色を持つことを明示
    explicit Player(Disc color);

    /*基底クラスとして安全に使う
    呼び分けのためにvirtualつける、実体が何かで区別
    継承したときに変わるかもしれない
    コンパイラが自動生成する(実装はある)デストラクタを使う、
    余計な処理はしない=default
    破棄はPlayer, HumanPlayer共通の処理*/
    virtual ~Player() = default;

    //inlineらしい
    Disc getColor() const {return color;};

    /*純粋仮想関数、実装しないが派生クラスで必ずoverride
    行動は派生クラスに依存する*/
    virtual Move decideMove(const Board& board) const = 0;

    private://自分だけ見える
    Disc color;

    protected://自分+派生クラスも見える
    static Board::Stone toStone(Disc d);
};

class HumanPlayer : public Player {
    public:

    //Playerのコンストラクタをそのまま使わせる
    using Player::Player;

    Move decideMove(const Board& board) const override;
};