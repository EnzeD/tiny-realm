class CastleUpgrade {
    constructor() {
        this.upgradeLevel = 0;
        this.baseUpgradeCost = 10;
        // Add animation properties
        this.arrowSprite = new Sprite(window.imageLoader.getImage("images/Interface.png"));
        this.arrowSprite.setTileSheet(8, 8);
        this.arrowSprite.currentFrame = 157;
        this.arrowSprite.setScale(scale, scale);
        this.arrowOffset = 0;
        this.arrowTime = 0;
        this.arrowSpeed = 2; // Speed of the bobbing animation
        this.arrowRange = 4; // Pixels to move up/down
    }

    getNextUpgradeCost() {
        return Math.floor(this.baseUpgradeCost * Math.pow(1.5, this.upgradeLevel));
    }

    isPlayerNearCastle() {
        const playerCenterX = Math.floor((spritePlayer.x + (tileWidth * scale / 2)) / (tileWidth * scale));
        const playerCenterY = Math.floor((spritePlayer.y + (tileHeight * scale / 2)) / (tileHeight * scale));

        const dx = playerCenterX - CASTLE.CENTER.x;
        const dy = playerCenterY - CASTLE.CENTER.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        //console.log('Distance to castle:', distance, 'Is near:', distance <= 7);
        return distance <= 5;
    }

    upgradeArchers() {
        if (!window.waveManager?.archers) {
            console.log('No archers found to upgrade');
            return;
        }

        const cost = this.getNextUpgradeCost();
        if (window.goldSystem.getGoldCount() >= cost) {
            window.goldSystem.removeGold(cost);
            this.upgradeLevel++;
            window.waveManager.archers.forEach(archer => {
                archer.attackDelay = archer.baseAttackDelay * Math.pow(0.75, this.upgradeLevel);
            });
            // Add sound effect for feedback
            window.soundManager.playRandomBowSound();
            console.log('Archers upgraded! New level:', this.upgradeLevel);

            // Increase arrow speed
            this.increaseArrowSpeed();
        } else {
            console.log('Not enough gold for upgrade. Need:', cost, 'Have:', window.goldSystem.getGoldCount());
        }
    }

    increaseArrowSpeed() {
        // Increase the speed of all arrows
        Arrow.prototype.speed += 75; // Increase by 75
    }

    draw(ctx, dt) {
        ctx.save();
        const nextCost = this.getNextUpgradeCost();
        const canAfford = window.goldSystem.getGoldCount() >= nextCost;

        // Draw castle level
        const levelX = CASTLE.CENTER.x * tileWidth * scale;
        const levelY = (CASTLE.CENTER.y - 1) * tileHeight * scale; // 1 tile above center

        drawShadowedText(ctx, `   Lvl. ${this.upgradeLevel + 1}`,
            levelX,
            levelY, {
            font: getFont('CASTLE_HP'),
            align: "center",
            baseline: "middle"
        });

        if (this.isPlayerNearCastle()) {

            // Calculate world position (below the castle)
            const worldX = (CASTLE.CENTER.x) * tileWidth * scale;
            const worldY = (CASTLE.CENTER.y + 7) * tileHeight * scale;

            ctx.globalAlpha = canAfford ? 1 : 0.9;
            drawShadowedText(ctx, `Press F to upgrade archer speed (${nextCost}g)`,
                worldX,
                worldY, {
                font: getFont('COLLECT_PROMPT'),
                align: "center",
                baseline: "top",
                color: canAfford ? TEXT_COLORS.main : TEXT_COLORS.disabled
            });

        }
        // Draw animated arrow if player can afford upgrade
        if (canAfford) {
            console.log('Drawing arrow');
            // Update arrow animation
            this.arrowTime += 4 * dt;
            this.arrowOffset = Math.sin(this.arrowTime * this.arrowSpeed) * this.arrowRange;

            // Position arrow at tile 31,17
            this.arrowSprite.x = 31 * tileWidth * scale;
            this.arrowSprite.y = 17 * tileHeight * scale + this.arrowOffset;
            this.arrowSprite.draw(ctx);
        }
        ctx.restore();
    }
} 