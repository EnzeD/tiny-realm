let speed = 200;

let imageLoader = new ImageLoader();
let gameReady = false;
let lstSprites = [];

let spritePlayer;
let spriteEnemy;

const scale = 5;
const tileWidth = 8;
const tileHeight = 8;
const mapWidth = 32;
const mapHeight = 18;

let lstBackgroundSprites = [];
let lstGameplaySprites = [];

let collisionMap;

function rnd(min, max) {
    return _.random(min, max);
}

function load() {
    document.addEventListener("keydown", keyDown, false);
    document.addEventListener("keyup", keyUp, false);

    imageLoader.add("images/Units.png");
    imageLoader.add("images/Animals.png");
    imageLoader.add("images/Overworld.png");
    imageLoader.add("images/Walls.png");
    imageLoader.add("images/Structures.png");

    imageLoader.start(startGame);
}

function startGame() {
    console.log("Game Started");

    lstBackgroundSprites = [];
    lstGameplaySprites = [];

    // Map
    drawMap().then(map => {
        collisionMap = map;

        // Player
        let imagePlayer = imageLoader.getImage("images/Units.png");
        spritePlayer = new Sprite(imagePlayer);
        spritePlayer.setTileSheet(tileWidth, tileHeight);

        // Position player in the middle of the screen
        spritePlayer.x = (canvas.width / 2) - (tileWidth * scale / 2);
        spritePlayer.y = (canvas.height / 2) - (tileHeight * scale / 2) + 30;
        spritePlayer.setScale(scale, scale);

        // Set up animations
        const rowOffset = 6 * 111;
        spritePlayer.addAnimation("IDLE", [rowOffset + 6, rowOffset + 7, rowOffset + 8], 0.2);
        spritePlayer.addAnimation("RUN", [rowOffset + 14, rowOffset + 15, rowOffset + 16, rowOffset + 17], 0.1);
        spritePlayer.startAnimation("IDLE");

        lstGameplaySprites.push(spritePlayer);

        gameReady = true;
    });
}

function update(dt) {
    if (!gameReady) {
        return;
    }

    checkPlayerInput(dt);

    lstBackgroundSprites.forEach(sprite => {
        sprite.update(dt);
    });

    lstGameplaySprites.forEach(sprite => {
        sprite.update(dt);
    });
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

    // Draw background first
    lstBackgroundSprites.forEach(sprite => {
        sprite.draw(pCtx);
    });

    // Then draw gameplay sprites
    lstGameplaySprites.forEach(sprite => {
        sprite.draw(pCtx);
    });

    if (DEBUG_MODE) {
        // Draw collision map
        pCtx.fillStyle = "rgba(255, 0, 0, 0.3)";
        for (let y = 0; y < mapHeight; y++) {
            for (let x = 0; x < mapWidth; x++) {
                if (collisionMap[y]?.[x]) {
                    pCtx.fillRect(
                        x * tileWidth * scale,
                        y * tileHeight * scale,
                        tileWidth * scale,
                        tileHeight * scale
                    );
                }
            }
        }
    }
}