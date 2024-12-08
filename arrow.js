class Arrow {
    constructor(startX, startY, targetX, targetY) {
        this.x = startX;
        this.y = startY;
        this.speed = 200; // pixels per second

        // Calculate direction
        const dx = targetX - startX;
        const dy = targetY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Normalize direction
        this.dirX = dx / distance;
        this.dirY = dy / distance;

        // Track lifetime
        this.distance = 0;
        this.maxDistance = distance;

        // Arrow trail positions (head + 3 trail pixels)
        this.trail = Array(4).fill().map(() => ({ x: startX, y: startY }));
    }

    update(dt) {
        // Move arrow
        const moveDistance = this.speed * dt;
        this.distance += moveDistance;

        // Update position
        this.x += this.dirX * moveDistance;
        this.y += this.dirY * moveDistance;

        // Update trail positions
        this.trail.unshift({ x: this.x, y: this.y });
        this.trail.pop();

        // Return true if arrow reached its target
        return this.distance >= this.maxDistance;
    }

    draw(ctx) {
        // Draw arrow trail (brown pixels)
        ctx.fillStyle = '#8B4513';
        for (let i = 1; i < this.trail.length; i++) {
            ctx.fillRect(
                Math.round(this.trail[i].x),
                Math.round(this.trail[i].y),
                scale,
                scale
            );
        }

        // Draw arrow head (yellow pixel)
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(
            Math.round(this.x),
            Math.round(this.y),
            scale,
            scale
        );
    }
} 