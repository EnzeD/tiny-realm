function drawMap() {
    let imageOverworld = imageLoader.getImage("images/Overworld.png");
    let imageWalls = imageLoader.getImage("images/Walls.png");
    let imageStructures = imageLoader.getImage("images/Structures.png");
    let imageOres = imageLoader.getImage("images/Ores.png");

    return fetch("map/map-test2.json")
        .then(response => response.json())
        .then(mapData => {
            // Get map dimensions from the JSON
            const mapWidth = mapData.width;
            const mapHeight = mapData.height;

            // Create collision map array using map dimensions
            let collisionMap = new Array(mapHeight).fill(0).map(() => new Array(mapWidth).fill(false));
            let collisionNames = {};  // New object to store names

            // Store map dimensions globally
            window.WORLD_WIDTH = mapWidth;
            window.WORLD_HEIGHT = mapHeight;

            // Process collision objects if they exist
            mapData.layers.forEach(layer => {
                if (layer.type === "objectgroup" && layer.name === "Collision") {
                    layer.objects?.forEach(obj => {
                        // Round the coordinates to align with tile grid
                        const roundedX = Math.round(obj.x / tileWidth) * tileWidth;
                        const roundedY = Math.round(obj.y / tileHeight) * tileHeight;

                        const tileX = roundedX / tileWidth;
                        const tileY = roundedY / tileHeight;

                        // Always make small objects at least one tile
                        const tileW = Math.max(1, Math.ceil(obj.width / tileWidth));
                        const tileH = Math.max(1, Math.ceil(obj.height / tileHeight));

                        // Mark tiles as collidable and store object name
                        for (let y = tileY; y < tileY + tileH; y++) {
                            for (let x = tileX; x < tileX + tileW; x++) {
                                if (y >= 0 && y < WORLD_HEIGHT && x >= 0 && x < WORLD_WIDTH) {
                                    collisionMap[y][x] = true;
                                    collisionNames[`${x},${y}`] = obj.name || 'Unknown';
                                }
                            }
                        }
                    });
                }
            });

            // Make collisionNames globally available
            window.collisionNames = collisionNames;

            // Create a lookup for tile animations
            const animationsByTileId = {};
            mapData.tilesets.forEach(tileset => {
                if (tileset.tiles) {
                    tileset.tiles.forEach(tileData => {
                        if (tileData.animation) {
                            const globalTileId = tileset.firstgid + tileData.id;
                            animationsByTileId[globalTileId] = tileData;
                        }
                    });
                }
            });

            // Draw each layer
            mapData.layers.forEach(layer => {
                if (layer.type === "tilelayer") {  // Only process tile layers
                    const tileData = layer.data;

                    tileData.forEach((tileId, index) => {
                        // Skip if tile ID is 0 (empty tile)
                        if (tileId === 0) return;

                        // Determine which tileset to use based on the tile ID
                        let tilesetImage;
                        let adjustedTileId = tileId;

                        // Find the correct tileset for this tile
                        for (let i = mapData.tilesets.length - 1; i >= 0; i--) {
                            const tileset = mapData.tilesets[i];
                            if (tileId >= tileset.firstgid) {
                                tilesetImage = tileset.name === "Overworld" ? imageOverworld :
                                    tileset.name === "Walls" ? imageWalls :
                                        tileset.name === "Structures" ? imageStructures :
                                            tileset.name === "Ores" ? imageOres :
                                                imageStructures;
                                adjustedTileId = tileId - tileset.firstgid;
                                break;
                            }
                        }

                        // Create and setup sprite
                        let sprite = new Sprite(tilesetImage);
                        sprite.setTileSheet(tileWidth, tileHeight);

                        // Calculate position - round to prevent sub-pixel rendering
                        const x = index % window.WORLD_WIDTH;
                        const y = Math.floor(index / window.WORLD_WIDTH);
                        const tileX = Math.floor(x * tileWidth * scale);
                        const tileY = Math.floor(y * tileHeight * scale);

                        sprite.x = tileX;
                        sprite.y = tileY;
                        sprite.currentFrame = adjustedTileId;
                        // Change back to normal scale
                        sprite.setScale(scale, scale);

                        // Check if this tile has an animation
                        if (animationsByTileId[tileId]) {
                            sprite.setTileAnimation(animationsByTileId[tileId]);
                        }

                        lstBackgroundSprites.push(sprite);
                    });
                }
            });

            return collisionMap;  // Return the collision map after everything is processed
        })
        .catch(error => {
            console.error("Error loading map:", error);
            return [];
        });
}