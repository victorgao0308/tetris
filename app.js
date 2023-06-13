const board = document.querySelector(".board");
const score = document.querySelector("#score");

let timer;

// create blocks
for (let i = 0; i < 200; i++) {
  let block = document.createElement("div");
  block.classList.add("block");
  block.setAttribute("id", i);
  board.appendChild(block);
}

// hidden row of blocks at the bottom, to help detect collisions
for (let i = 0; i < 10; i++) {
  let block = document.createElement("div");
  block.classList.add("block");
  block.classList.add("static");
  block.setAttribute("id", i + 200);
  board.appendChild(block);
}

const blocks = Array.from(document.querySelectorAll(".block"));

// create a new piece
function spawnPiece(type) {
  // create a square
  if (type === "square") {
    blocks[4].classList.add("block-type-one", "in-play");
    blocks[5].classList.add("block-type-one", "in-play");
    blocks[14].classList.add("block-type-one", "in-play");
    blocks[15].classList.add("block-type-one", "in-play");
  }
}

// move the blocks in play down
function moveBlocks() {
  checkCollisionsDown();
  gameOver();
  for (let i = blocks.length - 1; i >= 0; i--) {
    if (blocks[i].classList.contains("in-play")) {
      let classes = Array.from(blocks[i].classList);
      let nextBlock = i + 10;
      for (let j = 0; j < classes.length; j++) {
        if (classes[j] !== "block") {
          blocks[i].classList.remove(classes[j]);
          blocks[nextBlock].classList.add(classes[j]);
        }
      }
    }
  }
}

// check to see if blocks can move down
// if block cannot move down, set the current blocks that are in play to be static
function checkCollisionsDown() {
  const blocksInPlay = document.querySelectorAll(".in-play");
  const blocksArray = Array.from(blocksInPlay);
  for (let i = blocksArray.length - 1; i >= 0; i--) {
    // check bottom block
    let id = blocksArray[i].getAttribute("id");
    let bottomBlock = parseInt(id) + 10;

    if (bottomBlock < 210) {
      if (blocks[bottomBlock].classList.contains("static")) {
        blocksInPlay.forEach((block) => {
          block.classList.add("static");
          block.classList.remove("in-play");
        });
        // clearInterval(timer);
        // timer = null;
        spawnPiece("square");
        return true;
      }
    }
  }
  return false;
}

// check for game over
function gameOver() {
  if (
    blocks[4].classList.contains("static") ||
    blocks[5].classList.contains("static") ||
    blocks[14].classList.contains("static") ||
    blocks[15].classList.contains("static")
  ) {
    score.innerHTML = "Game Over!";
    clearInterval(timer);
    document.removeEventListener("keyup", userMoveBlock);
    timer = null;
  }
}

// let the user move the block left and right
function userMoveBlock(e) {
  switch (e.key) {
    case "ArrowLeft":
      collision = checkCollisionsLeft() && checkCollisionsDown;
      if (!collision) {
        moveBlockLeft();
      }
      break;
    case "ArrowRight":
      console.log("move right");
      break;
    case "ArrowUp":
      console.log("rotate block");
      break;
    case "ArrowDown":
      console.log("move block down");
  }
}

// check for collisions to the left
function checkCollisionsLeft() {
  const blocksArray = Array.from(document.querySelectorAll(".in-play"));
  for (let i = 0; i < blocksArray.length; i++) {
    let id = blocksArray[i].getAttribute("id");
    // block is located on the left edge of the board
    if (id % 10 === 0) {
      return true;
    }
    // there is a staic block to the left of a block in-play
    let leftBlock = blocks[id - 1];
    if (leftBlock.classList.contains("static")) {
      return true;
    }
  }
  return false;
}

// moves block to the left
function moveBlockLeft() {
  const blocksArray = Array.from(document.querySelectorAll(".in-play"));
  blocksArray.forEach((block) => {
    const id = block.getAttribute("id");
    let classList = Array.from(blocks[id].classList);
    let leftBlock = blocks[id - 1];
    for (let j = 0; j < classList.length; j++) {
      if (classList[j] != "block") {
        block.classList.remove(classList[j]);
        leftBlock.classList.add(classList[j]);
      }
    }
  });
}

document.addEventListener("keyup", userMoveBlock);

spawnPiece("square");
timer = setInterval(moveBlocks, 200);
