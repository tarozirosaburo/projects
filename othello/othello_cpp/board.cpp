#include "board.h"
#include <iostream>

using namespace std;

static const int dx[8] = {-1, -1, -1, 0, 0, 1, 1, 1};
static const int dy[8] = {-1, 0, 1, -1, 1, -1, 0, 1};

Board::Board() {
    for (int i = 0; i < size; i++) {
        for (int j = 0; j < size; j++) {
            board[i][j] = Stone::Empty;
        }
    }
    board[3][3] = Stone::White;
    board[3][4] = Stone::Black;
    board[4][3] = Stone::Black;
    board[4][4] = Stone::White;
}

bool Board::inBoard(int x, int y) const {
    return (0 <= x and x < size and 0 <= y and y < size);
}

void Board::print() const {
    cout << "  ";
    for (int j = 0; j < size; j++) {
        cout << j << " ";
    }
    cout << endl;

    for (int i = 0; i < size; i++) {
        cout << i << " ";
        for (int j = 0; j < size; j++) {
            if (board[i][j] == Stone::Black) cout << "B ";
            else if (board[i][j] == Stone::White) cout << "W ";
            else cout << ". ";
        }
        cout << endl;
    }
}

Board::Stone Board::opposite(Stone s) {
    if (s == Stone::Black) return Stone::White;
    if (s == Stone::White) return Stone::Black;
    return Stone::Empty;
}

bool Board::canPlace(int x, int y, Stone s) const {
    //int c = static_cast<int>(s);
    if (!inBoard(x, y) or board[x][y] != Stone::Empty) return false;

    for (int dir = 0; dir < 8; dir++) {
        int nx = x+dx[dir];
        int ny = y+dy[dir];
        bool foundOpponent = false;

        //1:黒なら-1:白を見たい
        while (inBoard(nx, ny) and board[nx][ny] == opposite(s)) {
            foundOpponent = true;
            nx += dx[dir];
            ny += dy[dir];
        }
        if (foundOpponent and inBoard(nx, ny) and board[nx][ny] == s) {
            return true;
        }
    }
    return false;
}

void Board::place(int x, int y, Stone s) {
    if (!canPlace(x, y, s)) return;
    //失敗したことが分かった方がいいかも***

    board[x][y] = s;

    for (int dir = 0; dir < 8; dir++) {
        int nx = x+dx[dir];
        int ny = y+dy[dir];
        int cnt = 0;

        while (inBoard(nx, ny) and board[nx][ny] == opposite(s)) {
            nx += dx[dir];
            ny += dy[dir];
            cnt++;
        }
        if (cnt > 0 and inBoard(nx, ny) and board[nx][ny] == s) {
            nx = x + dx[dir];
            ny = y + dy[dir];
            while (inBoard(nx, ny) and board[nx][ny] == opposite(s)) {
                board[nx][ny] = s;
                nx += dx[dir];
                ny += dy[dir];
            }
        }
    }
}

bool Board::hasAnyMove(Stone s) const {
    for (int i = 0; i < size; i++) {
        for (int j = 0; j < size; j++) {
            if (canPlace(i, j, s)) return true;
        }
    }
    return false;
}

int Board::countStone(Stone s) const {
    int cnt = 0;
    for (int i = 0; i < size; i++) {
        for (int j = 0; j < size; j++) {
            if (board[i][j] == s) cnt++;
        }
    }
    return cnt;
}