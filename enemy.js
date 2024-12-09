class Enemy extends Sprite {
    constructor(image, type, x, y) {
        super(image);
        this.type = type;
        this.x = x;
        this.y = y;
        this.setTileSheet(tileWidth, tileHeight);
        this.setScale(scale, scale);

        // Set up animations based on type
        const frames = ENEMY[type];
        this.addAnimation("IDLE", frames.IDLE_FRAMES, frames.IDLE_SPEED);
        this.addAnimation("ATTACK", frames.ATTACK_FRAMES, frames.ATTACK_SPEED);
        this.addAnimation("HIT", frames.HIT_FRAMES, frames.HIT_SPEED, false);
        this.startAnimation("IDLE");

        this.hp = 1;
        this.isAttacking = false;
        this.isDying = false;
        this.speed = BASE_SPEED * 1;

        // Pathfinding properties
        this.path = [];
        this.currentPathIndex = 0;
        this.directionX = 0;
        this.directionY = 0;

        // Attack timing
        this.attackCooldown = 0;
        this.attackRate = 1;

        // Calculate initial path
        this.calculatePath();

        // Add debug path storage
        this.debugPath = [];
        if (this.path) {
            this.debugPath = this.path.map(point => ({
                x: point[0] * tileWidth * scale,
                y: point[1] * tileHeight * scale
            }));
        }

        // Add castle blink properties
        if (typeof window.castleBlinkTime === 'undefined') {
            window.castleBlinkTime = 0;
        }
        if (typeof window.castleBlinkDuration === 'undefined') {
            window.castleBlinkDuration = 0.1; // Duration of blink in seconds
        }
    }

    calculatePath() {
        // Convert current position to grid coordinates
        const startX = Math.floor(this.x / (tileWidth * scale));
        const startY = Math.floor(this.y / (tileHeight * scale));
        const targetX = CASTLE.CENTER.x;
        const targetY = CASTLE.CENTER.y;

        // Perform BFS
        const path = this.bfs(startX, startY, targetX, targetY);
        if (path) {
            this.path = path;
            this.currentPathIndex = 0;
            // Update debug path when new path is calculated
            this.debugPath = path.map(point => ({
                x: point[0] * tileWidth * scale,
                y: point[1] * tileHeight * scale
            }));
        }
    }

    bfs(startX, startY, targetX, targetY) {
        const queue = [[startX, startY]];
        const visited = new Set();
        const parent = new Map();

        visited.add(`${startX},${startY}`);

        while (queue.length > 0) {
            const [currentX, currentY] = queue.shift();

            // Check if we reached the target
            if (currentX === targetX && currentY === targetY) {
                return this.reconstructPath(parent, startX, startY, targetX, targetY);
            }

            // First try moving in the dominant direction
            const dx = targetX - currentX;
            const dy = targetY - currentY;
            const preferHorizontal = Math.abs(dx) > Math.abs(dy);

            // Reorder directions based on which axis has more distance to cover
            let directions;
            if (preferHorizontal) {
                directions = [
                    [Math.sign(dx), 0],  // Horizontal towards target
                    [0, Math.sign(dy)],  // Vertical towards target
                    [0, -Math.sign(dy)], // Opposite vertical
                    [-Math.sign(dx), 0]  // Opposite horizontal
                ];
            } else {
                directions = [
                    [0, Math.sign(dy)],  // Vertical towards target
                    [Math.sign(dx), 0],  // Horizontal towards target
                    [-Math.sign(dx), 0], // Opposite horizontal
                    [0, -Math.sign(dy)]  // Opposite vertical
                ];
            }

            for (const [dx, dy] of directions) {
                const newX = currentX + dx;
                const newY = currentY + dy;
                const key = `${newX},${newY}`;

                // Skip if out of bounds
                if (newX < 0 || newY < 0 ||
                    newX >= window.WORLD_WIDTH ||
                    newY >= window.WORLD_HEIGHT) {
                    continue;
                }

                // Skip if wall or already visited
                if (collisionMap[newY]?.[newX] &&
                    window.collisionNames[key] !== "Castle" ||
                    visited.has(key)) {
                    continue;
                }

                queue.push([newX, newY]);
                visited.add(key);
                parent.set(key, [currentX, currentY]);
            }
        }

        return null; // No path found
    }

    reconstructPath(parent, startX, startY, targetX, targetY) {
        const path = [];
        let current = [targetX, targetY];
        const startKey = `${startX},${startY}`;

        while (`${current[0]},${current[1]}` !== startKey) {
            path.unshift(current);
            current = parent.get(`${current[0]},${current[1]}`);
            if (!current) break;
        }

        // Add random perpendicular steps with influence
        if (path.length > 3) {
            const enhancedPath = [];
            let activeDetour = null; // Track current detour direction
            let detourStepsLeft = 0; // Track how many steps to continue the detour

            for (let i = 0; i < path.length - 1; i++) {
                enhancedPath.push(path[i]);

                if (detourStepsLeft > 0) {
                    // Continue the active detour
                    const detourStep = [...enhancedPath[enhancedPath.length - 1]];
                    if (activeDetour === 'vertical') {
                        detourStep[1] += Math.sign(path[i + 1][1] - path[i][1]);
                    } else {
                        detourStep[0] += Math.sign(path[i + 1][0] - path[i][0]);
                    }

                    // Check if the detour step is valid
                    if (!collisionMap[detourStep[1]]?.[detourStep[0]]) {
                        enhancedPath.push(detourStep);
                        detourStepsLeft--;
                    } else {
                        // If blocked, cancel the detour
                        detourStepsLeft = 0;
                        activeDetour = null;
                    }
                } else if (i > 0 && i < path.length - 2 && i % 2 === 0 && Math.random() < 0.5) {
                    // Start a new detour
                    const current = path[i];
                    const next = path[i + 1];

                    // Determine if we're moving horizontally or vertically
                    const movingHorizontally = current[0] !== next[0];

                    // Add a perpendicular step
                    const perpendicularStep = [...current];
                    if (movingHorizontally) {
                        perpendicularStep[1] += Math.random() < 0.5 ? 1 : -1;
                        activeDetour = 'vertical';
                    } else {
                        perpendicularStep[0] += Math.random() < 0.5 ? 1 : -1;
                        activeDetour = 'horizontal';
                    }

                    // Check if the new position is valid
                    if (!collisionMap[perpendicularStep[1]]?.[perpendicularStep[0]]) {
                        enhancedPath.push(perpendicularStep);
                        detourStepsLeft = Math.floor(Math.random() * 2) + 1; // Continue for 1-2 more steps
                    }
                }
            }
            enhancedPath.push(path[path.length - 1]);
            return enhancedPath;
        }

        return path;
    }

    update(dt) {
        super.update(dt);

        if (this.isDying) {
            if (this.currentAnimation.end) {
                return true;
            }
            return false;
        }

        if (this.isAttacking) {
            this.attackCooldown += dt;
            if (this.attackCooldown >= this.attackRate) {
                this.attackCooldown = 0;
                if (typeof window.castleHP === 'undefined') {
                    window.castleHP = 100;
                }
                if (window.castleHP > 0) {
                    window.castleHP -= 1;
                    // Trigger castle blink when damage is dealt
                    window.castleBlinkTime = window.castleBlinkDuration;
                    if (window.castleHP <= 0) {
                        window.castleHP = 0;
                        window.gameOver = true;
                    }
                }
            }
            return false;
        }

        // Move along path
        if (this.path.length > 0 && this.currentPathIndex < this.path.length) {
            const targetTile = this.path[this.currentPathIndex];
            const targetX = targetTile[0] * tileWidth * scale;
            const targetY = targetTile[1] * tileHeight * scale;

            // Calculate direction to next tile
            const dx = targetX - this.x;
            const dy = targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 1) {
                // Reached current target tile, move to next
                this.currentPathIndex++;
                if (this.currentPathIndex >= this.path.length) {
                    // Recalculate path when reached end
                    this.calculatePath();
                }
            } else {
                // Move towards target tile
                this.directionX = dx / distance;
                this.directionY = dy / distance;

                const newX = this.x + this.directionX * this.speed * dt;
                const newY = this.y + this.directionY * this.speed * dt;

                // Check all corners of the enemy sprite for castle collision
                const corners = [
                    [newX, newY], // Top-left
                    [newX + tileWidth * scale, newY], // Top-right
                    [newX, newY + tileHeight * scale], // Bottom-left
                    [newX + tileWidth * scale, newY + tileHeight * scale] // Bottom-right
                ];

                let hitsCastle = false;
                for (const [cornerX, cornerY] of corners) {
                    const tileX = Math.floor(cornerX / (tileWidth * scale));
                    const tileY = Math.floor(cornerY / (tileHeight * scale));
                    if (window.collisionNames[`${tileX},${tileY}`] === "Castle") {
                        hitsCastle = true;
                        break;
                    }
                }

                if (hitsCastle) {
                    this.startAttack();
                    return false;
                }

                this.x = newX;
                this.y = newY;
                this.flipX = this.directionX < 0;
            }
        } else {
            // No path or reached end, recalculate
            this.calculatePath();
        }

        return false;
    }

    startAttack() {
        if (!this.isAttacking) {
            this.isAttacking = true;
            this.startAnimation("ATTACK");
        }
    }

    hit() {
        this.hp -= 1;
        if (this.hp <= 0) {
            this.isDying = true;
            this.startAnimation("HIT");
        }
    }

    draw(ctx) {
        super.draw(ctx);

        // Draw path in debug mode
        if (DEBUG_MODE && this.debugPath.length > 0) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.lineWidth = 2;

            // Start from current position
            ctx.moveTo(this.x + (tileWidth * scale / 2), this.y + (tileHeight * scale / 2));

            // Draw line to each point in the path
            this.debugPath.forEach(point => {
                ctx.lineTo(point.x + (tileWidth * scale / 2), point.y + (tileHeight * scale / 2));
            });

            ctx.stroke();

            // Draw points at each path node
            ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
            this.debugPath.forEach(point => {
                ctx.beginPath();
                ctx.arc(
                    point.x + (tileWidth * scale / 2),
                    point.y + (tileHeight * scale / 2),
                    3,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            });
        }
    }
}

// Initialize castle HP if it doesn't exist
if (typeof window.castleHP === 'undefined') {
    window.castleHP = 100;
} 