let KeyRight = false;
let KeyLeft = false;
let KeyUp = false;
let KeyDown = false;
let KeyE = false;
let DEBUG_MODE = false;
let canCollectWood = false;
let currentWoodObject = null;
let lastWoodCollision = null;
let KeyEPressed = false;
let KeyEReady = true;
let canCollectGold = false;
let currentGoldObject = null;
let lastGoldCollision = null;
let KeyF = false;
const MINER_COST = 10;
let canUpgradeCastle = false;

function checkPlayerInput(dt) {
    // If menu is active or game is over, don't process player movement
    if (window.sceneMenu || window.gameOver) {
        return;
    }

    let isMoving = false;
    let dx = 0;
    let dy = 0;
    let horizontalCollision = false;
    let verticalCollision = false;

    // Calculate movement direction
    if (KeyRight) {
        dx += 1;
        spritePlayer.flipX = false;
    }
    if (KeyLeft) {
        dx -= 1;
        spritePlayer.flipX = true;
    }
    if (KeyUp) {
        dy -= 1;
    }
    if (KeyDown) {
        dy += 1;
    }

    // Get player center position in tile coordinates
    const playerCenterX = Math.floor((spritePlayer.x + (tileWidth * scale / 2)) / (tileWidth * scale));
    const playerCenterY = Math.floor((spritePlayer.y + (tileHeight * scale / 2)) / (tileHeight * scale));

    // Check surrounding tiles for wood and gold
    const radius = 2;
    let foundWoodThisFrame = false;
    let foundGoldThisFrame = false;

    for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
            const tileX = playerCenterX + dx;
            const tileY = playerCenterY + dy;

            if (collisionMap[tileY]?.[tileX]) {
                const objName = window.collisionNames[`${tileX},${tileY}`];
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance <= radius) {
                    if (objName === "Wood") {
                        foundWoodThisFrame = true;
                        lastWoodCollision = { x: tileX * tileWidth * scale, y: tileY * tileHeight * scale };
                    } else if (objName === "Gold") {
                        foundGoldThisFrame = true;
                        lastGoldCollision = { x: tileX * tileWidth * scale, y: tileY * tileHeight * scale };
                    }
                }
            }
        }
    }

    // Update wood collection state
    if (foundWoodThisFrame) {
        canCollectWood = true;
        currentWoodObject = lastWoodCollision;
    } else {
        canCollectWood = false;
        currentWoodObject = null;
        lastWoodCollision = null;
    }

    // Update gold collection state
    if (foundGoldThisFrame) {
        canCollectGold = true;
        currentGoldObject = lastGoldCollision;
    } else {
        canCollectGold = false;
        currentGoldObject = null;
        lastGoldCollision = null;
    }

    // Handle movement
    if (dx !== 0 || dy !== 0) {
        isMoving = true;
        if (dx !== 0 && dy !== 0) {
            const normalizer = 1 / Math.sqrt(2);
            dx *= normalizer;
            dy *= normalizer;
        }

        const playerWidth = tileWidth * scale;
        const playerHeight = tileHeight * scale;

        // Try horizontal movement first
        if (dx !== 0) {
            const newX = spritePlayer.x + dx * speed * dt;
            const leftTile = Math.floor(newX / (tileWidth * scale));
            const rightTile = Math.floor((newX + playerWidth) / (tileWidth * scale));
            const topTile = Math.floor(spritePlayer.y / (tileHeight * scale));
            const bottomTile = Math.floor((spritePlayer.y + playerHeight) / (tileHeight * scale));

            for (let y = topTile; y <= bottomTile; y++) {
                for (let x = leftTile; x <= rightTile; x++) {
                    if (collisionMap[y]?.[x]) {
                        horizontalCollision = true;
                        const objName = window.collisionNames[`${x},${y}`];
                        //console.log(`Collision with ${objName} at x:${x}, y:${y} while moving ${dx > 0 ? 'right' : 'left'}`);
                        break;
                    }
                }
                if (horizontalCollision) break;
            }

            if (!horizontalCollision) {
                spritePlayer.x = newX;
            }
        }

        // Try vertical movement
        if (dy !== 0) {
            const newY = spritePlayer.y + dy * speed * dt;
            const leftTile = Math.floor(spritePlayer.x / (tileWidth * scale));
            const rightTile = Math.floor((spritePlayer.x + playerWidth) / (tileWidth * scale));
            const topTile = Math.floor(newY / (tileHeight * scale));
            const bottomTile = Math.floor((newY + playerHeight) / (tileHeight * scale));

            for (let y = topTile; y <= bottomTile; y++) {
                for (let x = leftTile; x <= rightTile; x++) {
                    if (collisionMap[y]?.[x]) {
                        verticalCollision = true;
                        const objName = window.collisionNames[`${x},${y}`];
                        //console.log(`Collision with ${objName} at x:${x}, y:${y} while moving ${dy > 0 ? 'down' : 'up'}`);
                        break;
                    }
                }
                if (verticalCollision) break;
            }

            if (!verticalCollision) {
                spritePlayer.y = newY;
            }
        }
    }

    // Update animation based on movement
    if (isMoving && spritePlayer.currentAnimation?.name !== "RUN") {
        spritePlayer.startAnimation("RUN");
    } else if (!isMoving && spritePlayer.currentAnimation?.name !== "IDLE") {
        spritePlayer.startAnimation("IDLE");
    }

    // Update castle upgrade state
    canUpgradeCastle = window.castleUpgrade?.isPlayerNearCastle() || false;
}

function keyUp(t) {
    t.preventDefault();

    // If menu is active, don't process regular key up events
    if (window.sceneMenu) {
        return;
    }

    switch (t.code) {
        case "ArrowRight":
        case "KeyD":
            KeyRight = false;
            break;
        case "ArrowLeft":
        case "KeyA":
        case "KeyQ":
            KeyLeft = false;
            break;
        case "ArrowUp":
        case "KeyW":
        case "KeyZ":
            KeyUp = false;
            break;
        case "ArrowDown":
        case "KeyS":
            KeyDown = false;
            break;
        case "KeyE":
            KeyE = false;
            KeyEPressed = false;
            KeyEReady = true;
            break;
        case "KeyF":
            KeyF = false;
            break;
    }
}

function keyDown(t) {
    t.preventDefault();

    // If game is over, only handle retry keys
    if (window.gameOver) {
        switch (t.code) {
            case "Enter":
            case "Space":
                if (window.gameOverScreen) {
                    window.gameOverScreen.restartGame();
                }
                break;
        }
        return;
    }

    // Handle menu controls if menu is active
    if (window.sceneMenu) {
        switch (t.code) {
            case "ArrowUp":
            case "KeyW":
            case "KeyZ":
                window.sceneMenu.selectPreviousButton();
                break;
            case "ArrowDown":
            case "KeyS":
                window.sceneMenu.selectNextButton();
                break;
            case "Enter":
            case "Space":
                window.sceneMenu.activateSelectedButton();
                break;
        }
        return;
    }

    // Existing keyboard controls for gameplay
    switch (t.code) {
        case "ArrowRight":
        case "KeyD":
            KeyRight = true;
            break;
        case "ArrowLeft":
        case "KeyA":
        case "KeyQ":
            KeyLeft = true;
            break;
        case "ArrowUp":
        case "KeyW":
        case "KeyZ":
            KeyUp = true;
            break;
        case "ArrowDown":
        case "KeyS":
            KeyDown = true;
            break;
        case "KeyT":
            DEBUG_MODE = !DEBUG_MODE;
            console.log("Debug mode:", DEBUG_MODE ? "ON" : "OFF");
            break;
        case "KeyE":
            KeyE = true;
            if (!KeyEPressed && KeyEReady) {
                if (canCollectWood && currentWoodObject) {
                    collectWood(currentWoodObject);
                    KeyEPressed = true;
                    KeyEReady = false;
                } else if (canCollectGold && currentGoldObject) {
                    collectGold(currentGoldObject);
                    KeyEPressed = true;
                    KeyEReady = false;
                }
            }
            break;
        case "KeyF":
            KeyF = true;
            if (canUpgradeCastle) {
                console.log('Attempting castle upgrade...');
                window.castleUpgrade.upgradeArchers();
            } else if (canCollectWood && currentWoodObject) {
                const tileX = Math.floor(currentWoodObject.x / (tileWidth * scale));
                const tileY = Math.floor(currentWoodObject.y / (tileHeight * scale));
                const cost = window.minerSystem.getNextCost(tileX, tileY);
                if (window.goldSystem.getGoldCount() >= cost) {
                    window.minerSystem.addMiner(tileX, tileY, "wood");
                    window.goldSystem.removeGold(cost);
                    window.soundManager.playRandomWoodChopSound();
                }
            } else if (canCollectGold && currentGoldObject) {
                const tileX = Math.floor(currentGoldObject.x / (tileWidth * scale));
                const tileY = Math.floor(currentGoldObject.y / (tileHeight * scale));
                const cost = window.minerSystem.getNextCost(tileX, tileY);
                if (window.goldSystem.getGoldCount() >= cost) {
                    window.minerSystem.addMiner(tileX, tileY, "gold");
                    window.goldSystem.removeGold(cost);
                    window.soundManager.playRandomWoodChopSound();
                }
            }
            break;
    }
}


canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
});
