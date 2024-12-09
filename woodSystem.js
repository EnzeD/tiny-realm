class WoodSystem {
    constructor() {
        this.woodCount = 10;
        this.floatingTexts = [];
        this.collectPromptAlpha = 0;
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

    draw(ctx) {
        ctx.save();

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
            if (currentWoodObject) {
                const nextCost = window.minerSystem.getNextCost(
                    Math.floor(currentWoodObject.x / (tileWidth * scale)),
                    Math.floor(currentWoodObject.y / (tileHeight * scale))
                );
                const canAfford = window.goldSystem.getGoldCount() >= nextCost;

                ctx.globalAlpha = this.collectPromptAlpha * (canAfford ? 1 : 0.5);
                drawShadowedText(ctx, `Press F to add a worker (${nextCost}g)`,
                    canvas.width / 2,
                    canvas.height + UI_CONFIG.positions.COLLECT_PROMPT.y - (10 * scale), {
                    font: getFont('COLLECT_PROMPT'),
                    align: "center",
                    baseline: "bottom",
                    color: canAfford ? TEXT_COLORS.main : "#FF6B6B"
                });
            }
        }

        ctx.restore();
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