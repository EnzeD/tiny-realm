class SceneMenu {
    constructor(imageLoader) {
        console.log("Menu is active");
        // Define background dimensions
        this.bgWidth = 15;
        this.bgHeight = 3;
        this.tileSize = 24; // Standard tile size

        // Get the interface image that's already loaded
        this.interfaceImage = imageLoader.getImage("images/Interface.png");
        this.inputsImage = imageLoader.getImage("images/Inputs.png");

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

        // Debug: Log button creation
        console.log("Creating menu buttons with inputs image:", {
            imageExists: !!this.inputsImage,
            canvasWidth: canvas.width,
            buttonWidth: 200
        });

        // Add buttons with debug logging
        const buttonWidth = 200;
        const buttonSpacing = 25;
        const startY = 250;

        this.buttons = [
            new MenuButton(
                this.inputsImage,
                "Play",
                (canvas.width - buttonWidth) / 2,
                startY,
                buttonWidth
            ),
            new MenuButton(
                this.inputsImage,
                "Help",
                (canvas.width - buttonWidth) / 2,
                startY + buttonSpacing * 3,
                buttonWidth
            )
        ];

        // Initialize with Play button selected
        this.selectedButtonIndex = 0;
        this.buttons[0].isHovered = true;

        // Add mouse listeners
        canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        canvas.addEventListener('click', this.handleClick.bind(this));
    }

    selectButton(index) {
        // Deselect all buttons
        this.buttons.forEach(button => button.isHovered = false);

        // Select the new button
        this.selectedButtonIndex = index;
        this.buttons[index].isHovered = true;
    }

    selectNextButton() {
        const nextIndex = (this.selectedButtonIndex + 1) % this.buttons.length;
        this.selectButton(nextIndex);
    }

    selectPreviousButton() {
        const prevIndex = (this.selectedButtonIndex - 1 + this.buttons.length) % this.buttons.length;
        this.selectButton(prevIndex);
    }

    activateSelectedButton() {
        if (this.selectedButtonIndex === 0) { // Play button
            window.sceneMenu = null;
            // Enable waves when Play is clicked
            if (window.waveManager) {
                window.waveManager.enable();
            }
        } else if (this.selectedButtonIndex === 1) { // Help button
            console.log("Help clicked");
        }
    }

    handleMouseMove(event) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Check if mouse is over any button
        for (let i = 0; i < this.buttons.length; i++) {
            const button = this.buttons[i];
            if (mouseX >= button.x &&
                mouseX <= button.x + button.width &&
                mouseY >= button.y &&
                mouseY <= button.y + button.height) {
                // If mouse is over a different button than currently selected
                if (this.selectedButtonIndex !== i) {
                    this.selectButton(i);
                }
                return;
            }
        }
    }

    handleClick(event) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Check each button for clicks
        this.buttons.forEach((button, index) => {
            if (button.handleClick(mouseX, mouseY)) {
                this.selectButton(index);
                this.activateSelectedButton();
            }
        });
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

        // Draw buttons
        this.buttons.forEach(button => button.draw(ctx));
    }
}

// Don't create the instance here - it will be created in game.js