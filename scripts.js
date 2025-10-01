// board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// bird
let birdWidth = 34; // img is 408/228 -> ratio = 17/12
let birdHeight = 24;

let birdImg;

let gameOverImg;

// pipes
let pipeArray = [];
let pipeWidth = 64; // ratio -> 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// position
let birdX = boardWidth / 8
let birdY = boardHeight / 2

// game physics
let velocityX = -2; // pipes moving left speed
let velocityY = 0; // jump speed
let gravity = 0.4;

// audio
let backgroundMusic = new Audio("./img/bgm_mario.mp3");
backgroundMusic.loop = true;

let gameOver = false;
let score = 0;

let bird = {
    y : birdY,
    x : birdX,
    width : birdWidth,
    height : birdHeight
}

window.onload = function() {
    const volumeSlider = document.getElementById("volumeSlider");
    volumeSlider.addEventListener("input", function() {
        backgroundMusic.volume = this.value;
    });

    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // game over
    gameOverImg = new Image();
    gameOverImg.src = "./img/game-over.png";

    dieSound = new Audio("./img/sfx_die.wav");

    // bird image
    birdImg = new Image();
    birdImg.src = "./img/flappybird.gif";
    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }
    
    topPipeImg = new Image();
    topPipeImg.src = "./img/toppipe.png"

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./img/bottompipe.png"

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); // generates pipes
    this.document.addEventListener("keydown", moveBird);
}

function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    // bird
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0); // apply gravity and limits height
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    // pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
        
        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; // two pipes so 1/2
            pipe.passed = true;
        }

        if (detectCollision(bird,pipe)) {
            gameOver = true;
        }
    }
    
    // clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth){
        pipeArray.shift(); // removes first element from the array
    }

    // score
    context.fillStyle = "black";
    context.font = "50px 'Press Start 2P'";  // pixelated retro style
    context.fillText(score, board.width / 14, board.height / 8);
 
    if(gameOver) {
        context.drawImage(gameOverImg, board.width/2 - 175, board.height/2 - 175, 350, 350);
        backgroundMusic.pause();
        dieSound.play(); 
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    // rand(0,1) * height/2 (0 = -128 * ____)/(1 = 128 -256...)
    let randPipeY = pipeY - pipeHeight / 4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img : topPipeImg,
        x: pipeX,
        y: randPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(topPipe);


    let bottomPipe = {
        img : bottomPipeImg,
        x: pipeX,
        y: randPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp");
    // jump
    velocityY = -6;

    // reset game

    if (gameOver) {
        bird.y = birdY;
        pipeArray = [];
        score = 0;
        gameOver = false;
        backgroundMusic.currentTime = 0;
        backgroundMusic.play();
    }
}

function detectCollision(a,b) {
    return  a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height && 
            a.y + a.height > b.y;
}