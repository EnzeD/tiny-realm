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
        this.speed = BASE_SPEED * 5;

        // Direction to castle
        this.directionX = 0;
        this.directionY = 0;
        this.calculateDirectionToCastle();

        // Attack timing
        this.attackCooldown = 0;
        this.attackRate = 1;

        // Redirect behavior
        this.isRedirecting = false;
        this.redirectTimer = 0;
        this.redirectDuration = 0.2;
        this.currentRedirectAttempt = 0;  // 0: right, 1: up, 2: left, 3: down
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

    tryAlternateDirection() {
        // Choose a random direction
        const randomDirection = Math.floor(Math.random() * 4);

        switch (randomDirection) {
            case 0: // Right
                this.directionX = 1;
                this.directionY = 0;
                break;
            case 1: // Up
                this.directionX = 0;
                this.directionY = -1;
                break;
            case 2: // Left
                this.directionX = -1;
                this.directionY = 0;
                break;
            case 3: // Down
                this.directionX = 0;
                this.directionY = 1;
                break;
        }
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
                    if (window.castleHP <= 0) {
                        window.castleHP = 0;
                        window.gameOver = true;
                    }
                }
            }
            return false;
        }

        // Update redirect timer if active
        if (this.isRedirecting) {
            this.redirectTimer += dt;
            if (this.redirectTimer >= this.redirectDuration) {
                this.isRedirecting = false;
                this.redirectTimer = 0;
                this.calculateDirectionToCastle();
            }
        }

        // Check collisions before moving
        const enemyWidth = tileWidth * scale;
        const enemyHeight = tileHeight * scale;
        const newX = this.x + this.directionX * this.speed * dt;
        const newY = this.y + this.directionY * this.speed * dt;

        this.flipX = this.directionX < 0;

        // Check collision at new position
        const leftTile = Math.floor(newX / (tileWidth * scale));
        const rightTile = Math.floor((newX + enemyWidth) / (tileWidth * scale));
        const topTile = Math.floor(newY / (tileHeight * scale));
        const bottomTile = Math.floor((newY + enemyHeight) / (tileHeight * scale));

        let canMove = true;
        let hitCastle = false;

        for (let y = topTile; y <= bottomTile; y++) {
            for (let x = leftTile; x <= rightTile; x++) {
                if (collisionMap[y]?.[x]) {
                    const objName = window.collisionNames[`${x},${y}`];
                    if (objName === "Castle") {
                        hitCastle = true;
                        break;
                    }
                    canMove = false;
                }
            }
            if (hitCastle) break;
        }

        if (hitCastle) {
            this.startAttack();
            return false;
        }

        if (canMove) {
            this.x = newX;
            this.y = newY;
        } else if (!this.isRedirecting) {
            // Start redirect behavior with a new direction
            this.isRedirecting = true;
            this.redirectTimer = 0;
            this.tryAlternateDirection();
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