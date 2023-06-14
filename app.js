const board = document.querySelector(".board");
const score = document.querySelector("#score");
//const pieces = ["square", "s", "z", "long", "l", "j", "t"];
const pieces = ["s", "z", "long"];

let timer;

// keep track of which rotation state a block is in
let orient = 1;

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
  block.classList.add("block", "static", "bottom");
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

  // orientation of a block is 1 by default
  orient = 1;
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
      rotate(blocksArray);
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

// rotates a piece
function rotate(blocksArray) {
  if (blocksArray.length == 0) {
    return;
  }

  const classes = Array.from(blocksArray[0].classList);

  let piece;
  for (let i = 0; i < classes.length; i++) {
    if (
      classes[i] !== "block" &&
      classes[i] !== "spawn" &&
      classes[i] !== "in-play"
    ) {
      piece = classes[i];
      break;
    }
  }

  // can't rotate a square
  if (piece === "block-type-one") {
    return;
  }

  // rotate s piece
  if (piece === "block-type-two") {
    let canRotate = RotateS(blocksArray);
    if (canRotate) {
      // change the orientation state if rotation was successful
      if (orient == 1) {
        orient = 2;
      } else {
        orient = 1;
      }
    }
  }

  // rotate z piece
  if (piece === "block-type-three") {
    let canRotate = RotateZ(blocksArray);
    if (canRotate) {
      // change the orientation state if rotation was successful
      if (orient == 1) {
        orient = 2;
      } else {
        orient = 1;
      }
    }
  }

  // rotate long piece
  if (piece === "block-type-four") {
    let canRotate = RotateLong(blocksArray);
    if (canRotate) {
      // change the orientation state if rotation was successful
      if (orient == 1) {
        orient = 2;
      } else {
        orient = 1;
      }
    }
  }
}

// attempt to rotate the "s" piece
function RotateS(blocksArray) {
  // anchor of the piece
  let anchor = blocksArray[0];
  let id = anchor.getAttribute("id");

  // first orientation
  if (orient == 1) {
    let blockOne = parseInt(id) - 10;
    let blockTwo = parseInt(id) + 11;

    // can't rotate
    if (
      blockOne < 0 ||
      blockTwo < 0 ||
      blockOne > 239 ||
      blockTwo > 239 ||
      blocks[blockOne].classList.contains("static") ||
      blocks[blockTwo].classList.contains("static")
    ) {
      return false;
    }

    // can rotate
    let originalOne = parseInt(id) + 9;
    let originalTwo = parseInt(id) + 10;

    // rotate
    blocks[originalOne].classList.remove("block-type-two", "in-play");
    blocks[originalTwo].classList.remove("block-type-two", "in-play");
    blocks[blockOne].classList.add("block-type-two", "in-play");
    blocks[blockTwo].classList.add("block-type-two", "in-play");

    return true;
  }

  // second orientation
  if (orient == 2) {
    let blockOne = parseInt(id) + 19;
    let blockTwo = parseInt(id) + 20;

    // can't rotate
    if (
      id % 10 == 0 ||
      blockOne < 0 ||
      blockTwo < 0 ||
      blockOne > 239 ||
      blockTwo > 239 ||
      blocks[blockOne].classList.contains("static") ||
      blocks[blockTwo].classList.contains("static")
    ) {
      return false;
    }

    // can rotate
    let originalOne = parseInt(id);
    let originalTwo = parseInt(id) + 21;

    // rotate
    blocks[originalOne].classList.remove("block-type-two", "in-play");
    blocks[originalTwo].classList.remove("block-type-two", "in-play");
    blocks[blockOne].classList.add("block-type-two", "in-play");
    blocks[blockTwo].classList.add("block-type-two", "in-play");

    return true;
  }
}

// attempt to rotate the "z" piece
function RotateZ(blocksArray) {
  // anchor of the piece
  let anchor = blocksArray[0];
  let id = anchor.getAttribute("id");

  // first orientation
  if (orient == 1) {
    let blockOne = parseInt(id) - 8;
    let blockTwo = parseInt(id) + 2;

    // can't rotate
    if (
      blockOne < 0 ||
      blockTwo < 0 ||
      blockOne > 239 ||
      blockTwo > 239 ||
      blocks[blockOne].classList.contains("static") ||
      blocks[blockTwo].classList.contains("static")
    ) {
      return false;
    }

    // can rotate
    let originalOne = parseInt(id);
    let originalTwo = parseInt(id) + 12;

    // rotate
    blocks[originalOne].classList.remove("block-type-three", "in-play");
    blocks[originalTwo].classList.remove("block-type-three", "in-play");
    blocks[blockOne].classList.add("block-type-three", "in-play");
    blocks[blockTwo].classList.add("block-type-three", "in-play");

    return true;
  }

  // second orientation
  if (orient == 2) {
    let blockOne = parseInt(id) + 8;
    let blockTwo = parseInt(id) + 20;

    // can't rotate
    if (
      id % 10 <= 1 ||
      blockOne < 0 ||
      blockTwo < 0 ||
      blockOne > 239 ||
      blockTwo > 239 ||
      blocks[blockOne].classList.contains("static") ||
      blocks[blockTwo].classList.contains("static")
    ) {
      return false;
    }

    // can rotate
    let originalOne = parseInt(id);
    let originalTwo = parseInt(id) + 10;

    // rotate
    blocks[originalOne].classList.remove("block-type-three", "in-play");
    blocks[originalTwo].classList.remove("block-type-three", "in-play");
    blocks[blockOne].classList.add("block-type-three", "in-play");
    blocks[blockTwo].classList.add("block-type-three", "in-play");
    return true;
  }
}

// attempt to rotate the long piece
function RotateLong(blocksArray) {
  // anchor of the piece
  let anchor = blocksArray[0];
  let id = anchor.getAttribute("id");

  // first orientation
  if (orient == 1) {
    let blockOne = parseInt(id) - 18;
    let blockTwo = parseInt(id) - 8;
    let blockThree = parseInt(id) + 12;

    // can't rotate
    if (
      blockOne < 0 ||
      blockThree > 239 ||
      blocks[blockOne].classList.contains("static") ||
      blocks[blockTwo].classList.contains("static") ||
      blocks[blockThree].classList.contains("static")
    ) {
      return false;
    }

    // can rotate
    let originalOne = parseInt(id);
    let originalTwo = parseInt(id) + 1;
    let originalThree = parseInt(id) + 3;

    // rotate
    blocks[originalOne].classList.remove("block-type-four", "in-play");
    blocks[originalTwo].classList.remove("block-type-four", "in-play");
    blocks[originalThree].classList.remove("block-type-four", "in-play");
    blocks[blockOne].classList.add("block-type-four", "in-play");
    blocks[blockTwo].classList.add("block-type-four", "in-play");
    blocks[blockThree].classList.add("block-type-four", "in-play");
    return true;
  }

  // other orientation

  if (orient == 2) {
    let blockOne = parseInt(id) + 18;
    let blockTwo = parseInt(id) + 19;
    let blockThree = parseInt(id) + 21;

    // can't rotate
    if (
      id % 10 <= 1 ||
      id % 10 >= 9 ||
      blockOne < 0 ||
      blockThree > 239 ||
      blocks[blockOne].classList.contains("static") ||
      blocks[blockTwo].classList.contains("static") ||
      blocks[blockThree].classList.contains("static")
    ) {
      return false;
    }

    // can rotate
    let originalOne = parseInt(id);
    let originalTwo = parseInt(id) + 10;
    let originalThree = parseInt(id) + 30;

    // rotate
    blocks[originalOne].classList.remove("block-type-four", "in-play");
    blocks[originalTwo].classList.remove("block-type-four", "in-play");
    blocks[originalThree].classList.remove("block-type-four", "in-play");
    blocks[blockOne].classList.add("block-type-four", "in-play");
    blocks[blockTwo].classList.add("block-type-four", "in-play");
    blocks[blockThree].classList.add("block-type-four", "in-play");
    return true;
  }
}

// gets a random piece and calls the function to spawn it
function randomPiece() {
  const randNum = Math.floor(Math.random() * pieces.length);
  spawnPiece(pieces[randNum]);
}

document.addEventListener("keyup", userMoveBlock);

randomPiece("s-right");
timer = setInterval(moveBlocks, 100);
