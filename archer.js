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
        this.attackDelay = 2;

        // Add reference to wood system
        this.woodSystem = window.woodSystem;
        if (!this.woodSystem) {
            console.error('WoodSystem not initialized!');
        }
    }

    setTarget(target) {
        this.target = target;
    }

    update(dt) {
        super.update(dt);

        // Don't process attacks if menu exists
        if (window.sceneMenu) {
            return;
        }

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

            // If target is in range, cooldown is ready, and we have enough wood
            if (distance <= this.attackRange && this.attackCooldown <= 0) {
                if (this.woodSystem.getWoodCount() >= ARROW_COST) {
                    this.startAnimation("ATTACK");
                    this.attackCooldown = this.attackDelay;
                    this.woodSystem.removeWood(ARROW_COST);

                    // Calculate arrow start position (from the side of the archer)
                    const arrowStartX = archerCenterX + (this.flipX ? -tileWidth : tileWidth) * scale;
                    const arrowStartY = archerCenterY;

                    // Create new arrow
                    this.arrows.push(new Arrow(
                        arrowStartX,
                        arrowStartY,
                        targetCenterX,
                        targetCenterY,
                        this.target
                    ));
                }
            }
        }
    }

    draw(ctx) {
        super.draw(ctx);

        // Don't draw warnings if menu exists
        if (window.sceneMenu) {
            return;
        }

        // Draw all active arrows
        this.arrows.forEach(arrow => arrow.draw(ctx));

        // Draw warning if no wood
        if (this.woodSystem.getWoodCount() < ARROW_COST && this.target) {
            ctx.save();
            const text = TEXT_CONFIG.NO_WOOD_WARNING.text;
            ctx.font = getFont('NO_WOOD_WARNING');
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';

            // Position text under player
            const targetCenterX = this.target.x + (tileWidth * scale / 2);
            const targetBottomY = this.target.y + (tileHeight * scale) + (10 * scale);

            // Draw the text with shadow
            drawShadowedText(ctx, text, targetCenterX, targetBottomY, {
                font: ctx.font,
                align: 'center',
                baseline: 'bottom'
            });

            ctx.restore();
        }
    }
} 