class FloatingText {
    constructor(x, y, text) {
        this.x = Math.floor(x);
        this.y = Math.floor(y);
        this.text = text;
        this.life = 1.0;
        this.initialY = this.y;
    }

    update(dt) {
        this.life -= dt;
        this.y = Math.floor(this.initialY - (1 - this.life) * 50);
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        drawShadowedText(ctx, this.text, this.x, this.y, {
            font: getFont('FLOATING_TEXT'),
            baseline: "middle"
        });
        ctx.restore();
    }
}

class WoodSystem {
    constructor() {
        this.woodCount = 0;
        this.floatingTexts = [];
        this.collectPromptAlpha = 0;
    }

    collectWood(x, y) {
        this.woodCount++;
        this.floatingTexts.push(new FloatingText(x, y, "+1"));
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

        // Draw wood count
        drawShadowedText(ctx, `Wood: ${this.woodCount}`, 10, 30, {
            font: getFont('WOOD_COUNT'),
            baseline: "middle"
        });

        // Draw floating texts
        this.floatingTexts.forEach(text => {
            text.draw(ctx);
        });

        // Draw "Press E to collect" prompt
        if (this.collectPromptAlpha > 0) {
            ctx.globalAlpha = this.collectPromptAlpha;
            drawShadowedText(ctx, "Press E to collect", canvas.width / 2, canvas.height - 50, {
                font: getFont('COLLECT_PROMPT'),
                align: "center",
                baseline: "middle"
            });
        }

        ctx.restore();
    }
}

const woodSystem = new WoodSystem(); 