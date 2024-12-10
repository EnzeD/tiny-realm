class GoldSystem {
    constructor() {
        this.goldCount = 0;
        this.floatingTexts = [];
        this.collectPromptAlpha = 0;
        this.hasCollectedGold = false;
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

    draw(ctx) {
        ctx.save();

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

        // Draw collection prompts
        if (this.collectPromptAlpha > 0) {
            ctx.globalAlpha = this.collectPromptAlpha;

            // Draw "Press E to collect"
            drawShadowedText(ctx, "Press E to collect",
                canvas.width / 2,
                canvas.height + UI_CONFIG.positions.COLLECT_PROMPT.y, {
                font: getFont('COLLECT_PROMPT'),
                align: "center",
                baseline: "bottom"
            });

            // Always show F prompt with current cost, but only if we have a valid object
            if (currentGoldObject) {
                const nextCost = window.minerSystem.getNextCost(
                    Math.floor(currentGoldObject.x / (tileWidth * scale)),
                    Math.floor(currentGoldObject.y / (tileHeight * scale))
                );
                const canAfford = this.goldCount >= nextCost;

                ctx.globalAlpha = this.collectPromptAlpha * (canAfford ? 1 : 0.9);
                drawShadowedText(ctx, `Press F to add a worker (${nextCost}g)`,
                    canvas.width / 2,
                    canvas.height + UI_CONFIG.positions.COLLECT_PROMPT.y - (10 * scale), {
                    font: getFont('COLLECT_PROMPT'),
                    align: "center",
                    baseline: "bottom",
                    color: canAfford ? TEXT_COLORS.main : TEXT_COLORS.disabled
                });
            }
        }

        ctx.restore();
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