let KeyRight = false;
let KeyLeft = false;
let KeyUp = false;
let KeyDown = false;
let DEBUG_MODE = false;

function checkPlayerInput(dt) {
    let isMoving = false;
    let dx = 0;
    let dy = 0;

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

    // Normalize diagonal movement
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

            let horizontalCollision = false;
            for (let y = topTile; y <= bottomTile; y++) {
                for (let x = leftTile; x <= rightTile; x++) {
                    if (collisionMap[y]?.[x]) {
                        horizontalCollision = true;
                        const objName = window.collisionNames[`${x},${y}`];
                        console.log(`Collision with ${objName} at x:${x}, y:${y} while moving ${dx > 0 ? 'right' : 'left'}`);
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

            let verticalCollision = false;
            for (let y = topTile; y <= bottomTile; y++) {
                for (let x = leftTile; x <= rightTile; x++) {
                    if (collisionMap[y]?.[x]) {
                        verticalCollision = true;
                        const objName = window.collisionNames[`${x},${y}`];
                        console.log(`Collision with ${objName} at x:${x}, y:${y} while moving ${dy > 0 ? 'down' : 'up'}`);
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
}

function keyUp(t) {
    t.preventDefault();
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
    }
}

function keyDown(t) {
    t.preventDefault();
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
    }
}
