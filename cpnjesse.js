// Here all the magic happens
class cpnJesseQLearner {

    // Setting it all up
    constructor(context) {

        this.imgPath = '.\\images\\';
        this.cpnjesseImg = this.imgPath + 'cpnjesse.png';
        this.enemyImg = this.imgPath + 'enemy.png';
        this.fastforwardImg = this.imgPath + 'fast-forward.png';
        this.flagImg = this.imgPath + 'flag.png';
        this.pauseImg = this.imgPath + 'pause.png';
        this.playImg = this.imgPath + 'play.png';
        this.treasureImg = this.imgPath + 'treasure.png';
        
        this.context = context;
        
        let defaultBoard = [
            'S------',
            '-------',
            '-------',
            '-------',
            '-------',
            '-------',
            'Q-----E'
        ];
        this.board = defaultBoard;

        this.resetQTable();

        this.numberOfColumns = this.board[0].length;
        this.numerOfRows = this.board.length;
        this.maxWidth = 300;
        this.maxHeight = 300;
        this.context.lineWidth = 2;
        this.context.strokeStyle = '#000000';

        this.drawBoard();
        this.resetButtons();
    }

    // Resets/empties the QTable
    resetQTable() {
        this.qTable = new Map();
        for (let y=0; y<this.board.length; y++) {
            for (let x=0; x<this.board[y].length; x++) {
                this.qTable.set(x + '-' + y, [0, 0, 0, 0]);
                if (this.board[y].charAt(x) == 'S') {
                    this.startingState = x + '-' + y;
                }
                if (this.board[y].charAt(x) == 'E') {
                    this.endingState = x + '-' + y;
                }
            }
        }
    }

    // Returns char of the given position on the board
    getBoard(x,y) {
        return this.board[y].charAt(x);
    }

    // Set someting on a position on the board & redraw
    setBoard(x, y, char) {
        this.board[ y ] = this.board[ y ].substring(0, x) + char + this.board[ y ].substring(x+1);
        this.drawBoard();
    }

    // Completely (re)draw the board
    drawBoard() {
        // Draw the grid
        this.context.clearRect(0, 0, this.maxWidth, this.maxHeight);
        this.context.beginPath();
        this.context.strokeStyle = '#000000';

        // Vertical lines
        for (let x=this.context.lineWidth/2; x<=this.maxWidth+this.context.lineWidth; x=x+(this.maxWidth/this.numberOfColumns) ) {
            this.context.moveTo(x, 0);
            this.context.lineTo(x, this.maxHeight);
        }

        // Horizontal lines
        for (let y=this.context.lineWidth/2; y<=this.maxHeight+this.context.lineWidth; y=y+(this.maxHeight/this.numerOfRows) ) {
            this.context.moveTo(0, y);
            this.context.lineTo(this.maxWidth+this.context.lineWidth, y);
        }

        this.context.stroke();
        this.context.closePath();
    
        // 'Fill' the cells
        for (let y=0; y<this.board.length; y++) {
            for (let x=0; x<this.board[y].length; x++) {
                this.drawCell(x, y);
            }
        }
    }

    // Draw a cell: 
    // 1. Draw the icon
    // 2. Draw arrow
    drawCell(x, y) {
        // End/Treasure
        if (this.board[y].charAt(x)=='E') {
            this.drawIcon(this.treasureImg, x, y);

        // Enemy
        } else if (this.board[y].charAt(x)=='Q') {
            this.drawIcon(this.enemyImg, x, y);

        // Beginning/Flag
        } else if (this.board[y].charAt(x)=='S') {
            this.drawIcon(this.flagImg, x, y);

        // Nothing special
        } else {
            this.drawIcon('', x, y);
        }

        this.drawArrow(x, y);
    }

    // Draw an icon on a position on the board
    drawIcon(icon, x, y) {
        let image = new Image();
        let width = this.getCellWidth();
        let height = this.getCellHeight();
        let xPos = this.getX(x);
        let yPos = this.getY(y);
        if (icon != '') {
            image.src = icon;
            image.onload = function() {
                context.drawImage(image, xPos, yPos, width, height);
            };
        } else {
            // No icon to draw, must be an 'empty' field
            this.context.clearRect(xPos, yPos, width, height);
        }
    }

    // Draws the arrow on a position on the board
    drawArrow(x, y) {
        let arrows = this.qTable.get(x + '-' + y);

        // Only draw an arrow if there is at least one positive value
        if (Math.max(...arrows) > 0 || Math.min(...arrows) < 0 ) {
            // Make sure the arrow is in the middle of de cell
            let xPos = -this.getCellWidth()/4;
            let yPos = 0
            let xPosNew = this.getCellWidth()/4
            let yPosNew = yPos;

            // Relative positioning & rotating
            this.context.save();
            this.context.translate( this.getX(x) + this.getCellWidth()/2, this.getY(y) + this.getCellHeight()/2 );
            if (Math.max(...arrows)>0) {
                this.context.rotate( 2*Math.PI / 4 * (arrows.indexOf(Math.max(...arrows))-1) );
            } else {
                this.context.rotate( 2*Math.PI / 4 * (arrows.indexOf(Math.min(...arrows))-1) );
            }

            // Draw the arrow
            this.context.beginPath();
            this.context.moveTo(xPos, yPos);
            this.context.lineTo(xPosNew, yPosNew);
            this.context.lineTo(xPosNew-10, yPosNew-10);
            this.context.moveTo(xPosNew, yPosNew);
            this.context.lineTo(xPosNew-10, yPosNew+10);

            // Red or green arrow?
            if (Math.max(...arrows)>0) {
                this.context.strokeStyle = 'rgb(0,' + Math.floor((255/100)* arrows[arrows.indexOf(Math.max(...arrows))]) + ',0)';
            } else {
                this.context.strokeStyle = 'rgb(' + -1 * Math.floor((255/100)* arrows[arrows.indexOf(Math.min(...arrows))]) + ',0,0)';
            }                

            this.context.stroke();

            this.context.restore();
        }
    }

    // Helper functions
    getCellWidth() { return this.maxWidth / this.numberOfColumns - this.context.lineWidth; }
    getCellHeight() { return this.maxHeight / this.numerOfRows - this.context.lineWidth; }
    getX(position) { return this.maxWidth / this.numberOfColumns * position + this.context.lineWidth; }
    getY(position) { return this.maxHeight / this.numerOfRows * position + this.context.lineWidth; }

    // Draw a button
    drawButton(icon, position, selected) {
        let image = new Image();
        
        let xPos = 350;
        let yPos = 50*(position-1);
        let width = 50;
        let height = 50;

        // Green if selected, black otherwise
        if (selected) {
            this.context.strokeStyle = '#00FF00';        
        } else {
            this.context.strokeStyle = '#000000';        
        }
        
        this.context.beginPath();
        this.context.rect(xPos, yPos, width,height);
        this.context.stroke();

        if (icon=='') {
            // For the 'empty' icon
        } else {
            image.src = icon;
            image.onload = function() {
                context.clearRect(xPos+5, yPos+5, width-10, height-10);
                context.drawImage(image, xPos+5, yPos+5, width-10, height-10);
            };
        }        
    }

    // Set all buttons to 'not selected' 
    resetButtons(onlyTheFirstFour) {
        this.drawButton(this.flagImg, 1, false);
        this.drawButton(this.enemyImg, 2, false);
        this.drawButton(this.treasureImg, 3, false);
        this.drawButton('', 4, false);
        if (!onlyTheFirstFour) {
            this.drawButton(this.playImg, 6, false);
            speed = 0;
        }
    }

    // Move Cap'n Jesse from one cell to the other
    moveCpnJesse(oldX, oldY, x, y) {
        if (this.board[y].charAt(x)!='E') {
            this.drawIcon(this.cpnjesseImg, x, y);    
        }
        this.drawCell(parseInt(oldX,10), parseInt(oldY,10));
    }

    // Helper function to wait for N ms
    waitSomeTime(ms) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve('resolved');
            }, ms);
        });        
    }

    // The q-learning magic...
    async train(epsilon, discount) {
        
        // Keep training until stopped
        while(speed > 0) {
            let currentState = this.startingState;
            let nextState;
            let value;
            let action;
            let endIteration = false;

            // Keep going until iteration is ended (teasure is found)
            while(!endIteration) {
                let arr = currentState.split('-');
                let x = arr[0];
                let y = arr[1];
                let oldX = x;
                let oldY = y;

                // Choose next action based on E-greedy:
                // - If random < epsilon setting:
                //   - If QTable has values other than zero: get best actions
                //   - If QTable has only zeroes: choose random action
                // - If random >= epsilon setting: choose random action
                if( Math.random() < epsilon ) {
                    if (Math.max(...this.qTable.get(currentState)) == 0) {
                        do {
                            action = Math.floor((Math.random() * 4 ));                       
                        } while ( this.qTable.get(currentState)[action] != 0 )
                    } else {
                        action = this.qTable.get(currentState).indexOf(Math.max(...this.qTable.get(currentState))) ;
                    }
                } else {
                    action = Math.floor((Math.random() * 4 ));
                }

                // Move based on action
                switch (action) {
                    case 0: y--; break; // up
                    case 1: x++; break; // right
                    case 2: y++; break; // down
                    case 3: x--; break; // left
                }

                nextState = x + '-' + y;
                let tableValues = this.qTable.get(currentState);

                if (this.qTable.get(nextState) != undefined) {
                    this.moveCpnJesse(oldX, oldY, x, y);
                    
                    await this.waitSomeTime(100/Math.pow(speed,3));
                   
                    // Assign value based on new state
                    let values = Array.from(tableValues);
                    switch (this.board[y].charAt(x)) {
                        case '-' : value = 0; break;
                        case 'Q' : value = -100; break;
                        case 'E' : value = 100; endIteration = true; break;
                        default : value = 0; break;
                    }

                    // Q function...
                    let max = Math.max.apply(null, this.qTable.get(nextState));
                    if (max < 0) { max = 0 }

                    values[ action ] = 
                        values[ action ] + 
                        (1 * // learning rate 
                            (value + 
                            discount * max - 
                            values[ action ]));

                    this.qTable.set(currentState, values)
                    currentState =  x + '-' + y;
                } else {
                    // No state found, off the map :). Try again for another action.
                }
            }
        }
    }

    printQTable() {
        console.log(this.qTable);
    }
}


// Here all the user input is handled
document.onreadystatechange = function () {
    if (document.readyState === 'complete') {
        speed = 0; 
        choice = 0;
    
        canvas = document.getElementById('cpnjessecanvas');
        context = canvas.getContext('2d');
        cpnJesseQLearner = new cpnJesseQLearner(context);

        canvas.addEventListener('click', (e) => {
            let x = e.offsetX;
            let y = e.offsetY;
            
            // Secret button :) 
            if (x>350 && x<400 && y>200 && y<250) {
                cpnJesseQLearner.printQTable();
            }
            // Play / Fast forward / Pause button clicked?
            if (x>350 && x<400 && y>250 && y<300) {
                cpnJesseQLearner.resetButtons(true);
                choice = 0;
                if (speed == 0) {
                    cpnJesseQLearner.drawButton(cpnJesseQLearner.fastforwardImg, 6, true);
                    speed = 1;

                    cpnJesseQLearner.train(
                        0.5,    // e-greedy
                        0.9,    // discount
                    );
                } else if (speed == 1) {
                    speed = 2;
                    cpnJesseQLearner.drawButton(cpnJesseQLearner.pauseImg, 6, true);
                } else if (speed == 2 ) {
                    speed = 0;
                    cpnJesseQLearner.drawButton(cpnJesseQLearner.playImg, 6, false);
                }
            }

            // Flag button clicked?
            if (x>350 && x<400 && y>0 && y<50) {
                cpnJesseQLearner.resetButtons();
                cpnJesseQLearner.drawButton(cpnJesseQLearner.flagImg, 1, true);
                choice = 1;
            }
            // Enemy button clicked?
            if (x>350 && x<400 && y>50 && y<100) {
                cpnJesseQLearner.resetButtons();
                cpnJesseQLearner.drawButton(cpnJesseQLearner.enemyImg, 2, true);
                choice = 2;
            }
            // Treasure button clicked?
            if (x>350 && x<400 && y>100 && y<150) {
                cpnJesseQLearner.resetButtons();
                cpnJesseQLearner.drawButton(cpnJesseQLearner.treasureImg, 3, true);
                choice = 3;
            }
            // Empty button clicked?
            if (x>350 && x<400 && y>150 && y<200) {
                cpnJesseQLearner.resetButtons();
                cpnJesseQLearner.drawButton('', 4, true);
                choice = 4;
            }

            // Clicked on the grid?
            if (x>0 && x<300 && y>0 && y<300) {
                boardX = Math.floor( x / (cpnJesseQLearner.maxWidth / cpnJesseQLearner.numberOfColumns) );
                boardY = Math.floor( y / (cpnJesseQLearner.maxHeight / cpnJesseQLearner.numerOfRows) );
                
                // One of the first four buttons? Reset the QTable
                if (choice>0 && choice<5) {
                    cpnJesseQLearner.resetQTable();
                }

                // Flag
                if (choice==1) {                    
                    // Only set the flag if it doesn't cover the end 
                    if ( cpnJesseQLearner.getBoard(boardX, boardY) != 'E' ) {
                        // Remove flag from original position
                        let arr = cpnJesseQLearner.startingState.split('-');
                        let oldX = arr[0];
                        let oldY = arr[1];   
                        cpnJesseQLearner.setBoard( parseInt(oldX,10), parseInt(oldY,10), '-' );

                        // Set flag on new position
                        cpnJesseQLearner.setBoard( boardX, boardY, 'S' );
                        cpnJesseQLearner.startingState = boardX + '-' + boardY;
                    }
                }

                // Enemy
                if (choice==2) {
                    // Only set the enemy if it doesn't cover the flag or end 
                    if ( cpnJesseQLearner.getBoard(boardX, boardY) != 'E' && cpnJesseQLearner.getBoard(boardX, boardY) != 'S' ) {
                        cpnJesseQLearner.setBoard( boardX, boardY, 'Q' );
                    }

                }

                // Treasure
                if (choice==3) {
                    // Only set the treasure if it doesn't cover the flag 
                    if ( cpnJesseQLearner.getBoard(boardX, boardY) != 'S' ) {
                        // Remove treasure from original position
                        let arr = cpnJesseQLearner.endingState.split('-');
                        let oldX = arr[0];
                        let oldY = arr[1];   
                        cpnJesseQLearner.setBoard( parseInt(oldX,10), parseInt(oldY,10), '-' );

                        // Set treasure on new position
                        cpnJesseQLearner.setBoard( boardX, boardY, 'E' );
                        cpnJesseQLearner.endingState = boardX + '-' + boardY;
                    }

                }

                // Empty
                if (choice==4) {
                    // Only set it empty if it doesn't cover the flag or end 
                    if ( cpnJesseQLearner.getBoard(boardX, boardY) != 'E' && cpnJesseQLearner.getBoard(boardX, boardY) != 'S' ) {
                        cpnJesseQLearner.setBoard( boardX, boardY, '-' );
                    }
                }
            }
        });
    }
}