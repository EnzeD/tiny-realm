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
        this.scaleX = 1;
        this.scaleY = 1;

        this.currentFrame = 0;
        this.currentFrameInAnimation = 0;
        this.currentAnimation = null;
        this.frameTimer = 0;

        this.tileSize = {
            x: 0,
            y: 0
        }
        this.tileSheet = false;

        this.animations = [];
        this.flipX = false;

        this.tileAnimations = null;
        this.animationTimer = 0;
    }

    addAnimation(pName, pFrames, pSpeed, pLoop = true) {
        let animation = {
            name: pName,
            frames: pFrames,
            speed: pSpeed,
            loop: pLoop,
            end: false
        }
        this.animations.push(animation);
    }

    startAnimation(pName) {
        if (this.currentAnimation != null) {
            if (pName == this.currentAnimation.name) {
                return;
            }
        }

        this.animations.forEach(animation => {
            if (animation.name == pName) {
                this.currentAnimation = animation;
                this.currentFrameInAnimation = 0;
                this.currentFrame = this.currentAnimation.frames[this.currentFrameInAnimation];
                this.currentAnimation.end = false;
            }
        });
    }

    setTileSheet(pSizeX, pSizeY) {
        this.tileSheet = true;
        this.tileSize.x = pSizeX;
        this.tileSize.y = pSizeY;
    }

    setScale(pX, pY) {
        this.scaleX = pX;
        this.scaleY = pY;
    }

    setTileAnimation(pAnimationData) {
        if (pAnimationData) {
            this.tileAnimations = {
                frames: pAnimationData.animation.map(frame => frame.tileid),
                durations: pAnimationData.animation.map(frame => frame.duration / 1000),
                currentFrame: 0,
                currentDuration: 0
            };
        }
    }

    update(dt) {
        if (this.currentAnimation != null) {
            this.frameTimer += dt;
            if (this.frameTimer >= this.currentAnimation.speed) {
                this.frameTimer = 0;
                this.currentFrameInAnimation++;
                if (this.currentFrameInAnimation > this.currentAnimation.frames.length - 1) {
                    if (this.currentAnimation.loop) {
                        this.currentFrameInAnimation = 0;
                    } else {
                        this.currentFrameInAnimation = this.currentAnimation.frames.length - 1;
                        this.currentAnimation.end = true;
                    }
                }
                this.currentFrame = this.currentAnimation.frames[this.currentFrameInAnimation];
            }
        }

        if (this.tileAnimations) {
            this.animationTimer += dt;
            if (this.animationTimer >= this.tileAnimations.durations[this.tileAnimations.currentFrame]) {
                this.animationTimer = 0;
                this.tileAnimations.currentFrame = (this.tileAnimations.currentFrame + 1) % this.tileAnimations.frames.length;
                this.currentFrame = this.tileAnimations.frames[this.tileAnimations.currentFrame];
            }
        }
    }

    draw(pCtx) {
        if (!this.tileSheet) {
            pCtx.drawImage(this.img, Math.round(this.x), Math.round(this.y));
        }
        else {
            let nbCol = this.img.width / this.tileSize.x;
            let c = 0;
            let l = 0;

            l = Math.floor(this.currentFrame / nbCol);
            c = this.currentFrame - (l * nbCol);

            let x = Math.floor(c * this.tileSize.x);
            let y = Math.floor(l * this.tileSize.y);

            const destX = Math.round(this.x);
            const destY = Math.round(this.y);
            const destWidth = Math.round(this.tileSize.x * this.scaleX);
            const destHeight = Math.round(this.tileSize.y * this.scaleY);

            pCtx.save();

            if (this.flipX) {
                pCtx.translate(Math.round(this.x + destWidth), destY);
                pCtx.scale(-1, 1);
                pCtx.drawImage(this.img,
                    x, y, this.tileSize.x, this.tileSize.y,
                    0, 0, destWidth, destHeight
                );
            } else {
                pCtx.drawImage(this.img,
                    x, y, this.tileSize.x, this.tileSize.y,
                    destX, destY, destWidth, destHeight
                );
            }

            pCtx.restore();
        }
    }
}