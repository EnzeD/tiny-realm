class Arrow {
    // Add static array to track stuck arrows
    static stuckArrows = [];
    static MAX_STUCK_ARROWS = 20;

    constructor(startX, startY, targetX, targetY, target) {
        this.x = startX;
        this.y = startY;
        this.speed = 400;
        this.target = target; // Store reference to target

        // Calculate direction
        const dx = targetX - startX;
        const dy = targetY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        this.dirX = dx / distance;
        this.dirY = dy / distance;

        this.distance = 0;
        this.maxDistance = distance;
        this.trail = Array(4).fill().map(() => ({ x: startX, y: startY }));

        // Add stuck arrow tracking
        this.isStuck = false;
        this.stuckPosition = null;
    }

    checkTargetCollision() {
        // Simple box collision check with target
        return this.x >= this.target.x &&
            this.x <= this.target.x + (tileWidth * scale) &&
            this.y >= this.target.y &&
            this.y <= this.target.y + (tileHeight * scale);
    }

    update(dt) {
        // If stuck, keep the arrow in the array
        if (this.isStuck) return false;

        const moveDistance = this.speed * dt;
        this.distance += moveDistance;

        // Update position
        this.x += this.dirX * moveDistance;
        this.y += this.dirY * moveDistance;

        // Update trail positions
        this.trail.unshift({ x: this.x, y: this.y });
        this.trail.pop();

        // Check if arrow hit target or reached max distance
        if (this.checkTargetCollision()) {
            return true; // Arrow hit target, remove it
        } else if (this.distance >= this.maxDistance) {
            // Arrow missed, mark it as stuck
            this.isStuck = true;
            this.stuckPosition = {
                x: Math.round(this.x),
                y: Math.round(this.y)
            };

            // Add to static stuck arrows array
            Arrow.stuckArrows.push(this.stuckPosition);
            // Keep only last MAX_STUCK_ARROWS
            if (Arrow.stuckArrows.length > Arrow.MAX_STUCK_ARROWS) {
                Arrow.stuckArrows.shift(); // Remove oldest arrow
            }

            return false; // Keep arrow to show stuck position
        }

        return false;
    }

    draw(ctx) {
        if (this.isStuck) {
            // Only draw if this arrow is in the stuckArrows array
            const isInLastN = Arrow.stuckArrows.some(pos =>
                pos.x === this.stuckPosition.x && pos.y === this.stuckPosition.y
            );

            if (isInLastN) {
                // Draw stuck arrow as black pixel
                ctx.fillStyle = '#000000';
                ctx.fillRect(
                    this.stuckPosition.x,
                    this.stuckPosition.y,
                    scale,
                    scale
                );
            }
            return;
        }

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