function draw(pCtx) {
    // ... existing draw code ...

    // Debug: Draw collision areas
    if (DEBUG_MODE) {  // Add this variable to game.js
        pCtx.fillStyle = "rgba(255, 0, 0, 0.3)";
        for (let y = 0; y < mapHeight; y++) {
            for (let x = 0; x < mapWidth; x++) {
                if (collisionMap[y]?.[x]) {
                    pCtx.fillRect(
                        x * tileWidth * scale,
                        y * tileHeight * scale,
                        tileWidth * scale,
                        tileHeight * scale
                    );
                }
            }
        }
    }
} 