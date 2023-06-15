const board = document.querySelector(".board");
const score = document.querySelector("#score");
const curLevel = document.querySelector("#level");
const startBtn = document.querySelector(".start");
const startMenu = document.querySelector(".start-menu");
const gameContainer = document.querySelector(".game-container");
const playingSpace = document.querySelector(".playing-space");
const scoreText = document.querySelector(".score-txt");
const levelText = document.querySelector(".level-txt");
const gameOverMenu = document.querySelector(".game-over");
const finalScore = document.querySelector(".final-score");
const playAgain = document.querySelector(".play-again");

const pieces = ["square", "s", "z", "long", "l", "j", "t"];

let timer;
let playerScore = 0;
let level = 1;

// keep track of which rotation state a block is in
let orient = 1;

// dictates how fast the blocks fall
let interval = 400;

// score needed to level up
let target = 40;

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
  checkLineClears();
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
      clearInterval(timer);
      document.removeEventListener("keyup", userMoveBlock);
      timer = null;
      gameOverMenu.classList.remove("hide-game-over");
      playAgain.addEventListener("click", again);
      finalScore.textContent = playerScore;
    }
  }
}

// let the user move the blocks
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
      moveBlocks();
      break;
  }
}

// check for line clears
function checkLineClears() {
  // check the 20 lines
  for (let i = 4; i < 24; i++) {
    // check the blocks in each line
    clear = true;
    for (let j = i * 10; j < i * 10 + 10; j++) {
      if (!blocks[j].classList.contains("static")) {
        clear = false;
        break;
      }
    }
    if (clear) {
      // move the blocks down
      clearRow(i);
      playerScore += 10;
      score.textContent = playerScore;
      // level up
      if (playerScore >= target) {
        level += 1;
        curLevel.textContent = level;
        target += 40;
        interval -= 40;
        clearInterval(timer);
        timer = setInterval(moveBlocks, interval);
      }
    }
  }
}

// clears the row and moves the blocks above the row down
function clearRow(row) {
  let index = parseInt(row) * 10;
  for (let i = index; i < index + 10; i++) {
    blocks[i].className = "";
    blocks[i].classList.add("block");
  }
  for (let i = index - 1; i >= 40; i--) {
    classes = Array.from(blocks[i].classList);
    for (let j = 0; j < classes.length; j++) {
      if (classes[j] !== "block" && classes[j] != "spawn") {
        blocks[i].classList.remove(classes[j]);
        blocks[i + 10].classList.add(classes[j]);
      }
    }
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
      if (canRotate) {
        orient += 1;
        if (orient == 5) {
          orient = 1;
        }
      }
    }
  }

  // rotate z piece
  if (piece === "block-type-three") {
    let canRotate = RotateZ(blocksArray);
    if (canRotate) {
      // change the orientation state if rotation was successful
      if (canRotate) {
        orient += 1;
        if (orient == 5) {
          orient = 1;
        }
      }
    }
  }

  // rotate long piece
  if (piece === "block-type-four") {
    let canRotate = RotateLong(blocksArray);
    if (canRotate) {
      // change the orientation state if rotation was successful
      if (canRotate) {
        orient += 1;
        if (orient == 5) {
          orient = 1;
        }
      }
    }
  }

  // rotate "l" piece
  if (piece === "block-type-five") {
    let canRotate = RotateL(blocksArray);
    if (canRotate) {
      // change the orientation state if rotation was successful
      orient += 1;
      if (orient == 5) {
        orient = 1;
      }
    }
  }

  // rotate "j" piece
  if (piece === "block-type-six") {
    let canRotate = RotateJ(blocksArray);
    if (canRotate) {
      // change the orientation state if rotation was successful
      orient += 1;
      if (orient == 5) {
        orient = 1;
      }
    }
  }

  // rotate "t" piece
  if (piece === "block-type-seven") {
    let canRotate = RotateT(blocksArray);
    if (canRotate) {
      // change the orientation state if rotation was successful
      orient += 1;
      if (orient == 5) {
        orient = 1;
      }
    }
  }
}

// attempt to rotate the "s" piece
function RotateS(blocksArray) {
  // anchor of the piece
  let anchor = blocksArray[0];
  let id = parseInt(anchor.getAttribute("id"));

  // first orientation
  if (orient == 1) {
    let blockOne = id + 11;
    let blockTwo = id + 21;

    // try kicking from the bottom
    if (
      blockOne < 0 ||
      blockTwo > 239 ||
      blocks[blockOne].classList.contains("static") ||
      blocks[blockTwo].classList.contains("static")
    ) {
      let newOne = id - 10;
      let newTwo = id + 11;

      if (
        newOne < 0 ||
        newTwo > 239 ||
        blocks[newOne].classList.contains("static") ||
        blocks[newTwo].classList.contains("static")
      ) {
        return false;
      }

      let originalOne = id + 10;
      let originalTwo = id + 9;

      blocks[originalOne].classList.remove("block-type-two", "in-play");
      blocks[originalTwo].classList.remove("block-type-two", "in-play");
      blocks[newOne].classList.add("block-type-two", "in-play");
      blocks[newTwo].classList.add("block-type-two", "in-play");
      return true;
    }

    // can rotate
    let originalOne = id + 1;
    let originalTwo = id + 9;

    // rotate
    blocks[originalOne].classList.remove("block-type-two", "in-play");
    blocks[originalTwo].classList.remove("block-type-two", "in-play");
    blocks[blockOne].classList.add("block-type-two", "in-play");
    blocks[blockTwo].classList.add("block-type-two", "in-play");

    return true;
  }

  // second orientation
  if (orient == 2) {
    let blockOne = id + 20;
    let blockTwo = id + 19;

    // try wall kicking left
    if (
      id % 10 == 0 ||
      blockOne < 0 ||
      blockTwo > 239 ||
      blocks[blockOne].classList.contains("static") ||
      blocks[blockTwo].classList.contains("static")
    ) {
      let newOne = id + 12;
      let newTwo = id + 20;

      if (
        newOne < 0 ||
        newTwo > 239 ||
        blocks[newOne].classList.contains("static") ||
        blocks[newTwo].classList.contains("static")
      ) {
        return false;
      }

      let originalOne = id;
      let originalTwo = id + 10;

      blocks[originalOne].classList.remove("block-type-two", "in-play");
      blocks[originalTwo].classList.remove("block-type-two", "in-play");
      blocks[newOne].classList.add("block-type-two", "in-play");
      blocks[newTwo].classList.add("block-type-two", "in-play");
      return true;
    }

    // can rotate
    let originalOne = id;
    let originalTwo = id + 21;

    // rotate
    blocks[originalOne].classList.remove("block-type-two", "in-play");
    blocks[originalTwo].classList.remove("block-type-two", "in-play");
    blocks[blockOne].classList.add("block-type-two", "in-play");
    blocks[blockTwo].classList.add("block-type-two", "in-play");
    return true;
  }

  // third orientation
  if (orient == 3) {
    let blockOne = id - 11;
    let blockTwo = id - 1;

    // try kicking from the top
    if (
      blockOne < 0 ||
      blockTwo > 239 ||
      blocks[blockOne].classList.contains("static") ||
      blocks[blockTwo].classList.contains("static")
    ) {
      let newOne = id - 1;
      let newTwo = id + 20;

      if (
        newOne < 0 ||
        newTwo > 239 ||
        blocks[newOne].classList.contains("static") ||
        blocks[newTwo].classList.contains("static")
      ) {
        return false;
      }

      let originalOne = id;
      let originalTwo = id + 1;

      blocks[originalOne].classList.remove("block-type-two", "in-play");
      blocks[originalTwo].classList.remove("block-type-two", "in-play");
      blocks[newOne].classList.add("block-type-two", "in-play");
      blocks[newTwo].classList.add("block-type-two", "in-play");
      return true;
    }

    // can rotate
    let originalOne = id + 1;
    let originalTwo = id + 9;

    // rotate
    blocks[originalOne].classList.remove("block-type-two", "in-play");
    blocks[originalTwo].classList.remove("block-type-two", "in-play");
    blocks[blockOne].classList.add("block-type-two", "in-play");
    blocks[blockTwo].classList.add("block-type-two", "in-play");
    return true;
  }

  // fourth orientation
  if (orient == 4) {
    let blockOne = id + 1;
    let blockTwo = id + 2;

    // try wall kicking right
    if (
      id % 10 >= 8 ||
      blockOne < 0 ||
      blockTwo > 239 ||
      blocks[blockOne].classList.contains("static") ||
      blocks[blockTwo].classList.contains("static")
    ) {
      let newOne = id + 1;
      let newTwo = id + 9;

      if (
        newOne < 0 ||
        newTwo > 239 ||
        blocks[newOne].classList.contains("static") ||
        blocks[newTwo].classList.contains("static")
      ) {
        return false;
      }

      let originalOne = id + 11;
      let originalTwo = id + 21;

      blocks[originalOne].classList.remove("block-type-two", "in-play");
      blocks[originalTwo].classList.remove("block-type-two", "in-play");
      blocks[newOne].classList.add("block-type-two", "in-play");
      blocks[newTwo].classList.add("block-type-two", "in-play");
      return true;
    }

    // can rotate
    let originalOne = id;
    let originalTwo = id + 21;

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
  let id = parseInt(anchor.getAttribute("id"));

  // first orientation
  if (orient == 1) {
    let blockOne = id + 2;
    let blockTwo = id + 21;

    // try wall kicking from the bottom
    if (
      blockOne < 0 ||
      blockTwo > 239 ||
      blocks[blockOne].classList.contains("static") ||
      blocks[blockTwo].classList.contains("static")
    ) {
      let newOne = id - 8;
      let newTwo = id + 2;

      if (
        newOne < 0 ||
        newTwo > 239 ||
        blocks[newOne].classList.contains("static") ||
        blocks[newTwo].classList.contains("static")
      ) {
        return false;
      }

      let originalOne = id;
      let originalTwo = id + 12;

      blocks[originalOne].classList.remove("block-type-three", "in-play");
      blocks[originalTwo].classList.remove("block-type-three", "in-play");
      blocks[newOne].classList.add("block-type-three", "in-play");
      blocks[newTwo].classList.add("block-type-three", "in-play");
      return true;
    }

    // can rotate
    let originalOne = id;
    let originalTwo = id + 1;

    // rotate
    blocks[originalOne].classList.remove("block-type-three", "in-play");
    blocks[originalTwo].classList.remove("block-type-three", "in-play");
    blocks[blockOne].classList.add("block-type-three", "in-play");
    blocks[blockTwo].classList.add("block-type-three", "in-play");

    return true;
  }

  // second orientation
  if (orient == 2) {
    let blockOne = id + 8;
    let blockTwo = id + 20;

    // try wall kicking left
    if (
      id % 10 <= 1 ||
      blockOne < 0 ||
      blockTwo > 239 ||
      blocks[blockOne].classList.contains("static") ||
      blocks[blockTwo].classList.contains("static")
    ) {
      let newOne = id + 20;
      let newTwo = id + 21;

      if (
        newOne < 0 ||
        newTwo > 239 ||
        blocks[newOne].classList.contains("static") ||
        blocks[newTwo].classList.contains("static")
      ) {
        return false;
      }

      let originalOne = id;
      let originalTwo = id + 19;

      blocks[originalOne].classList.remove("block-type-three", "in-play");
      blocks[originalTwo].classList.remove("block-type-three", "in-play");
      blocks[newOne].classList.add("block-type-three", "in-play");
      blocks[newTwo].classList.add("block-type-three", "in-play");
      return true;
    }

    // can rotate
    let originalOne = id;
    let originalTwo = id + 10;

    // rotate
    blocks[originalOne].classList.remove("block-type-three", "in-play");
    blocks[originalTwo].classList.remove("block-type-three", "in-play");
    blocks[blockOne].classList.add("block-type-three", "in-play");
    blocks[blockTwo].classList.add("block-type-three", "in-play");
    return true;
  }

  // third orientation
  if (orient == 3) {
    let blockOne = id - 9;
    let blockTwo = id + 10;

    // try wall kicking from the top
    if (
      blockOne < 0 ||
      blockTwo > 239 ||
      blocks[blockOne].classList.contains("static") ||
      blocks[blockTwo].classList.contains("static")
    ) {
      let newOne = id + 10;
      let newTwo = id + 20;

      if (
        newOne < 0 ||
        newTwo > 239 ||
        blocks[newOne].classList.contains("static") ||
        blocks[newTwo].classList.contains("static")
      ) {
        return false;
      }

      let originalOne = id;
      let originalTwo = id + 12;

      blocks[originalOne].classList.remove("block-type-three", "in-play");
      blocks[originalTwo].classList.remove("block-type-three", "in-play");
      blocks[newOne].classList.add("block-type-three", "in-play");
      blocks[newTwo].classList.add("block-type-three", "in-play");
      return true;
    }

    // can rotate
    let originalOne = id + 11;
    let originalTwo = id + 12;

    // rotate
    blocks[originalOne].classList.remove("block-type-three", "in-play");
    blocks[originalTwo].classList.remove("block-type-three", "in-play");
    blocks[blockOne].classList.add("block-type-three", "in-play");
    blocks[blockTwo].classList.add("block-type-three", "in-play");
    return true;
  }

  // fourth orientation
  if (orient == 4) {
    let blockOne = id - 1;
    let blockTwo = id + 11;

    // try wall kicking from the right
    if (
      id % 10 == 9 ||
      blockOne < 0 ||
      blockTwo > 239 ||
      blocks[blockOne].classList.contains("static") ||
      blocks[blockTwo].classList.contains("static")
    ) {
      let newOne = id - 1;
      let newTwo = id - 2;

      if (
        newOne < 0 ||
        newTwo > 239 ||
        blocks[newOne].classList.contains("static") ||
        blocks[newTwo].classList.contains("static")
      ) {
        return false;
      }

      let originalOne = id;
      let originalTwo = id + 19;

      blocks[originalOne].classList.remove("block-type-three", "in-play");
      blocks[originalTwo].classList.remove("block-type-three", "in-play");
      blocks[newOne].classList.add("block-type-three", "in-play");
      blocks[newTwo].classList.add("block-type-three", "in-play");
      return true;
    }

    // can rotate
    let originalOne = id + 9;
    let originalTwo = id + 19;

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
  let id = parseInt(anchor.getAttribute("id"));

  // first orientation
  if (orient == 1) {
    let blockOne = id - 8;
    let blockTwo = id + 12;
    let blockThree = id + 22;

    // try to kick from the bottom
    if (
      blockOne < 0 ||
      blockThree > 239 ||
      blocks[blockTwo].classList.contains("static") ||
      blocks[blockThree].classList.contains("static")
    ) {
      let newOne = id - 28;
      let newTwo = id - 18;
      let newThree = id - 8;

      if (
        newOne < 0 ||
        newThree > 239 ||
        blocks[newOne].classList.contains("static") ||
        blocks[newTwo].classList.contains("static") ||
        blocks[newThree].classList.contains("static")
      ) {
        return false;
      }

      let originalOne = id;
      let originalTwo = id + 1;
      let originalThree = id + 3;

      blocks[originalOne].classList.remove("block-type-four", "in-play");
      blocks[originalTwo].classList.remove("block-type-four", "in-play");
      blocks[originalThree].classList.remove("block-type-four", "in-play");
      blocks[newOne].classList.add("block-type-four", "in-play");
      blocks[newTwo].classList.add("block-type-four", "in-play");
      blocks[newThree].classList.add("block-type-four", "in-play");
      return true;
    }

    // try to kick from the top
    else if (
      blockOne < 0 ||
      blockThree > 239 ||
      blocks[blockOne].classList.contains("static")
    ) {
      let newOne = id + 12;
      let newTwo = id + 22;
      let newThree = id + 32;

      if (
        newOne < 0 ||
        newThree > 239 ||
        blocks[newOne].classList.contains("static") ||
        blocks[newTwo].classList.contains("static") ||
        blocks[newThree].classList.contains("static")
      ) {
        return false;
      }

      let originalOne = id;
      let originalTwo = id + 1;
      let originalThree = id + 3;

      blocks[originalOne].classList.remove("block-type-four", "in-play");
      blocks[originalTwo].classList.remove("block-type-four", "in-play");
      blocks[originalThree].classList.remove("block-type-four", "in-play");
      blocks[newOne].classList.add("block-type-four", "in-play");
      blocks[newTwo].classList.add("block-type-four", "in-play");
      blocks[newThree].classList.add("block-type-four", "in-play");
      return true;
    }

    // can rotate
    let originalOne = id;
    let originalTwo = id + 1;
    let originalThree = id + 3;

    // rotate
    blocks[originalOne].classList.remove("block-type-four", "in-play");
    blocks[originalTwo].classList.remove("block-type-four", "in-play");
    blocks[originalThree].classList.remove("block-type-four", "in-play");
    blocks[blockOne].classList.add("block-type-four", "in-play");
    blocks[blockTwo].classList.add("block-type-four", "in-play");
    blocks[blockThree].classList.add("block-type-four", "in-play");
    return true;
  }

  // second orientation
  if (orient == 2) {
    let blockOne = id + 18;
    let blockTwo = id + 19;
    let blockThree = id + 21;

    // try to kick from left
    if (
      id % 10 <= 1 ||
      blockOne < 0 ||
      blockThree > 239 ||
      blocks[blockOne].classList.contains("static") ||
      blocks[blockTwo].classList.contains("static")
    ) {
      let newOne = id + 21;
      let newTwo = id + 22;
      let newThree = id + 23;

      if (
        newOne < 0 ||
        newThree > 239 ||
        blocks[newOne].classList.contains("static") ||
        blocks[newTwo].classList.contains("static") ||
        blocks[newThree].classList.contains("static")
      ) {
        return false;
      }

      let originalOne = id;
      let originalTwo = id + 10;
      let originalThree = id + 30;

      blocks[originalOne].classList.remove("block-type-four", "in-play");
      blocks[originalTwo].classList.remove("block-type-four", "in-play");
      blocks[originalThree].classList.remove("block-type-four", "in-play");
      blocks[newOne].classList.add("block-type-four", "in-play");
      blocks[newTwo].classList.add("block-type-four", "in-play");
      blocks[newThree].classList.add("block-type-four", "in-play");
      return true;
    }

    // try to kick from the right
    else if (
      blockOne < 0 ||
      blockThree > 239 ||
      id % 10 == 9 ||
      blocks[blockThree].classList.contains("static")
    ) {
      let newOne = id + 17;
      let newTwo = id + 18;
      let newThree = id + 19;

      if (
        newOne < 0 ||
        newThree > 239 ||
        blocks[newOne].classList.contains("static") ||
        blocks[newTwo].classList.contains("static") ||
        blocks[newThree].classList.contains("static")
      ) {
        return false;
      }

      let originalOne = id;
      let originalTwo = id + 10;
      let originalThree = id + 30;

      blocks[originalOne].classList.remove("block-type-four", "in-play");
      blocks[originalTwo].classList.remove("block-type-four", "in-play");
      blocks[originalThree].classList.remove("block-type-four", "in-play");
      blocks[newOne].classList.add("block-type-four", "in-play");
      blocks[newTwo].classList.add("block-type-four", "in-play");
      blocks[newThree].classList.add("block-type-four", "in-play");
      return true;
    }

    // can rotate
    let originalOne = id;
    let originalTwo = id + 10;
    let originalThree = id + 30;

    // rotate
    blocks[originalOne].classList.remove("block-type-four", "in-play");
    blocks[originalTwo].classList.remove("block-type-four", "in-play");
    blocks[originalThree].classList.remove("block-type-four", "in-play");
    blocks[blockOne].classList.add("block-type-four", "in-play");
    blocks[blockTwo].classList.add("block-type-four", "in-play");
    blocks[blockThree].classList.add("block-type-four", "in-play");
    return true;
  }

  // third orientation
  if (orient == 3) {
    let blockOne = id - 19;
    let blockTwo = id - 9;
    let blockThree = id + 11;

    // try to kick from the bottom
    if (
      blockOne < 0 ||
      blockThree > 239 ||
      blocks[blockThree].classList.contains("static")
    ) {
      let newOne = id - 29;
      let newTwo = id - 19;
      let newThree = id - 9;

      if (
        newOne < 0 ||
        newThree > 239 ||
        blocks[newOne].classList.contains("static") ||
        blocks[newTwo].classList.contains("static") ||
        blocks[newThree].classList.contains("static")
      ) {
        return false;
      }

      let originalOne = id;
      let originalTwo = id + 2;
      let originalThree = id + 3;

      blocks[originalOne].classList.remove("block-type-four", "in-play");
      blocks[originalTwo].classList.remove("block-type-four", "in-play");
      blocks[originalThree].classList.remove("block-type-four", "in-play");
      blocks[newOne].classList.add("block-type-four", "in-play");
      blocks[newTwo].classList.add("block-type-four", "in-play");
      blocks[newThree].classList.add("block-type-four", "in-play");
      return true;
    }

    // try to kick from the top
    else if (
      blockOne < 0 ||
      blockThree > 239 ||
      blocks[blockOne].classList.contains("static") ||
      blocks[blockTwo].classList.contains("static")
    ) {
      let newOne = id + 11;
      let newTwo = id + 21;
      let newThree = id + 31;

      if (
        newOne < 0 ||
        newThree > 239 ||
        blocks[newOne].classList.contains("static") ||
        blocks[newTwo].classList.contains("static") ||
        blocks[newThree].classList.contains("static")
      ) {
        return false;
      }

      let originalOne = id;
      let originalTwo = id + 2;
      let originalThree = id + 3;

      blocks[originalOne].classList.remove("block-type-four", "in-play");
      blocks[originalTwo].classList.remove("block-type-four", "in-play");
      blocks[originalThree].classList.remove("block-type-four", "in-play");
      blocks[newOne].classList.add("block-type-four", "in-play");
      blocks[newTwo].classList.add("block-type-four", "in-play");
      blocks[newThree].classList.add("block-type-four", "in-play");
      return true;
    }

    // can rotate
    let originalOne = id;
    let originalTwo = id + 2;
    let originalThree = id + 3;

    // rotate
    blocks[originalOne].classList.remove("block-type-four", "in-play");
    blocks[originalTwo].classList.remove("block-type-four", "in-play");
    blocks[originalThree].classList.remove("block-type-four", "in-play");
    blocks[blockOne].classList.add("block-type-four", "in-play");
    blocks[blockTwo].classList.add("block-type-four", "in-play");
    blocks[blockThree].classList.add("block-type-four", "in-play");
    return true;
  }

  // fourth orientation
  if (orient == 4) {
    let blockOne = id + 9;
    let blockTwo = id + 11;
    let blockThree = id + 12;

    // try to kick from left
    if (
      id % 10 == 0 ||
      blockOne < 0 ||
      blockThree > 239 ||
      blocks[blockOne].classList.contains("static")
    ) {
      let newOne = id + 11;
      let newTwo = id + 12;
      let newThree = id + 13;

      if (
        newOne < 0 ||
        newThree > 239 ||
        blocks[newOne].classList.contains("static") ||
        blocks[newTwo].classList.contains("static") ||
        blocks[newThree].classList.contains("static")
      ) {
        return false;
      }

      let originalOne = id;
      let originalTwo = id + 20;
      let originalThree = id + 30;

      blocks[originalOne].classList.remove("block-type-four", "in-play");
      blocks[originalTwo].classList.remove("block-type-four", "in-play");
      blocks[originalThree].classList.remove("block-type-four", "in-play");
      blocks[newOne].classList.add("block-type-four", "in-play");
      blocks[newTwo].classList.add("block-type-four", "in-play");
      blocks[newThree].classList.add("block-type-four", "in-play");
      return true;
    }

    // try to kick from the right
    else if (
      blockOne < 0 ||
      blockThree > 239 ||
      id % 10 >= 8 ||
      blocks[blockTwo].classList.contains("static") ||
      blocks[blockThree].classList.contains("static")
    ) {
      let newOne = id + 7;
      let newTwo = id + 8;
      let newThree = id + 9;

      if (
        newOne < 0 ||
        newThree > 239 ||
        blocks[newOne].classList.contains("static") ||
        blocks[newTwo].classList.contains("static") ||
        blocks[newThree].classList.contains("static")
      ) {
        return false;
      }

      let originalOne = id;
      let originalTwo = id + 20;
      let originalThree = id + 30;

      blocks[originalOne].classList.remove("block-type-four", "in-play");
      blocks[originalTwo].classList.remove("block-type-four", "in-play");
      blocks[originalThree].classList.remove("block-type-four", "in-play");
      blocks[newOne].classList.add("block-type-four", "in-play");
      blocks[newTwo].classList.add("block-type-four", "in-play");
      blocks[newThree].classList.add("block-type-four", "in-play");
      return true;
    }

    // can rotate
    let originalOne = id;
    let originalTwo = id + 20;
    let originalThree = id + 30;

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

// attempt to rotate the "l" piece
function RotateL(blocksArray) {
  // anchor of the piece
  let anchor = blocksArray[0];
  let id = parseInt(anchor.getAttribute("id"));

  // first orientation
  if (orient == 1) {
    let blockOne = id - 1;
    let blockTwo = id + 19;
    let blockThree = id + 20;

    // try to kick off the bottom
    if (
      blockOne < 0 ||
      blockThree > 239 ||
      blocks[blockOne].classList.contains("static") ||
      blocks[blockTwo].classList.contains("static") ||
      blocks[blockThree].classList.contains("static")
    ) {
      let newOne = id - 11;
      let newTwo = id - 1;

      if (
        newOne < 0 ||
        newTwo > 239 ||
        blocks[newOne].classList.contains("static") ||
        blocks[newTwo].classList.contains("static")
      ) {
        return false;
      }

      let originalOne = id;
      let originalTwo = id + 8;

      blocks[originalOne].classList.remove("block-type-five", "in-play");
      blocks[originalTwo].classList.remove("block-type-five", "in-play");
      blocks[newOne].classList.add("block-type-five", "in-play");
      blocks[newTwo].classList.add("block-type-five", "in-play");
      return true;
    }

    // can rotate
    let originalOne = id;
    let originalTwo = id + 8;
    let originalThree = id + 10;

    blocks[originalOne].classList.remove("block-type-five", "in-play");
    blocks[originalTwo].classList.remove("block-type-five", "in-play");
    blocks[originalThree].classList.remove("block-type-five", "in-play");
    blocks[blockOne].classList.add("block-type-five", "in-play");
    blocks[blockTwo].classList.add("block-type-five", "in-play");
    blocks[blockThree].classList.add("block-type-five", "in-play");
    return true;
  }

  // second orientation
  if (orient == 2) {
    let blockOne = id + 9;
    let blockTwo = id + 11;
    let blockThree = id + 19;

    // try to kick from the left
    if (
      id % 10 == 0 ||
      blockOne < 0 ||
      blockThree > 239 ||
      blocks[blockOne].classList.contains("static") ||
      blocks[blockTwo].classList.contains("static") ||
      blocks[blockThree].classList.contains("static")
    ) {
      let newOne = id + 11;
      let newTwo = id + 12;

      if (
        newOne < 0 ||
        newTwo > 239 ||
        blocks[newOne].classList.contains("static") ||
        blocks[newTwo].classList.contains("static")
      ) {
        return false;
      }

      let originalOne = id;
      let originalTwo = id + 21;

      blocks[originalOne].classList.remove("block-type-five", "in-play");
      blocks[originalTwo].classList.remove("block-type-five", "in-play");
      blocks[newOne].classList.add("block-type-five", "in-play");
      blocks[newTwo].classList.add("block-type-five", "in-play");
      return true;
    }

    // can rotate

    let originalOne = id;
    let originalTwo = id + 20;
    let originalThree = id + 21;
    blocks[originalOne].classList.remove("block-type-five", "in-play");
    blocks[originalTwo].classList.remove("block-type-five", "in-play");
    blocks[originalThree].classList.remove("block-type-five", "in-play");
    blocks[blockOne].classList.add("block-type-five", "in-play");
    blocks[blockTwo].classList.add("block-type-five", "in-play");
    blocks[blockThree].classList.add("block-type-five", "in-play");
    return true;
  }

  // third orientation
  if (orient == 3) {
    let blockOne = id - 10;
    let blockTwo = id - 9;
    let blockThree = id + 11;

    // try kicking from the top
    if (
      blockOne < 0 ||
      blockThree > 239 ||
      blocks[blockOne].classList.contains("static") ||
      blocks[blockTwo].classList.contains("static") ||
      blocks[blockThree].classList.contains("static")
    ) {
      let newOne = id + 11;
      let newTwo = id + 21;

      if (
        newOne < 0 ||
        newTwo > 239 ||
        blocks[newOne].classList.contains("static") ||
        blocks[newTwo].classList.contains("static")
      ) {
        return false;
      }

      let originalOne = id + 2;
      let originalTwo = id + 10;

      blocks[originalOne].classList.remove("block-type-five", "in-play");
      blocks[originalTwo].classList.remove("block-type-five", "in-play");
      blocks[newOne].classList.add("block-type-five", "in-play");
      blocks[newTwo].classList.add("block-type-five", "in-play");
      return true;
    }

    // can rotate
    let originalOne = id;
    let originalTwo = id + 2;
    let originalThree = id + 10;

    blocks[originalOne].classList.remove("block-type-five", "in-play");
    blocks[originalTwo].classList.remove("block-type-five", "in-play");
    blocks[originalThree].classList.remove("block-type-five", "in-play");
    blocks[blockOne].classList.add("block-type-five", "in-play");
    blocks[blockTwo].classList.add("block-type-five", "in-play");
    blocks[blockThree].classList.add("block-type-five", "in-play");
    return true;
  }

  // fourth orientation

  if (orient == 4) {
    let blockOne = id + 2;
    let blockTwo = id + 10;
    let blockThree = id + 12;

    // try to kick from the right
    if (
      id % 10 >= 8 ||
      blockOne < 0 ||
      blockThree > 239 ||
      blocks[blockOne].classList.contains("static") ||
      blocks[blockTwo].classList.contains("static") ||
      blocks[blockThree].classList.contains("static")
    ) {
      let newOne = id + 9;
      let newTwo = id + 10;

      if (
        newOne < 0 ||
        newTwo > 239 ||
        blocks[newOne].classList.contains("static") ||
        blocks[newTwo].classList.contains("static")
      ) {
        return false;
      }

      let originalOne = id;
      let originalTwo = id + 21;

      blocks[originalOne].classList.remove("block-type-five", "in-play");
      blocks[originalTwo].classList.remove("block-type-five", "in-play");
      blocks[newOne].classList.add("block-type-five", "in-play");
      blocks[newTwo].classList.add("block-type-five", "in-play");
      return true;
    }

    // can rotate
    let originalOne = id;
    let originalTwo = id + 1;
    let originalThree = id + 21;

    blocks[originalOne].classList.remove("block-type-five", "in-play");
    blocks[originalTwo].classList.remove("block-type-five", "in-play");
    blocks[originalThree].classList.remove("block-type-five", "in-play");
    blocks[blockOne].classList.add("block-type-five", "in-play");
    blocks[blockTwo].classList.add("block-type-five", "in-play");
    blocks[blockThree].classList.add("block-type-five", "in-play");
    return true;
  }
}

// attempt to rotate the "j" piece
function RotateJ(blocksArray) {
  // anchor of the piece
  let anchor = blocksArray[0];
  let id = parseInt(anchor.getAttribute("id"));

  // first orientation
  if (orient == 1) {
    let blockOne = id + 1;
    let blockTwo = id + 2;
    let blockThree = id + 21;

    // try to kick off the bottom
    if (
      blockOne < 0 ||
      blockThree > 239 ||
      blocks[blockOne].classList.contains("static") ||
      blocks[blockTwo].classList.contains("static") ||
      blocks[blockThree].classList.contains("static")
    ) {
      let newOne = id - 9;
      let newTwo = id - 8;
      let newThree = id + 1;

      if (
        newOne < 0 ||
        newThree > 239 ||
        blocks[newOne].classList.contains("static") ||
        blocks[newTwo].classList.contains("static") ||
        blocks[newThree].classList.contains("static")
      ) {
        return false;
      }

      let originalOne = id;
      let originalTwo = id + 10;
      let originalThree = id + 12;

      blocks[originalOne].classList.remove("block-type-six", "in-play");
      blocks[originalTwo].classList.remove("block-type-six", "in-play");
      blocks[originalThree].classList.remove("block-type-six", "in-play");
      blocks[newOne].classList.add("block-type-six", "in-play");
      blocks[newTwo].classList.add("block-type-six", "in-play");
      blocks[newThree].classList.add("block-type-six", "in-play");
      return true;
    }

    // can rotate
    let originalOne = id;
    let originalTwo = id + 10;
    let originalThree = id + 12;

    blocks[originalOne].classList.remove("block-type-six", "in-play");
    blocks[originalTwo].classList.remove("block-type-six", "in-play");
    blocks[originalThree].classList.remove("block-type-six", "in-play");
    blocks[blockOne].classList.add("block-type-six", "in-play");
    blocks[blockTwo].classList.add("block-type-six", "in-play");
    blocks[blockThree].classList.add("block-type-six", "in-play");
    return true;
  }

  // second orientation
  if (orient == 2) {
    let blockOne = id + 9;
    let blockTwo = id + 11;
    let blockThree = id + 21;

    // try to kick from the left
    if (
      id % 10 == 0 ||
      blockOne < 0 ||
      blockThree > 239 ||
      blocks[blockOne].classList.contains("static") ||
      blocks[blockTwo].classList.contains("static") ||
      blocks[blockThree].classList.contains("static")
    ) {
      let newOne = id + 11;
      let newTwo = id + 12;
      let newThree = id + 22;

      if (
        newOne < 0 ||
        newThree > 239 ||
        blocks[newOne].classList.contains("static") ||
        blocks[newTwo].classList.contains("static") ||
        blocks[newThree].classList.contains("static")
      ) {
        return false;
      }

      let originalOne = id;
      let originalTwo = id + 1;
      let originalThree = id + 20;

      blocks[originalOne].classList.remove("block-type-six", "in-play");
      blocks[originalTwo].classList.remove("block-type-six", "in-play");
      blocks[originalThree].classList.remove("block-type-six", "in-play");
      blocks[newOne].classList.add("block-type-six", "in-play");
      blocks[newTwo].classList.add("block-type-six", "in-play");
      blocks[newThree].classList.add("block-type-six", "in-play");
      return true;
    }

    // can rotate
    let originalOne = id;
    let originalTwo = id + 1;
    let originalThree = id + 20;

    blocks[originalOne].classList.remove("block-type-six", "in-play");
    blocks[originalTwo].classList.remove("block-type-six", "in-play");
    blocks[originalThree].classList.remove("block-type-six", "in-play");
    blocks[blockOne].classList.add("block-type-six", "in-play");
    blocks[blockTwo].classList.add("block-type-six", "in-play");
    blocks[blockThree].classList.add("block-type-six", "in-play");
    return true;
  }

  // third orientation
  if (orient == 3) {
    let blockOne = id - 9;
    let blockTwo = id + 10;
    let blockThree = id + 11;

    // try to kick from the top
    if (
      blockOne < 0 ||
      blockThree > 239 ||
      blocks[blockOne].classList.contains("static") ||
      blocks[blockTwo].classList.contains("static") ||
      blocks[blockThree].classList.contains("static")
    ) {
      let newOne = id + 11;
      let newTwo = id + 20;
      let newThree = id + 21;

      if (
        newOne < 0 ||
        newThree > 239 ||
        blocks[newOne].classList.contains("static") ||
        blocks[newTwo].classList.contains("static") ||
        blocks[newThree].classList.contains("static")
      ) {
        return false;
      }

      let originalOne = id;
      let originalTwo = id + 2;
      let originalThree = id + 12;

      blocks[originalOne].classList.remove("block-type-six", "in-play");
      blocks[originalTwo].classList.remove("block-type-six", "in-play");
      blocks[originalThree].classList.remove("block-type-six", "in-play");
      blocks[newOne].classList.add("block-type-six", "in-play");
      blocks[newTwo].classList.add("block-type-six", "in-play");
      blocks[newThree].classList.add("block-type-six", "in-play");
      return true;
    }

    // can rotate
    let originalOne = id;
    let originalTwo = id + 2;
    let originalThree = id + 12;

    blocks[originalOne].classList.remove("block-type-six", "in-play");
    blocks[originalTwo].classList.remove("block-type-six", "in-play");
    blocks[originalThree].classList.remove("block-type-six", "in-play");
    blocks[blockOne].classList.add("block-type-six", "in-play");
    blocks[blockTwo].classList.add("block-type-six", "in-play");
    blocks[blockThree].classList.add("block-type-six", "in-play");
    return true;
  }

  // fourth orientation
  if (orient == 4) {
    let blockOne = id - 1;
    let blockTwo = id + 9;
    let blockThree = id + 11;

    // try to kick from the right
    if (
      id % 10 == 9 ||
      blockOne < 0 ||
      blockThree > 239 ||
      blocks[blockOne].classList.contains("static") ||
      blocks[blockTwo].classList.contains("static") ||
      blocks[blockThree].classList.contains("static")
    ) {
      let newOne = id - 2;
      let newTwo = id + 8;
      let newThree = id + 9;

      if (
        newOne < 0 ||
        newThree > 239 ||
        blocks[newOne].classList.contains("static") ||
        blocks[newTwo].classList.contains("static") ||
        blocks[newThree].classList.contains("static")
      ) {
        return false;
      }

      let originalOne = id;
      let originalTwo = id + 19;
      let originalThree = id + 20;

      blocks[originalOne].classList.remove("block-type-six", "in-play");
      blocks[originalTwo].classList.remove("block-type-six", "in-play");
      blocks[originalThree].classList.remove("block-type-six", "in-play");
      blocks[newOne].classList.add("block-type-six", "in-play");
      blocks[newTwo].classList.add("block-type-six", "in-play");
      blocks[newThree].classList.add("block-type-six", "in-play");
      return true;
    }

    // can rotate
    let originalOne = id;
    let originalTwo = id + 19;
    let originalThree = id + 20;

    blocks[originalOne].classList.remove("block-type-six", "in-play");
    blocks[originalTwo].classList.remove("block-type-six", "in-play");
    blocks[originalThree].classList.remove("block-type-six", "in-play");
    blocks[blockOne].classList.add("block-type-six", "in-play");
    blocks[blockTwo].classList.add("block-type-six", "in-play");
    blocks[blockThree].classList.add("block-type-six", "in-play");
    return true;
  }
}

// attempt to rotate the "t" piece
function RotateT(blocksArray) {
  // anchor of the piece
  let anchor = blocksArray[0];
  let id = parseInt(anchor.getAttribute("id"));

  // first orientation
  if (orient == 1) {
    let blockOne = id - 9;

    // try to kick off the top
    if (
      blockOne < 0 ||
      blockOne > 239 ||
      blocks[blockOne].classList.contains("static")
    ) {
      let newOne = id + 10;
      let newTwo = id + 21;

      if (
        newOne < 0 ||
        newTwo > 239 ||
        blocks[newOne].classList.contains("static") ||
        blocks[newTwo].classList.contains("static")
      ) {
        return false;
      }

      let originalOne = id;
      let originalTwo = id + 2;

      blocks[originalOne].classList.remove("block-type-seven", "in-play");
      blocks[originalTwo].classList.remove("block-type-seven", "in-play");
      blocks[newOne].classList.add("block-type-seven", "in-play");
      blocks[newTwo].classList.add("block-type-seven", "in-play");
      return true;
    }

    // can rotate
    let originalOne = id + 2;

    blocks[originalOne].classList.remove("block-type-seven", "in-play");
    blocks[blockOne].classList.add("block-type-seven", "in-play");
    return true;
  }

  // second orientation
  if (orient == 2) {
    let blockOne = id + 11;

    // try to kick off the right
    if (
      id % 10 == 9 ||
      blockOne < 0 ||
      blockOne > 239 ||
      blocks[blockOne].classList.contains("static")
    ) {
      let newOne = id - 1;
      let newTwo = id + 8;

      if (
        newOne < 0 ||
        newTwo > 239 ||
        blocks[newOne].classList.contains("static") ||
        blocks[newTwo].classList.contains("static")
      ) {
        return false;
      }

      let originalOne = id;
      let originalTwo = id + 20;

      blocks[originalOne].classList.remove("block-type-seven", "in-play");
      blocks[originalTwo].classList.remove("block-type-seven", "in-play");
      blocks[newOne].classList.add("block-type-seven", "in-play");
      blocks[newTwo].classList.add("block-type-seven", "in-play");
      return true;
    }

    // can rotate
    let originalOne = id + 20;

    blocks[originalOne].classList.remove("block-type-seven", "in-play");
    blocks[blockOne].classList.add("block-type-seven", "in-play");
    return true;
  }

  // third orientation
  if (orient == 3) {
    let blockOne = id + 20;

    // try to kick off the bottom
    if (
      blockOne < 0 ||
      blockOne > 239 ||
      blocks[blockOne].classList.contains("static")
    ) {
      let newOne = id - 10;
      let newTwo = id + 1;

      if (
        newOne < 0 ||
        newTwo > 239 ||
        blocks[newOne].classList.contains("static") ||
        blocks[newTwo].classList.contains("static")
      ) {
        return false;
      }

      let originalOne = id + 9;
      let originalTwo = id + 11;

      blocks[originalOne].classList.remove("block-type-seven", "in-play");
      blocks[originalTwo].classList.remove("block-type-seven", "in-play");
      blocks[newOne].classList.add("block-type-seven", "in-play");
      blocks[newTwo].classList.add("block-type-seven", "in-play");
      return true;
    }

    // can rotate
    let originalOne = id + 9;

    blocks[originalOne].classList.remove("block-type-seven", "in-play");
    blocks[blockOne].classList.add("block-type-seven", "in-play");
    return true;
  }

  // fourth orientation
  if (orient == 4) {
    let blockOne = id + 9;

    // try to kick off the left
    if (
      id % 10 == 0 ||
      blockOne < 0 ||
      blockOne > 239 ||
      blocks[blockOne].classList.contains("static")
    ) {
      let newOne = id + 12;
      let newTwo = id + 21;

      if (
        newOne < 0 ||
        newTwo > 239 ||
        blocks[newOne].classList.contains("static") ||
        blocks[newTwo].classList.contains("static")
      ) {
        return false;
      }

      let originalOne = id;
      let originalTwo = id + 20;

      blocks[originalOne].classList.remove("block-type-seven", "in-play");
      blocks[originalTwo].classList.remove("block-type-seven", "in-play");
      blocks[newOne].classList.add("block-type-seven", "in-play");
      blocks[newTwo].classList.add("block-type-seven", "in-play");
      return true;
    }

    // can rotate
    let originalOne = id;
    blocks[originalOne].classList.remove("block-type-seven", "in-play");
    blocks[blockOne].classList.add("block-type-seven", "in-play");
    return true;
  }
}

// gets a random piece and calls the function to spawn it
function randomPiece() {
  const randNum = Math.floor(Math.random() * pieces.length);
  spawnPiece(pieces[randNum]);
}

// start the game
startBtn.addEventListener("click", startGame);

function startGame() {
  startMenu.classList.add("hide-menu");
  gameContainer.classList.remove("hide-border");
  playingSpace.classList.remove("hide-border");
  scoreText.classList.remove("hide-txt");
  levelText.classList.remove("hide-txt");
  randomPiece();
  timer = setInterval(moveBlocks, interval);
  startBtn.removeEventListener("click", startGame);
}

// clear the board of all pieces and start game again
function again() {
  for (let i = 239; i >= 40; i--) {
    blocks[i].className = "block";
  }
  for (let i = 0; i < 40; i++) {
    blocks[i].className = "block spawn";
  }
  randomPiece();
  timer = setInterval(moveBlocks, interval);
  gameOverMenu.classList.add("hide-game-over");
  playerScore = 0;
  level = 1;
  score.textContent = playerScore;
  curLevel.textContent = level;
}

document.addEventListener("keydown", userMoveBlock);
