let speed = BASE_SPEED * scale;
let imageLoader = new ImageLoader();
let gameReady = false;
let lstSprites = [];
let lstArchers = [];

const playerSpawnYOffset = 30;
const playerSpawnXOffset = -12;

let spritePlayer;
let spriteEnemy;

let lstBackgroundSprites = [];
let lstGameplaySprites = [];

let collisionMap;
let camera;

let fullscreenButton;

let cursorSprite;
let mouseX = 0;
let mouseY = 0;

let waveManager;

let castleUpgrade;

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
    imageLoader.add("images/Interface.png");
    imageLoader.add("images/Inputs.png");
    imageLoader.add("images/Ores.png");

    imageLoader.start(startGame);
}

function startGame() {
    console.log("Game Started");

    // Start background music
    window.soundManager.playMusic('sounds/music1.mp3');

    // Set imageLoader globally first
    window.imageLoader = imageLoader;

    // Initialize camera with canvas dimensions
    camera = new Camera(canvas.width, canvas.height);

    lstBackgroundSprites = [];
    lstGameplaySprites = [];

    // Initialize menu scene with imageLoader
    window.sceneMenu = new SceneMenu(imageLoader);

    // Map
    drawMap().then(map => {
        collisionMap = map;

        // Player
        let imagePlayer = imageLoader.getImage("images/Units.png");
        spritePlayer = new Sprite(imagePlayer);
        spritePlayer.setTileSheet(tileWidth, tileHeight);

        // Position player in the middle of the map using dynamic world size
        spritePlayer.x = (window.WORLD_WIDTH * tileWidth * scale / 2) - (tileWidth * scale / 2) + playerSpawnXOffset;
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

        // Initialize cursor
        const interfaceImage = imageLoader.getImage("images/Interface.png");
        cursorSprite = new Sprite(interfaceImage);
        cursorSprite.setTileSheet(8, 8);
        cursorSprite.currentFrame = 81;
        cursorSprite.setScale(scale, scale); // TO DO: add shadows

        // Initialize fullscreen button
        fullscreenButton = new FullscreenButton(interfaceImage);

        // Add mouse move listener for cursor
        canvas.addEventListener('mousemove', (event) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = event.clientX - rect.left;
            mouseY = event.clientY - rect.top;
        });

        // Initialize archers
        const imageUnits = imageLoader.getImage("images/Units.png");
        ARCHER.POSITIONS.forEach(pos => {
            const archer = new Archer(imageUnits, pos);
            lstGameplaySprites.push(archer);
            lstArchers.push(archer);
        });

        // Create WaveManager after imageLoader is globally available
        waveManager = new WaveManager(imageLoader.getImage("images/Units.png"));
        window.waveManager = waveManager;
        window.waveManager.archers = lstArchers;

        // Initialize castle upgrade system
        castleUpgrade = new CastleUpgrade();
        window.castleUpgrade = castleUpgrade;

        gameReady = true;
    });
}

function update(dt) {
    if (!gameReady) return;

    // Don't process resource updates if game is over
    if (!window.gameOver && !window.victory) {
        checkPlayerInput(dt);
        woodSystem.update(dt);
        goldSystem.update(dt);
        minerSystem.update();
    }

    // Update fullscreen button
    if (fullscreenButton) {
        fullscreenButton.update(dt);
    }

    // Update camera position
    camera.update();

    lstBackgroundSprites.forEach(sprite => {
        sprite.update(dt);
    });

    lstGameplaySprites.forEach(sprite => {
        sprite.update(dt);
    });

    waveManager.update(dt);
}

function draw(pCtx, dt) {
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

    waveManager.draw(pCtx);

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

        // Draw debug info for surrounding tiles
        const playerCenterX = Math.floor((spritePlayer.x + (tileWidth * scale / 2)) / (tileWidth * scale));
        const playerCenterY = Math.floor((spritePlayer.y + (tileHeight * scale / 2)) / (tileHeight * scale));

        // Check a 2-tile radius (5x5 grid centered on player)
        const radius = 2;
        pCtx.font = getFont('DEBUG');
        pCtx.textAlign = "center";
        pCtx.textBaseline = "middle";

        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const tileX = playerCenterX + dx;
                const tileY = playerCenterY + dy;
                const screenX = tileX * tileWidth * scale;
                const screenY = tileY * tileHeight * scale;

                // Draw tile border
                pCtx.strokeStyle = "yellow";
                pCtx.strokeRect(
                    screenX,
                    screenY,
                    tileWidth * scale,
                    tileHeight * scale
                );

                // Draw coordinates and object name if exists
                const objName = collisionMap[tileY]?.[tileX] ?
                    window.collisionNames[`${tileX},${tileY}`] || "?" :
                    "";

                // Calculate distance from player center
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Draw tile info
                pCtx.fillStyle = "white";
                pCtx.fillText(
                    `${dx},${dy}${objName ? `\n${objName}` : ""}\n${distance.toFixed(1)}`,
                    screenX + (tileWidth * scale / 2),
                    screenY + (tileHeight * scale / 2)
                );
            }
        }
    }

    // Update castle blink timer
    if (window.castleBlinkTime > 0) {
        window.castleBlinkTime -= dt;
    }

    // Draw castle HP with blink effect
    if (typeof window.castleHP !== 'undefined') {
        const castleX = 31 * tileWidth * scale;
        const castleY = 13 * tileHeight * scale;

        // Draw white overlay when blinking
        if (window.castleBlinkTime > 0) {
            pCtx.fillStyle = "rgba(255, 255, 255, 0.5)";
            // Use the main castle area from the map
            pCtx.fillRect(
                208 * scale,  // x position
                72.75 * scale,  // y position
                87.5 * scale,  // width
                71.25 * scale  // height
            );

            // Also cover the upper castle section
            pCtx.fillRect(
                240.775 * scale,  // x position
                64.529 * scale,  // y position
                22.5101 * scale,  // width
                13.5061 * scale  // height
            );
        }

        drawShadowedText(pCtx, `${window.castleHP}/100`,
            castleX + (tileWidth * scale / 2),
            castleY + (tileHeight * scale / 2), {
            font: getFont('CASTLE_HP'),
            align: 'center',
            baseline: 'middle'
        });
    }

    // Restore the context state
    pCtx.restore();

    // Draw resources BEFORE game over screen
    woodSystem.draw(pCtx);
    goldSystem.draw(pCtx);
    minerSystem.draw(pCtx);

    // Draw game over or victory screen
    if (window.gameOver) {
        if (!window.gameOverScreen) {
            window.gameOverScreen = new GameOverScreen(imageLoader);
        }
        if (dt) {
            window.gameOverScreen.update(dt);
        }
        window.gameOverScreen.draw(pCtx);
    } else if (window.victory) {
        if (!window.victoryScreen) {
            window.victoryScreen = new GameOverScreen(imageLoader, true);
        }
        if (dt) {
            window.victoryScreen.update(dt);
        }
        window.victoryScreen.draw(pCtx);
    }

    // Draw the fullscreen button (after restore so it's in screen space)
    if (fullscreenButton) {
        fullscreenButton.draw(pCtx);
    }

    // Draw menu only if it exists
    if (window.sceneMenu) {
        window.sceneMenu.draw(pCtx);
    }

    // Draw cursor last (on top of everything)
    if (cursorSprite) {
        cursorSprite.x = mouseX - (4 * scale);
        cursorSprite.y = mouseY - (4 * scale);
        cursorSprite.draw(pCtx);
    }
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

// Add a resize handler to update button position
window.addEventListener('resize', () => {
    if (fullscreenButton) {
        fullscreenButton.updatePosition();
    }
});