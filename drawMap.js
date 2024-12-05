function drawMap() {

    let imageMap = imageLoader.getImage("images/Overworld.png");

    fetch("map/map-test.json")
        .then(response => response.json())
        .then(mapData => {
            const tileData = mapData.layers[0].data;
            console.log(tileData);

            tileData.forEach((tileId, index) => {
                sprite = new Sprite(imageMap);
                sprite.setTileSheet(tileWidth, tileHeight);
                const x = index % mapWidth;
                const y = Math.floor(index / mapWidth);
                const tileX = x * tileHeight * scale;
                const tileY = y * tileWidth * scale;
                sprite.x = tileX;
                sprite.y = tileY;
                sprite.currentFrame = tileId - 1
                sprite.setScale(scale, scale);
                lstSprites.push(sprite);
            });
        })
};