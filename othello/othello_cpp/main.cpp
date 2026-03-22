#include "game.h"
#include "player.h"
#include <iostream>
using namespace std;

int main() {
    HumanPlayer black(Player::Disc::Black);
    HumanPlayer white(Player::Disc::White);

    Game game(&black, &white);
    game.run();

    return 0;
}