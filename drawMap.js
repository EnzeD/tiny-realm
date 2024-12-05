function drawMap() {
    let imageOverworld = imageLoader.getImage("images/Overworld.png");
    let imageWalls = imageLoader.getImage("images/Walls.png");
    let imageStructures = imageLoader.getImage("images/Structures.png");

    // Create a collision map array
    let collisionMap = new Array(mapHeight).fill(0).map(() => new Array(mapWidth).fill(false));

    return fetch("map/map-test2.json")
        .then(response => response.json())
        .then(mapData => {
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

                        console.log(`Collision area ${obj.name}:`, {
                            original: { x: obj.x, y: obj.y },
                            rounded: { x: roundedX, y: roundedY },
                            tile: { x: tileX, y: tileY, w: tileW, h: tileH }
                        });

                        // Mark tiles as collidable
                        for (let y = tileY; y < tileY + tileH; y++) {
                            for (let x = tileX; x < tileX + tileW; x++) {
                                if (y >= 0 && y < mapHeight && x >= 0 && x < mapWidth) {
                                    collisionMap[y][x] = true;
                                }
                            }
                        }
                    });
                }
            });

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
                                        imageStructures;
                                adjustedTileId = tileId - tileset.firstgid;
                                break;
                            }
                        }

                        // Create and setup sprite
                        let sprite = new Sprite(tilesetImage);
                        sprite.setTileSheet(tileWidth, tileHeight);

                        // Calculate position
                        const x = index % mapWidth;
                        const y = Math.floor(index / mapWidth);
                        const tileX = x * tileHeight * scale;
                        const tileY = y * tileWidth * scale;

                        sprite.x = tileX;
                        sprite.y = tileY;
                        sprite.currentFrame = adjustedTileId;
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
            return collisionMap;  // Return empty collision map in case of error
        });
}