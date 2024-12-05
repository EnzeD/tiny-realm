class Camera {
    constructor(width, height) {
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
        this.target = null;
    }

    follow(target) {
        this.target = target;
    }

    update() {
        if (!this.target) return;

        // Center camera on target and round to prevent sub-pixel positions
        this.x = Math.round(this.target.x - this.width / 2 + (tileWidth * scale / 2));
        this.y = Math.round(this.target.y - this.height / 2 + (tileHeight * scale / 2));

        // Clamp to map bounds, ensuring whole pixels
        this.x = Math.round(Math.max(0, Math.min(this.x,
            window.WORLD_WIDTH * tileWidth * scale - this.width)));
        this.y = Math.round(Math.max(0, Math.min(this.y,
            window.WORLD_HEIGHT * tileHeight * scale - this.height)));
    }

    // Transform world position to screen position
    worldToScreen(x, y) {
        return {
            x: Math.round(x - this.x),
            y: Math.round(y - this.y)
        };
    }
} 