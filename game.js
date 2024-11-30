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
    let imageEnnemy = imageLoader.getImage("images/enemyred.png");
    lstSprites.push(new Sprite(imageEnnemy));

    gameReady = true;
}

function update(dt) {
    if (!gameReady) {
        return;
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