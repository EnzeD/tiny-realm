class MenuButton {
    constructor(image, text, x, y, width) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.width = width;

        // Calculate height to be a multiple of tile size (8 * scale)
        const tileSize = 8 * scale;
        // Use 4 tiles height (top border + middle + bottom border)
        this.height = tileSize * 3;  // This will be 24 * scale

        // Create sprites for each piece of the 9-slice
        this.pieces = [];
        for (let i = 0; i < 9; i++) {
            const sprite = new Sprite(image);
            sprite.setTileSheet(8, 8);
            sprite.setScale(scale, scale);
            this.pieces.push(sprite);
        }

        // Create shadow pieces
        this.shadowPieces = [];
        for (let i = 0; i < 9; i++) {
            const sprite = new Sprite(image);
            sprite.setTileSheet(8, 8);
            sprite.setScale(scale, scale);
            this.shadowPieces.push(sprite);
        }

        this.isHovered = false;
        this.updateFrames();
    }

    updateFrames() {
        const offset = this.isHovered ? 5 : 0;
        // Main button frames
        this.pieces[0].currentFrame = 600 + offset; // Top left
        this.pieces[1].currentFrame = 601 + offset; // Top middle
        this.pieces[2].currentFrame = 604 + offset; // Top right
        this.pieces[3].currentFrame = 630 + offset; // Middle left
        this.pieces[4].currentFrame = 631 + offset; // Center
        this.pieces[5].currentFrame = 634 + offset; // Middle right
        this.pieces[6].currentFrame = 660 + offset; // Bottom left
        this.pieces[7].currentFrame = 661 + offset; // Bottom middle
        this.pieces[8].currentFrame = 664 + offset; // Bottom right

        // Shadow frames (offset by 20)
        for (let i = 0; i < 9; i++) {
            this.shadowPieces[i].currentFrame = this.pieces[i].currentFrame + 20;
        }
    }

    set isHovered(value) {
        if (this._isHovered !== value) {
            this._isHovered = value;
            this.updateFrames();
        }
    }

    get isHovered() {
        return this._isHovered;
    }

    handleMouseMove(mouseX, mouseY) {
        const wasHovered = this.isHovered;
        this.isHovered = (
            mouseX >= this.x &&
            mouseX <= this.x + this.width &&
            mouseY >= this.y &&
            mouseY <= this.y + this.height
        );

        if (wasHovered !== this.isHovered) {
            this.updateFrames();
        }
    }

    handleClick(mouseX, mouseY) {
        return (
            mouseX >= this.x &&
            mouseX <= this.x + this.width &&
            mouseY >= this.y &&
            mouseY <= this.y + this.height
        );
    }

    draw(ctx) {
        const tileSize = 8 * scale;

        // Draw shadows first (move them down and right a bit more)
        this.drawNineSlice(ctx, this.shadowPieces, 0, 0);
        // Draw main button
        this.drawNineSlice(ctx, this.pieces, 0, 0);

        // Draw text with adjusted vertical position
        // Move text up slightly by subtracting a few pixels from the vertical center
        drawShadowedText(ctx, this.text, this.x + this.width / 2, this.y + (this.height / 2) + (2 * scale), {
            font: getFont('MENU_BUTTON'),
            align: 'center',
            baseline: 'middle'
        });
    }

    drawNineSlice(ctx, pieces, offsetX, offsetY) {
        const tileSize = 8 * scale;

        // Draw corners
        pieces[0].x = this.x + offsetX;
        pieces[0].y = this.y + offsetY;
        pieces[2].x = this.x + this.width - tileSize + offsetX;
        pieces[2].y = this.y + offsetY;
        pieces[6].x = this.x + offsetX;
        pieces[6].y = this.y + this.height - tileSize + offsetY;
        pieces[8].x = this.x + this.width - tileSize + offsetX;
        pieces[8].y = this.y + this.height - tileSize + offsetY;

        // Draw all pieces in order
        // First row
        pieces[0].draw(ctx);
        for (let x = tileSize; x < this.width - tileSize; x += tileSize) {
            pieces[1].x = this.x + x + offsetX;
            pieces[1].y = this.y + offsetY;
            pieces[1].draw(ctx);
        }
        pieces[2].draw(ctx);

        // Middle rows
        for (let y = tileSize; y < this.height - tileSize; y += tileSize) {
            // Left edge
            pieces[3].x = this.x + offsetX;
            pieces[3].y = this.y + y + offsetY;
            pieces[3].draw(ctx);

            // Center pieces
            for (let x = tileSize; x < this.width - tileSize; x += tileSize) {
                pieces[4].x = this.x + x + offsetX;
                pieces[4].y = this.y + y + offsetY;
                pieces[4].draw(ctx);
            }

            // Right edge
            pieces[5].x = this.x + this.width - tileSize + offsetX;
            pieces[5].y = this.y + y + offsetY;
            pieces[5].draw(ctx);
        }

        // Bottom row
        pieces[6].draw(ctx);
        for (let x = tileSize; x < this.width - tileSize; x += tileSize) {
            pieces[7].x = this.x + x + offsetX;
            pieces[7].y = this.y + this.height - tileSize + offsetY;
            pieces[7].draw(ctx);
        }
        pieces[8].draw(ctx);
    }
}