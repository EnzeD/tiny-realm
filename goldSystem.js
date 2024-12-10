class GoldSystem {
    constructor() {
        this.goldCount = 0;
        this.floatingTexts = [];
        this.collectPromptAlpha = 0;
        this.hasCollectedGold = false;

        // Initialize animation properties without the sprite
        this.arrowOffset = 0;
        this.arrowTime = 0;
        this.arrowSpeed = 2;
        this.arrowRange = 4;
    }

    initArrowSprite(imageLoader) {
        this.arrowSprite = new Sprite(imageLoader.getImage("images/Interface.png"));
        this.arrowSprite.setTileSheet(8, 8);
        this.arrowSprite.currentFrame = 157;
        this.arrowSprite.setScale(scale, scale);
    }

    getGoldCount() {
        return this.goldCount;
    }

    removeGold(amount) {
        this.goldCount = Math.max(0, this.goldCount - amount);
    }

    collectGold(x, y) {
        // Don't collect if game is over or victory achieved
        if (window.gameOver || window.victory) return;

        this.goldCount++;
        this.hasCollectedGold = true;
        this.floatingTexts.push(new FloatingText(x, y, "+1"));
        window.soundManager.playRandomWoodChopSound();
    }

    update(dt) {
        this.floatingTexts = this.floatingTexts.filter(text => {
            text.update(dt);
            return text.life > 0;
        });

        // Smooth fade for collect prompt
        if (canCollectGold) {
            this.collectPromptAlpha = Math.min(1, this.collectPromptAlpha + dt * 5);
        } else {
            this.collectPromptAlpha = Math.max(0, this.collectPromptAlpha - dt * 5);
        }
    }

    draw(ctx, dt) {
        // Draw world-space elements (before ctx.restore in game.js)
        this.drawWorldElements(ctx, dt);

        // Draw screen-space elements (after ctx.restore in game.js)
        this.drawScreenElements(ctx);
    }

    drawWorldElements(ctx, dt) {
        // Draw collection prompts
        if (this.collectPromptAlpha > 0) {
            ctx.globalAlpha = this.collectPromptAlpha;

            // Calculate world position below the gold resource
            if (currentGoldObject) {
                const worldX = currentGoldObject.x;
                const worldY = currentGoldObject.y + (2 * tileHeight * scale);

                // Draw "Press E to collect" below the resource
                drawShadowedText(ctx, "Press E to collect",
                    worldX,
                    worldY, {
                    font: getFont('COLLECT_PROMPT'),
                    align: "center",
                    baseline: "top"
                });

                // Draw F prompt below the E prompt
                const nextCost = window.minerSystem.getNextCost(
                    Math.floor(currentGoldObject.x / (tileWidth * scale)),
                    Math.floor(currentGoldObject.y / (tileHeight * scale))
                );
                const canAfford = this.goldCount >= nextCost;

                ctx.globalAlpha = this.collectPromptAlpha * (canAfford ? 1 : 0.9);
                drawShadowedText(ctx, `Press F to add a worker (${nextCost}g)`,
                    worldX,
                    worldY + (10 * scale), {
                    font: getFont('COLLECT_PROMPT'),
                    align: "center",
                    baseline: "top",
                    color: canAfford ? TEXT_COLORS.main : TEXT_COLORS.disabled
                });
            }
        }

        // Draw animated arrow
        if (currentGoldObject) {
            const nextCost = window.minerSystem.getNextCost(
                Math.floor(currentGoldObject.x / (tileWidth * scale)),
                Math.floor(currentGoldObject.y / (tileHeight * scale))
            );
            const canAfford = this.goldCount >= nextCost;

            if (canAfford) {
                // Update arrow animation
                this.arrowTime += 4 * dt;
                this.arrowOffset = Math.sin(this.arrowTime * this.arrowSpeed) * this.arrowRange;

                // Position arrow above the gold resource
                this.arrowSprite.x = currentGoldObject.x;
                this.arrowSprite.y = currentGoldObject.y + this.arrowOffset;
                this.arrowSprite.draw(ctx);
            }
        }
    }

    drawScreenElements(ctx) {
        // Only draw gold count if player has collected gold
        if (this.hasCollectedGold) {
            drawShadowedText(ctx, `Gold: ${this.goldCount}`,
                UI_CONFIG.positions.GOLD_COUNT.x,
                UI_CONFIG.positions.GOLD_COUNT.y, {
                font: getFont('WOOD_COUNT'),
                baseline: "top",
                align: "left"
            });
        }

        // Draw floating texts
        this.floatingTexts.forEach(text => {
            text.draw(ctx);
        });
    }

    addGold(amount) {
        this.goldCount += amount;
        this.hasCollectedGold = true;
    }
}

// Create and attach to window
window.goldSystem = new GoldSystem();

function collectGold(goldObj) {
    if (!goldObj || window.gameOver || window.victory) return;

    // Convert screen coordinates to world coordinates
    const screenPos = camera.worldToScreen(goldObj.x, goldObj.y);
    window.goldSystem.collectGold(screenPos.x, screenPos.y);

    // Reset collection state
    canCollectGold = false;
    currentGoldObject = null;
} 