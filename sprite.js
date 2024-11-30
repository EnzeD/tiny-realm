class Sprite {
    constructor(pSrc, pX = 0, pY = 0) {
        if (pSrc instanceof Image) {
            this.img = pSrc;
        } else {
            this.img = new Image();
            this.img.src = pSrc;
        }
        this.x = pX;
        this.y = pY;
    }

    draw(pCtx) {
        pCtx.drawImage(this.img, this.x, this.y);
    }
}