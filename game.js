let speed = 200;
let imageLoader = new ImageLoader();
let gameReady = false;
let lstSprites = [];

const playerSpawnYOffset = 30;

let spritePlayer;
let spriteEnemy;

let lstBackgroundSprites = [];
let lstGameplaySprites = [];

let collisionMap;
let camera;

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

    // Initialize camera with canvas dimensions
    camera = new Camera(canvas.width, canvas.height);

    lstBackgroundSprites = [];
    lstGameplaySprites = [];

    // Map
    drawMap().then(map => {
        collisionMap = map;

        // Player
        let imagePlayer = imageLoader.getImage("images/Units.png");
        spritePlayer = new Sprite(imagePlayer);
        spritePlayer.setTileSheet(tileWidth, tileHeight);

        // Position player in the middle of the map using dynamic world size
        spritePlayer.x = (window.WORLD_WIDTH * tileWidth * scale / 2) - (tileWidth * scale / 2);
        spritePlayer.y = (window.WORLD_HEIGHT * tileHeight * scale / 2) - (tileHeight * scale / 2) + playerSpawnYOffset;
        spritePlayer.setScale(scale, scale);

        // Set up animations
        const rowOffset = 6 * 111;
        spritePlayer.addAnimation("IDLE", [rowOffset + 6, rowOffset + 7, rowOffset + 8], 0.2);
        spritePlayer.addAnimation("RUN", [rowOffset + 14, rowOffset + 15, rowOffset + 16, rowOffset + 17], 0.1);
        spritePlayer.startAnimation("IDLE");

        lstGameplaySprites.push(spritePlayer);

        // Make camera follow player
        camera.follow(spritePlayer);

        gameReady = true;
    });
}

function update(dt) {
    if (!gameReady) return;

    checkPlayerInput(dt);

    // Update camera position
    camera.update();

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

    // Save the context state
    pCtx.save();

    // Translate everything by camera position, ensuring whole pixels
    pCtx.translate(-Math.round(camera.x), -Math.round(camera.y));

    // Draw background first
    lstBackgroundSprites.forEach(sprite => {
        // Only draw sprites that are visible in the camera view
        if (isVisible(sprite)) {
            sprite.draw(pCtx);
        }
    });

    // Then draw gameplay sprites
    lstGameplaySprites.forEach(sprite => {
        if (isVisible(sprite)) {
            sprite.draw(pCtx);
        }
    });

    if (DEBUG_MODE) {
        // Draw collision map (adjusted for camera)
        pCtx.fillStyle = "rgba(255, 0, 0, 0.3)";
        for (let y = 0; y < window.WORLD_HEIGHT; y++) {
            for (let x = 0; x < window.WORLD_WIDTH; x++) {
                if (collisionMap[y]?.[x]) {
                    const screenX = x * tileWidth * scale;
                    const screenY = y * tileHeight * scale;
                    if (isPositionVisible(screenX, screenY)) {
                        pCtx.fillRect(
                            screenX,
                            screenY,
                            tileWidth * scale,
                            tileHeight * scale
                        );
                    }
                }
            }
        }
    }

    // Restore the context state
    pCtx.restore();
}

// Helper function to check if a sprite is visible in the camera view
function isVisible(sprite) {
    return sprite.x + (tileWidth * scale) >= camera.x &&
        sprite.x <= camera.x + camera.width &&
        sprite.y + (tileHeight * scale) >= camera.y &&
        sprite.y <= camera.y + camera.height;
}

// Helper function to check if a position is visible in the camera view
function isPositionVisible(x, y) {
    return x + (tileWidth * scale) >= camera.x &&
        x <= camera.x + camera.width &&
        y + (tileHeight * scale) >= camera.y &&
        y <= camera.y + camera.height;
}