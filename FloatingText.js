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