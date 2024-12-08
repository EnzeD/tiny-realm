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
        this.speed = BASE_SPEED * 5; // Half of base speed

        // Calculate direction to castle
        this.calculateDirectionToCastle();

        this.attackCooldown = 0;  // Track time since last attack
        this.attackRate = 1;   // Attack every 1 second
    }

    calculateDirectionToCastle() {
        const targetX = CASTLE.CENTER.x * tileWidth * scale;
        const targetY = CASTLE.CENTER.y * tileHeight * scale;

        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        this.directionX = dx / distance;
        this.directionY = dy / distance;
    }

    update(dt) {
        super.update(dt);

        if (this.isDying) {
            if (this.currentAnimation.end) {
                return true; // Signal to remove this enemy
            }
            return false;
        }

        // Handle attack cooldown and damage if attacking
        if (this.isAttacking) {
            this.attackCooldown += dt;
            if (this.attackCooldown >= this.attackRate) {
                this.attackCooldown = 0;
                if (typeof window.castleHP === 'undefined') {
                    window.castleHP = 100;
                }
                if (window.castleHP > 0) {
                    window.castleHP -= 1;
                    if (window.castleHP <= 0) {
                        window.castleHP = 0;
                        window.gameOver = true;
                    }
                }
            }
            return false;
        }

        if (!this.isAttacking) {
            // Check collisions before moving
            const enemyWidth = tileWidth * scale;
            const enemyHeight = tileHeight * scale;
            let canMove = true;

            // Calculate new position
            const newX = this.x + this.directionX * this.speed * dt;
            const newY = this.y + this.directionY * this.speed * dt;

            // Flip sprite based on movement direction
            this.flipX = this.directionX < 0;

            // Check collision at new position
            const leftTile = Math.floor(newX / (tileWidth * scale));
            const rightTile = Math.floor((newX + enemyWidth) / (tileWidth * scale));
            const topTile = Math.floor(newY / (tileHeight * scale));
            const bottomTile = Math.floor((newY + enemyHeight) / (tileHeight * scale));

            // Check all tiles the enemy would occupy
            for (let y = topTile; y <= bottomTile; y++) {
                for (let x = leftTile; x <= rightTile; x++) {
                    if (collisionMap[y]?.[x]) {
                        // Check if collision is with castle
                        const objName = window.collisionNames[`${x},${y}`];
                        if (objName === "Castle") {
                            this.startAttack();
                            return false;
                        }
                        canMove = false;
                        break;
                    }
                }
                if (!canMove) break;
            }

            // Only move if no collision detected
            if (canMove) {
                this.x = newX;
                this.y = newY;
            } else {
                // Recalculate direction when hitting an obstacle
                this.calculateDirectionToCastle();
            }
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
        this.isDying = true;
        this.startAnimation("HIT");
    }
}

// Initialize castle HP if it doesn't exist
if (typeof window.castleHP === 'undefined') {
    window.castleHP = 100;
} 