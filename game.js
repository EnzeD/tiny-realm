let speed = 500;

let imageLoader = new ImageLoader();
let gameReady = false;
let lstSprites = [];

let spritePlayer;
let spriteEnemy;

const SCALE = 5;

function rnd(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}

function load() {
    document.addEventListener("keydown", keyDown, false);
    document.addEventListener("keyup", keyUp, false);

    imageLoader.add("images/enemyred.png");
    imageLoader.add("images/player.png");
    imageLoader.add("images/Units.png");
    imageLoader.add("images/Animals.png");
    imageLoader.add("images/Overworld.png");

    imageLoader.start(startGame);
}

function startGame() {
    console.log("Game Started");

    lstSprites = [];

    // Map
    let imageMap = imageLoader.getImage("images/Overworld.png");
    spriteMap = new Sprite(imageMap);
    spriteMap.setTileSheet(8, 8);
    spriteMap.currentFrame = 0;
    spriteMap.setScale(SCALE, SCALE);

    // Joueur
    let imagePlayer = imageLoader.getImage("images/player.png");
    spritePlayer = new Sprite(imagePlayer);
    spritePlayer.setTileSheet(30, 16);
    spritePlayer.x = 25 * 4;
    spritePlayer.setScale(4, 4);
    spritePlayer.addAnimation("TURNRIGHT", [0, 1, 2, 3, 4, 5, 6, 7, 8], 0.1, false);
    spritePlayer.addAnimation("TURNUP", [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], 0.1, false);
    spritePlayer.startAnimation("TURNRIGHT");

    // Ennemi rouge
    let imageEnemy = imageLoader.getImage("images/enemyred.png");
    spriteEnemy = new Sprite(imageEnemy);
    spriteEnemy.setTileSheet(24, 24);
    spriteEnemy.setScale(4, 4);
    spriteEnemy.addAnimation("TURN", [0, 1, 2, 3, 4, 5], 0.1);
    spriteEnemy.startAnimation("TURN");


    lstSprites.push(spriteMap);
    //lstSprites.push(spritePlayer);
    //lstSprites.push(spriteEnemy);

    gameReady = true;
}

function update(dt) {
    if (!gameReady) {
        return;
    }

    lstSprites.forEach(sprite => {
        sprite.update(dt);
    });

    if (spritePlayer.currentAnimation.name == "TURNRIGHT" && spritePlayer.currentAnimation.end) {
        spritePlayer.startAnimation("TURNUP");
    }

    // checkPlayerInput(dt);
}

function draw(pCtx) {
    if (!gameReady) {
        let ratio = imageLoader.getLoadedRatio();
        pCtx.fillStyle = "rgb(255,255, 255)";
        pCtx.fillRect(1, 1, 400, 100);
        pCtx.fillStyle = "rgb(0,255, 0)";
        pCtx.fillRect(1, 1, 400 * ratio, 100);
        return;
    }

    lstSprites.forEach(sprite => {
        sprite.draw(pCtx);
    })

    // img.draw(pCtx);
}