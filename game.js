let speed = 500;

let imageLoader = new ImageLoader();
let gameReady = false;
let lstSprites = [];

function rnd(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}

function load() {
    document.addEventListener("keydown", keyDown, false);
    document.addEventListener("keyup", keyUp, false);

    imageLoader.add("images/enemyred.png");
    imageLoader.add("images/player.png");

    imageLoader.start(startGame);
}

function startGame() {
    console.log("Game Started");

    lstSprites = [];

    // Joueur
    let imagePlayer = imageLoader.getImage("images/player.png")
    let spritePlayer = new Sprite(imagePlayer);
    spritePlayer.setTileSheet(30, 16);
    spritePlayer.x = 25 * 4;
    spritePlayer.setScale(4, 4);
    spritePlayer.addAnimation("TURNRIGHT", [0, 1, 2, 3, 4, 5, 6, 7, 8], 10, false);
    spritePlayer.addAnimation("TURNUP", [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], 10, false);
    spritePlayer.startAnimation("TURNUP");

    // Ennemi rouge
    let imageEnemy = imageLoader.getImage("images/enemyred.png");
    let spriteEnemy = new Sprite(imageEnemy);
    spriteEnemy.setTileSheet(24, 24);
    spriteEnemy.setScale(4, 4);


    lstSprites.push(spritePlayer);
    lstSprites.push(spriteEnemy);

    gameReady = true;
}

function update(dt) {
    if (!gameReady) {
        return;
    }

    lstSprites.forEach(sprite => {
        sprite.update(dt);
    });

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