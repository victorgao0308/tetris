# Tetris
The classic game of Tetris made with vanilla JavaScript. There is a 10 x 20 board, with the 7 tetrominoes.
To play, simply put the files into a new directory and launch `index.html`.

Also available to play on my personal website: https://www.victorgaodev.com/tetris

The version on my website is slightly modified to be compatible with React.

## Controls:
Left arrow: move piece left\
Right arrow: move piece right\
Down arrow: increase falling speed of piece\
Up arrow: rotate piece

Piece rotations follows the Super Rotation System, and the program will try to "kick" pieces off a wall or block if it is unable to rotate at that position.

Clearing lines grants points, and reaching certain point thresholds increases the level and the fall speed of the blocks.

A hard mode poses increased difficulty, but increased points as well.
