class WoodSystem {
    constructor() {
        this.woodCount = 10;
        this.floatingTexts = [];
        this.collectPromptAlpha = 0;

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

    getWoodCount() {
        return this.woodCount;
    }

    removeWood(amount) {
        this.woodCount = Math.max(0, this.woodCount - amount);
    }

    collectWood(x, y) {
        // Don't collect if game is over or victory achieved
        if (window.gameOver || window.victory) return;

        this.woodCount++;
        this.floatingTexts.push(new FloatingText(x, y, "+1"));
        window.soundManager.playRandomWoodChopSound();
    }

    update(dt) {
        this.floatingTexts = this.floatingTexts.filter(text => {
            text.update(dt);
            return text.life > 0;
        });

        // Smooth fade for collect prompt
        if (canCollectWood) {
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

            // Calculate world position below the wood resource
            if (currentWoodObject) {
                const worldX = currentWoodObject.x;
                const worldY = currentWoodObject.y + (2 * tileHeight * scale);

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
                    Math.floor(currentWoodObject.x / (tileWidth * scale)),
                    Math.floor(currentWoodObject.y / (tileHeight * scale))
                );
                const canAfford = window.goldSystem.getGoldCount() >= nextCost;

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
        if (currentWoodObject) {
            const nextCost = window.minerSystem.getNextCost(
                Math.floor(currentWoodObject.x / (tileWidth * scale)),
                Math.floor(currentWoodObject.y / (tileHeight * scale))
            );
            const canAfford = window.goldSystem.getGoldCount() >= nextCost;

            if (canAfford) {
                // Update arrow animation
                this.arrowTime += 4 * dt;
                this.arrowOffset = Math.sin(this.arrowTime * this.arrowSpeed) * this.arrowRange;

                // Position arrow above the wood resource
                this.arrowSprite.x = currentWoodObject.x;
                this.arrowSprite.y = currentWoodObject.y + this.arrowOffset;
                this.arrowSprite.draw(ctx);
            }
        }
    }

    drawScreenElements(ctx) {
        // Draw wood count (top left)
        drawShadowedText(ctx, `Wood: ${this.woodCount}`,
            UI_CONFIG.positions.WOOD_COUNT.x,
            UI_CONFIG.positions.WOOD_COUNT.y, {
            font: getFont('WOOD_COUNT'),
            baseline: "top",
            align: "left"
        });

        // Draw floating texts
        this.floatingTexts.forEach(text => {
            text.draw(ctx);
        });
    }

    addWood(amount) {
        this.woodCount += amount;
    }
}

// Create and attach to window
window.woodSystem = new WoodSystem();

function collectWood(woodObj) {
    if (!woodObj || window.gameOver || window.victory) return;

    // Convert screen coordinates to world coordinates
    const screenPos = camera.worldToScreen(woodObj.x, woodObj.y);
    window.woodSystem.collectWood(screenPos.x, screenPos.y);

    // Reset collection state
    canCollectWood = false;
    currentWoodObject = null;
}