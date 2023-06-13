const board = document.querySelector(".board");
const score = document.querySelector("#score");
const pieces = ["square", "s", "z", "long", "l", "j", "t"];

let timer;

// create blocks

for (let i = 0; i < 40; i++) {
    let block = document.createElement("div");
    block.classList.add("block", "spawn");
    block.setAttribute("id", i);
    board.appendChild(block);
}
for (let i = 40; i < 240; i++) {
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
  block.setAttribute("id", i + 240);
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

  // create an s-shape
  if (type === "s") {
    blocks[5].classList.add("block-type-two", "in-play");
    blocks[6].classList.add("block-type-two", "in-play");
    blocks[14].classList.add("block-type-two", "in-play");
    blocks[15].classList.add("block-type-two", "in-play");
  }

  // create a z-shape
  if (type === "z") {
    blocks[4].classList.add("block-type-three", "in-play");
    blocks[5].classList.add("block-type-three", "in-play");
    blocks[15].classList.add("block-type-three", "in-play");
    blocks[16].classList.add("block-type-three", "in-play");
  }

  // create long shape
  if (type === "long") {
    blocks[3].classList.add("block-type-four", "in-play");
    blocks[4].classList.add("block-type-four", "in-play");
    blocks[5].classList.add("block-type-four", "in-play");
    blocks[6].classList.add("block-type-four", "in-play");
  }

  // create a l-shape
  if (type === "l") {
    blocks[13].classList.add("block-type-five", "in-play");
    blocks[14].classList.add("block-type-five", "in-play");
    blocks[15].classList.add("block-type-five", "in-play");
    blocks[5].classList.add("block-type-five", "in-play");
  }

  // create a j-shape
  if (type === "j") {
    blocks[3].classList.add("block-type-six", "in-play");
    blocks[13].classList.add("block-type-six", "in-play");
    blocks[14].classList.add("block-type-six", "in-play");
    blocks[15].classList.add("block-type-six", "in-play");
  }

  // create a t-shape
  if (type === "t") {
    blocks[3].classList.add("block-type-seven", "in-play");
    blocks[4].classList.add("block-type-seven", "in-play");
    blocks[5].classList.add("block-type-seven", "in-play");
    blocks[14].classList.add("block-type-seven", "in-play");
  }
}

// move the blocks in play down
function moveBlocks() {
  gameOver();
  checkCollisionsDown();
  for (let i = blocks.length - 1; i >= 0; i--) {
    if (blocks[i].classList.contains("in-play")) {
      let classes = Array.from(blocks[i].classList);
      let nextBlock = i + 10;
      for (let j = 0; j < classes.length; j++) {
        if (classes[j] !== "block" && classes[j] != "spawn") {
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

    if (bottomBlock < 250) {
      if (blocks[bottomBlock].classList.contains("static")) {
        blocksInPlay.forEach((block) => {
          block.classList.add("static");
          block.classList.remove("in-play");
        });

        // spawn another block
        randomPiece();
        return true;
      }
    }
  }
  return false;
}

// check for game over
function gameOver() {
  for (let i = 30; i < 40; i++) {
    if (blocks[i].classList.contains("static")) {
      score.innerHTML = "Game Over!";
      clearInterval(timer);
      document.removeEventListener("keyup", userMoveBlock);
      timer = null;
    }
  }
}

// let the user move the block left and right
function userMoveBlock(e) {
  blocksArray = Array.from(document.querySelectorAll(".in-play"));
  switch (e.key) {
    case "ArrowLeft":
      collision = checkCollisionsLeft(blocksArray) && checkCollisionsDown;
      if (!collision) {
        moveBlockLeft(blocksArray);
      }
      break;
    case "ArrowRight":
      collision = checkCollisionsRight(blocksArray) && checkCollisionsDown;
      if (!collision) {
        moveBlockRight(blocksArray);
      }
      break;
    case "ArrowUp":
      console.log("rotate block");
      break;
    case "ArrowDown":
      console.log("move block down");
  }
}

// check for collisions to the left
function checkCollisionsLeft(blocksArray) {
  for (let i = 0; i < blocksArray.length; i++) {
    let id = parseInt(blocksArray[i].getAttribute("id"));
    // block is located on the left edge of the board
    if (id % 10 === 0) {
      return true;
    }
    // there is a static block to the left of a block in-play
    let leftBlock = blocks[id - 1];
    if (leftBlock.classList.contains("static")) {
      return true;
    }
  }
  return false;
}

// check for collisions to the right
function checkCollisionsRight(blocksArray) {
  for (let i = 0; i < blocksArray.length; i++) {
    let id = parseInt(blocksArray[i].getAttribute("id"));
    // block is located on the right edge of the board
    if (id % 10 === 9) {
      return true;
    }
    // there is a static block to the right of a block in-play
    let rightBlock = blocks[id + 1];
    if (rightBlock.classList.contains("static")) {
      return true;
    }
  }
  return false;
}

// moves block to the left
function moveBlockLeft(blocksArray) {
  let newBlocks = [];
  let classes = new Set();
  blocksArray.forEach((block) => {
    let id = parseInt(block.getAttribute("id"));
    let classList = Array.from(blocks[id].classList);
    let leftBlock = blocks[id - 1];
    newBlocks.push(leftBlock);
    for (let j = 0; j < classList.length; j++) {
      if (classList[j] != "block" && classList[j] != "spawn") {
        block.classList.remove(classList[j]);
        classes.add(classList[j]);
      }
    }
  });
  newBlocks.forEach((block) => {
    for (const c of classes) {
      block.classList.add(c);
    }
  });
}

// move blocks to the right
function moveBlockRight(blocksArray) {
  let newBlocks = [];
  let classes = new Set();
  blocksArray.forEach((block) => {
    let id = parseInt(block.getAttribute("id"));
    let classList = Array.from(blocks[id].classList);
    let rightBlock = blocks[id + 1];
    newBlocks.push(rightBlock);
    for (let j = 0; j < classList.length; j++) {
      if (classList[j] != "block" && classList[j] != "spawn") {
        block.classList.remove(classList[j]);
        classes.add(classList[j]);
      }
    }
  });
  newBlocks.forEach((block) => {
    for (const c of classes) {
      block.classList.add(c);
    }
  });
}

// gets a random piece and calls the function to spawn it
function randomPiece() {
  const randNum = Math.floor(Math.random() * pieces.length);
  spawnPiece(pieces[randNum]);
}

document.addEventListener("keyup", userMoveBlock);

randomPiece("s-right");
timer = setInterval(moveBlocks, 75);
