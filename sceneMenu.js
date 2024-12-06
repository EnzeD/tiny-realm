class SceneMenu {
    constructor(imageLoader) {
        console.log("Menu is active");
        // Define background dimensions
        this.bgWidth = 15;
        this.bgHeight = 3;
        this.tileSize = 24; // Standard tile size

        // Get the interface image that's already loaded
        this.interfaceImage = imageLoader.getImage("images/Interface.png");
        // Create sprites for all three layers
        this.innerTileSprite = new Sprite(this.interfaceImage);
        this.middleBorderSprite = new Sprite(this.interfaceImage);
        this.outerBorderSprite = new Sprite(this.interfaceImage);

        // Set up all sprites
        this.innerTileSprite.setTileSheet(8, 8);
        this.middleBorderSprite.setTileSheet(8, 8);
        this.outerBorderSprite.setTileSheet(8, 8);

        this.innerTileSprite.currentFrame = 171;
        this.middleBorderSprite.currentFrame = 175;
        this.outerBorderSprite.currentFrame = 176;

        this.innerTileSprite.setScale(scale, scale);
        this.middleBorderSprite.setScale(scale, scale);
        this.outerBorderSprite.setScale(scale, scale);
    }

    draw(ctx) {
        // Calculate position to center the background (now including both borders)
        const startX = (ctx.canvas.width - ((this.bgWidth + 4) * this.tileSize)) / 2;
        const startY = -50; // Position from top of screen

        // Draw all layers of tiles
        for (let y = -2; y <= this.bgHeight + 1; y++) {
            for (let x = -2; x <= this.bgWidth + 1; x++) {
                const currentX = startX + ((x + 2) * this.tileSize);
                const currentY = startY + ((y + 2) * this.tileSize);

                // Choose which sprite to draw based on position
                let sprite;
                if (x === -2 || x === this.bgWidth + 1 || y === -2 || y === this.bgHeight + 1) {
                    sprite = this.outerBorderSprite;  // Outer border (176)
                } else if (x === -1 || x === this.bgWidth || y === -1 || y === this.bgHeight) {
                    sprite = this.middleBorderSprite; // Middle border (175)
                } else {
                    sprite = this.innerTileSprite;    // Inner tiles (171)
                }

                sprite.x = currentX;
                sprite.y = currentY;
                sprite.draw(ctx);
            }
        }

        // Draw the title text
        const textX = ctx.canvas.width / 2;
        const textY = startY + ((this.bgHeight + 4) * this.tileSize) / 2;

        // Draw shadowed text using the helper function
        drawShadowedText(ctx, TEXT_CONFIG.GAME_TITLE.text, textX, textY, {
            font: getFont('GAME_TITLE'),
            align: 'center',
            baseline: 'middle'
        });
    }
}

// Don't create the instance here - it will be created in game.js