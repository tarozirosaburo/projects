//enum class Stone
const Stone = {
    EMPTY: 0,
    BLACK: 1,
    WHITE: -1
};

const size = 8;
const directions = [
    [-1, -1], [0, -1], [1, -1]
    , [-1, 0], [1, 0], 
    [-1, 1], [0, 1], [1, 1]];

//board
let board = Array.from({ length:size}, () =>
    Array(size).fill(Stone.EMPTY)
);

board[3][3] = Stone.WHITE;
board[3][4] = Stone.BLACK;
board[4][3] = Stone.BLACK;
board[4][4] = Stone.WHITE;

let turn = Stone.BLACK;

//盤面描画
///*
function readerBoard() {
    const boardDiv = document.getElementById("board");
    boardDiv.innerHTML = "";

    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.dataset.x = x;
            cell.dataset.y = y;

            if (canPlace(board, x, y, turn)) {
                cell.classList.add("can-place");
            }
            if (board[y][x] !== Stone.EMPTY) {
                const stone = document.createElement("div");
                stone.className = "stone "+
                    (board[y][x] === Stone.BLACK ? "black" : "white");
                cell.appendChild(stone);
            }

            cell.addEventListener("click", onCellClick);
            boardDiv.appendChild(cell);
        }
    }
}
//*/

function onCellClick(e) {
    const x = Number(e.currentTarget.dataset.x);
    const y = Number(e.currentTarget.dataset.y);

    if (!canPlace(board, x, y, turn)) return;

    place(board, x, y, turn);
    nextTurn();
    readerBoard();
    updateStatus();
    updateCount();
}


function inBoard(x, y) {
  return (0 <= x && x < size && 0 <= y && y < size);
}

function canPlace(board, x, y, turn) {
  if (!inBoard(x, y)) return false;
  if (board[y][x] !== Stone.EMPTY) return false;

  const opponent = -turn;

  for (const [dx, dy] of directions) {
    let nx = x + dx;
    let ny = y + dy;
    let foundOpponent = false;

    while (inBoard(nx, ny) && board[ny][nx] === opponent) {
      foundOpponent = true;
      nx += dx;
      ny += dy;
    }

    if (foundOpponent &&
      inBoard(nx, ny) &&
      board[ny][nx] === turn
    ) return true;
  }
  return false;
}

function place(board, x, y, turn) {
  board[y][x] = turn;
  const opponent = -turn;

  for (const [dx, dy] of directions) {
    let nx = x + dx;
    let ny = y + dy;
    const toFlip = [];

    while (inBoard(nx, ny) && board[ny][nx] === opponent) {
      toFlip.push([nx, ny]);
      nx += dx;
      ny += dy;
    }

    if (toFlip.length > 0 &&
      inBoard(nx, ny) &&
      board[ny][nx] === turn
    ) {
      for (const [fx, fy] of toFlip) {
        board[fy][fx] = turn;
      }
    }
  }
}

function handleClick(e) {
  const x = Number(e.target.dataset.x);
  const y = Number(e.target.dataset.y);

  if (!canPlace(board, x, y, turn)) return;

  place(board, x, y, turn);
  nextTurn();
  readerBoard();
}

function nextTurn() {
  turn = -turn;

  if (!hasAnyMove(board, turn)) {
    // パス
    turn = -turn;

    if (!hasAnyMove(board, turn)) {
      endGame();
    }
  }
}

function hasAnyMove(board, turn) {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (canPlace(board, x, y, turn)) {
        return true;
      }
    }
  }
  return false;
}

function endGame() {
  let black = 0;
  let white = 0;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (board[y][x] === Stone.BLACK) black++;
      if (board[y][x] === Stone.WHITE) white++;
    }
  }

  alert(`Black: ${black}, White: ${white}`);
}

function updateStatus() {
    const status = document.getElementById("status");

    if (turn === Stone.BLACK) {
        status.textContent = "黒の番です";
    } else {
        status.textContent = "白の番です";
    }
}

function updateCount() {
    const { black, white } = countStones();
    const countDiv = document.getElementById("count");
    countDiv.textContent = `黒: ${black}　白: ${white}`;
}


function countStones() {
    let black = 0;
    let white = 0;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (board[y][x] === Stone.BLACK) black++;
            else if (board[y][x] === Stone.WHITE) white++;
        }
    }
    return { black, white };
}

readerBoard();
updateStatus();
updateCount();