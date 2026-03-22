#include "game.h"
#include "player.h"

#include <iostream>

using namespace std;

Game::Game(const Player* Black, const Player* White) 
    //初期化リスト
    : board(),
      BlackPlayer(Black), 
      WhitePlayer(White),
      turn(Turn::Black)
{
}

Game::Turn Game::nextTurn(Turn t) {
    return (t == Turn::Black ? Turn::White : Turn::Black);
}

void Game::run() {
    while (!isFinished()) {
        board.print();
        cout << ((turn == Turn::Black ? "BLACK TURN" : "WHITE TURN")) << endl;
        playTurn();
        turn = nextTurn(turn);
    }
    board.print();
    printResult();
}

Board::Stone Game::toStone(Game::Turn t) {
    return (t == Game::Turn::Black
    ? Board::Stone::Black
    : Board::Stone::White);
}

int Game::count(Turn t) const {
    return board.countStone(toStone(t));
}

void Game::printResult() const {
    int Blackcnt = count(Turn::Black);
    int Whitecnt = count(Turn::White);

    cout << "Black: " << Blackcnt << endl;
    cout << "White: " << Whitecnt << endl;

    if (Blackcnt > Whitecnt) {
        cout << "Black wins" << endl;
    } else if (Blackcnt < Whitecnt) {
        cout << "White wins" << endl;
    } else {
        cout << "Draw" << endl;
    }
}


void Game::playTurn() {
    const Player* current = 
    (turn == Turn::Black ? BlackPlayer : WhitePlayer);
    if (!board.hasAnyMove(toStone(turn))) {
        cout << "pass" << endl;
        return;
    }

    Player::Move move = current->decideMove(board);
    board.place(move.x, move.y, toStone(turn));
}

bool Game::isFinished() const {
    return (!board.hasAnyMove(toStone(Turn::Black)) and 
            !board.hasAnyMove(toStone(Turn::White)));
}