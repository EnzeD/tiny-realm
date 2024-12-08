class GameOverScreen {
    constructor(imageLoader) {
        this.inputsImage = imageLoader.getImage("images/Inputs.png");

        // Create retry button - store canvas dimensions for proper centering
        this.buttonWidth = 200;
        this.updateButtonPosition();

        // Add event listeners
        this.boundHandleClick = this.handleClick.bind(this);
        this.boundHandleMouseMove = this.handleMouseMove.bind(this);
        this.boundHandleKeyDown = this.handleKeyDown.bind(this);
        canvas.addEventListener('click', this.boundHandleClick);
        canvas.addEventListener('mousemove', this.boundHandleMouseMove);
        document.addEventListener('keydown', this.boundHandleKeyDown);

        this.fadeAlpha = 0;
        this.fadeSpeed = 0.5;
    }

    updateButtonPosition() {
        // Recreate button with current canvas dimensions
        this.retryButton = new MenuButton(
            this.inputsImage,
            "Retry",
            (canvas.width - this.buttonWidth) / 2,
            canvas.height / 2 + 50,
            this.buttonWidth
        );
    }

    handleKeyDown(event) {
        if (event.code === 'Enter' || event.code === 'Space') {
            this.restartGame();
        }
    }

    restartGame() {
        // Reset game state
        window.castleHP = 100;
        window.gameOver = false;
        window.gameOverScreen = null;
        startGame();

        // Remove all event listeners
        canvas.removeEventListener('click', this.boundHandleClick);
        canvas.removeEventListener('mousemove', this.boundHandleMouseMove);
        document.removeEventListener('keydown', this.boundHandleKeyDown);
    }

    update(dt) {
        if (this.fadeAlpha < 0.7) {
            this.fadeAlpha += this.fadeSpeed * dt;
            if (this.fadeAlpha > 0.7) this.fadeAlpha = 0.7;
        }
    }

    handleMouseMove(event) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        this.retryButton.handleMouseMove(mouseX, mouseY);
    }

    handleClick(event) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        if (this.retryButton.handleClick(mouseX, mouseY)) {
            this.restartGame();
        }
    }

    draw(ctx) {
        // Save the current context state
        ctx.save();

        // Reset any transformations
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Draw black overlay
        ctx.fillStyle = `rgba(0, 0, 0, ${this.fadeAlpha})`;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw "Game Over" text
        drawShadowedText(ctx, "Game Over", ctx.canvas.width / 2, ctx.canvas.height / 2 - 50, {
            font: getFont('GAME_TITLE'),
            align: 'center',
            baseline: 'middle'
        });

        // Draw retry button
        this.retryButton.draw(ctx);

        // Restore the context state
        ctx.restore();
    }
} 