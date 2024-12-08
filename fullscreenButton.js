class FullscreenButton {
    constructor(image) {
        this.sprite = new Sprite(image);
        this.sprite.setTileSheet(8, 8);
        this.sprite.currentFrame = 10; // Default frame (non-hover)
        this.sprite.setScale(scale, scale);
        this.isHovered = false;
        this.frameInterpolation = 0;

        // Position in bottom left with some padding
        this.updatePosition();

        // Add mouse listeners
        canvas.addEventListener('click', this.handleClick.bind(this));
        canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        canvas.addEventListener('mouseout', () => this.isHovered = false);
    }

    updatePosition() {
        const padding = scale * 8;
        this.sprite.x = canvas.width - (4 * scale) - padding;
        this.sprite.y = canvas.height - (4 * scale) - padding;
    }

    handleMouseMove(event) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        this.isHovered = (
            mouseX >= this.sprite.x &&
            mouseX <= this.sprite.x + (8 * scale) &&
            mouseY >= this.sprite.y &&
            mouseY <= this.sprite.y + (8 * scale)
        );
    }

    handleClick(event) {
        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        if (clickX >= this.sprite.x &&
            clickX <= this.sprite.x + (8 * scale) &&
            clickY >= this.sprite.y &&
            clickY <= this.sprite.y + (8 * scale)) {
            this.toggleFullscreen();
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            canvas.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    update(dt) {
        // Smooth transition between frames
        const transitionSpeed = 10; // Adjust this value to change animation speed
        if (this.isHovered) {
            this.frameInterpolation = Math.min(1, this.frameInterpolation + dt * transitionSpeed);
        } else {
            this.frameInterpolation = Math.max(0, this.frameInterpolation - dt * transitionSpeed);
        }

        // Interpolate between frames 10 and 13 (the 2 images of the button)
        this.sprite.currentFrame = 10 + Math.round(this.frameInterpolation * 3);
    }

    draw(ctx) {
        // Only draw if not in fullscreen
        if (!document.fullscreenElement) {
            this.sprite.draw(ctx);
        }
    }
} 