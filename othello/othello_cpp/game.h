#pragma once
#include "board.h"

class Player;

class Game {
    public:
    enum class Turn {
        Black, 
        White
    };
    Game(const Player* Black, const Player* White);

    void run();
    void printResult() const;
    
    private:
    Board board;
    const Player* BlackPlayer;
    const Player* WhitePlayer;
    Turn turn;

    Turn nextTurn(Turn t);
    int count(Turn t) const;
    void playTurn();
    bool isFinished() const;

    static Board::Stone toStone(Turn t);
};