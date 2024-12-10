class CastleUpgrade {
    constructor() {
        this.upgradeLevel = 0;
        this.baseUpgradeCost = 10;
    }

    getNextUpgradeCost() {
        return this.baseUpgradeCost * Math.pow(2, this.upgradeLevel);
    }

    isPlayerNearCastle() {
        const playerCenterX = Math.floor((spritePlayer.x + (tileWidth * scale / 2)) / (tileWidth * scale));
        const playerCenterY = Math.floor((spritePlayer.y + (tileHeight * scale / 2)) / (tileHeight * scale));

        const dx = playerCenterX - CASTLE.CENTER.x;
        const dy = playerCenterY - CASTLE.CENTER.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        console.log('Distance to castle:', distance, 'Is near:', distance <= 7);
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
                archer.attackDelay = archer.baseAttackDelay * Math.pow(0.8, this.upgradeLevel);
            });
            // Add sound effect for feedback
            window.soundManager.playRandomBowSound();
            console.log('Archers upgraded! New level:', this.upgradeLevel);
        } else {
            console.log('Not enough gold for upgrade. Need:', cost, 'Have:', window.goldSystem.getGoldCount());
        }
    }

    draw(ctx) {
        if (this.isPlayerNearCastle()) {
            ctx.save();
            const nextCost = this.getNextUpgradeCost();
            const canAfford = window.goldSystem.getGoldCount() >= nextCost;

            // Calculate world position (below the castle)
            const worldX = (CASTLE.CENTER.x - 10.5) * tileWidth * scale;
            const worldY = (CASTLE.CENTER.y) * tileHeight * scale;

            ctx.globalAlpha = canAfford ? 1 : 0.9;
            drawShadowedText(ctx, `Press F to upgrade archer speed (${nextCost}g)`,
                worldX,
                worldY, {
                font: getFont('COLLECT_PROMPT'),
                align: "center",
                baseline: "top",
                color: canAfford ? TEXT_COLORS.main : TEXT_COLORS.disabled
            });
            ctx.restore();
        }
    }
} 