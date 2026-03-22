#include "board.h"
#include "player.h"
#include <iostream>
using namespace std;

Player::Player(Disc color) 
    : color(color) {
}

Board::Stone Player::toStone(Player::Disc d) {
    return (d == Player::Disc::Black
    ? Board::Stone::Black
    : Board::Stone::White);
}

Player::Move HumanPlayer::decideMove(const Board& board) const {
    //struct Move{int x, int y}
    Move move;

    while(true) {
        cout << "Input move(x, y): " << endl;
        cin >> move.x >> move.y;

        if (!cin) {
            cin.clear();
            cin.ignore(1024, '\n');
            cout << "Invalid input. Try again.\n";
            continue;
        }

        if (!board.canPlace(move.x, move.y, toStone(getColor()))) {
            cout << "You can't put there. Try again.\n";
            continue;
        }
        break;
    }
    return move;
};