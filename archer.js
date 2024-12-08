class Archer extends Sprite {
    constructor(image, position) {
        super(image);
        this.setTileSheet(tileWidth, tileHeight);

        // Position archer on tower
        this.x = position.x * tileWidth * scale;
        this.y = position.y * tileHeight * scale;
        this.setScale(scale, scale);

        // Add animations
        this.addAnimation("IDLE", ARCHER.IDLE_FRAMES, ARCHER.IDLE_SPEED);
        this.addAnimation("ATTACK", ARCHER.ATTACK_FRAMES, ARCHER.ATTACK_SPEED, false);
        this.startAnimation("IDLE");

        this.target = null;
        this.attackRange = 15 * tileWidth * scale; // 15 tiles range

        this.arrows = [];
        this.attackCooldown = 0;
        this.attackDelay = 1; // 1 second between attacks
    }

    setTarget(target) {
        this.target = target;
    }

    update(dt) {
        super.update(dt);

        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= dt;
        }

        // Update existing arrows
        this.arrows = this.arrows.filter(arrow => !arrow.update(dt));

        if (this.target) {
            // Get center positions
            const archerCenterX = this.x + (tileWidth * scale / 2);
            const archerCenterY = this.y + (tileHeight * scale / 2);
            const targetCenterX = this.target.x + (tileWidth * scale / 2);
            const targetCenterY = this.target.y + (tileHeight * scale / 2);

            // Flip sprite based on target position
            this.flipX = targetCenterX < archerCenterX;

            // Calculate distance to target
            const dx = targetCenterX - archerCenterX;
            const dy = targetCenterY - archerCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // If target is in range and cooldown is ready
            if (distance <= this.attackRange && this.attackCooldown <= 0) {
                this.startAnimation("ATTACK");
                this.attackCooldown = this.attackDelay;

                // Calculate arrow start position (from the side of the archer)
                const arrowStartX = archerCenterX + (this.flipX ? -tileWidth : tileWidth) * scale;
                const arrowStartY = archerCenterY;

                // Create new arrow
                this.arrows.push(new Arrow(
                    arrowStartX,
                    arrowStartY,
                    targetCenterX,
                    targetCenterY
                ));
            }
        }
    }

    draw(ctx) {
        super.draw(ctx);
        // Draw all active arrows
        this.arrows.forEach(arrow => arrow.draw(ctx));
    }
} 