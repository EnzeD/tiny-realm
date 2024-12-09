class WaveManager {
    constructor(imageUnits) {
        this.imageUnits = imageUnits;
        this.currentWave = 0;
        this.enemies = [];
        this.waveTimer = ENEMY.WAVE_DELAY;
        this.isWaveActive = false;
        this.castle = {
            hp: CASTLE.HP
        };
        this.isEnabled = false;
    }

    spawnEnemy() {
        // Randomly choose enemy type
        const type = Math.random() < 0.5 ? 'FARMER1' : 'FARMER2';

        // Randomly choose spawn position on the edge of the map
        let x, y;
        let validPosition = false;
        let attempts = 0;
        const maxAttempts = 10; // Prevent infinite loops

        while (!validPosition && attempts < maxAttempts) {
            const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left

            switch (side) {
                case 0: // top
                    x = Math.random() * (window.WORLD_WIDTH - 2) * tileWidth * scale + tileWidth * scale;
                    y = tileHeight * scale;
                    break;
                case 1: // right
                    // Avoid spawning in the bottom third when coming from right
                    x = (window.WORLD_WIDTH - 2) * tileWidth * scale;
                    y = Math.random() * (window.WORLD_HEIGHT * 0.67) * tileHeight * scale + tileHeight * scale;
                    break;
                case 2: // bottom
                    // Avoid spawning in the right third of the map when coming from bottom
                    x = Math.random() * (window.WORLD_WIDTH * 0.67) * tileWidth * scale + tileWidth * scale;
                    x = Math.min(x, (window.WORLD_WIDTH - 2) * tileWidth * scale);
                    y = (window.WORLD_HEIGHT - 2) * tileHeight * scale;
                    break;
                case 3: // left
                    x = tileWidth * scale;
                    y = Math.random() * (window.WORLD_HEIGHT - 2) * tileHeight * scale + tileHeight * scale;
                    break;
            }

            // Check if position is valid (not in an obstacle)
            const tileX = Math.floor(x / (tileWidth * scale));
            const tileY = Math.floor(y / (tileHeight * scale));

            // Check the tile and its immediate neighbors for obstacles
            let hasCollision = false;
            for (let dy = 0; dy <= 1; dy++) {
                for (let dx = 0; dx <= 1; dx++) {
                    const checkX = tileX + dx;
                    const checkY = tileY + dy;
                    if (collisionMap[checkY]?.[checkX]) {
                        hasCollision = true;
                        break;
                    }
                }
                if (hasCollision) break;
            }

            validPosition = !hasCollision;
            attempts++;
        }

        if (!validPosition) {
            console.warn('Could not find valid spawn position after', maxAttempts, 'attempts');
            // Use a fallback position if needed
            x = tileWidth * scale;
            y = tileHeight * scale;
        }

        const enemy = new Enemy(this.imageUnits, type, x, y);
        this.enemies.push(enemy);
    }

    update(dt) {
        if (!this.isEnabled || window.gameOver) return;

        if (this.currentWave >= ENEMY.WAVE_COUNTS.length) {
            return; // All waves completed
        }

        if (!this.isWaveActive) {
            this.waveTimer -= dt;
            if (this.waveTimer <= 0) {
                this.startWave();
            }
            return;
        }

        // Update all enemies
        this.enemies = this.enemies.filter(enemy => !enemy.update(dt));

        // Check if wave is complete
        if (this.enemies.length === 0) {
            this.isWaveActive = false;
            this.currentWave++;
            this.waveTimer = ENEMY.WAVE_DELAY;
        }
    }

    startWave() {
        const enemyCount = ENEMY.WAVE_COUNTS[this.currentWave];
        for (let i = 0; i < enemyCount; i++) {
            this.spawnEnemy();
        }
        this.isWaveActive = true;
    }

    checkCollisions(arrows) {
        // Check arrow collisions
        for (const arrow of arrows) {
            for (const enemy of this.enemies) {
                if (!enemy.isDying && this.checkCollision(arrow, enemy)) {
                    enemy.hit();
                    return true; // Arrow hit something
                }
            }
        }
        return false;
    }

    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + tileWidth * scale &&
            obj1.x + tileWidth * scale > obj2.x &&
            obj1.y < obj2.y + tileHeight * scale &&
            obj1.y + tileHeight * scale > obj2.y;
    }
    draw(ctx) {
        for (const enemy of this.enemies) {
            enemy.draw(ctx);
        }

        // Save context state
        ctx.save();
        // Reset transform for UI elements (they should not move with camera)
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Draw wave count and timer
        ctx.font = getFont('WAVE_COUNT');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const waveText = !this.isWaveActive && this.currentWave < ENEMY.WAVE_COUNTS.length
            ? `Wave ${this.currentWave + 1}/8 - Next in ${Math.ceil(this.waveTimer)}s`
            : `Wave ${this.currentWave + 1}/8`;
        const waveX = canvas.width / 2 + UI_CONFIG.positions.WAVE_COUNT.x;
        const waveY = UI_CONFIG.positions.WAVE_COUNT.y;

        drawShadowedText(ctx, waveText, waveX, waveY, {
            font: getFont('WAVE_COUNT'),
            align: 'center',
            baseline: 'top',
            color: TEXT_CONFIG.WAVE_COUNT.color
        });

        // Restore context state
        ctx.restore();
    }

    enable() {
        this.isEnabled = true;
        this.waveTimer = ENEMY.WAVE_DELAY;
    }
} 