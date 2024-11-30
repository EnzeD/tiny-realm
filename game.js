let img;

let speed;

function load() {
    document.addEventListener("keydown", keyDown, false);
    document.addEventListener("keyup", keyUp, false);

    img = new Sprite("images/ship.png", 100, 100);

    speed = 500;
}

function update(dt) {

    if (KeyRight) {
        img.x += speed * dt;
    }
    if (KeyLeft) {
        img.x -= speed * dt;
    }
    if (KeyUp) {
        img.y -= speed * dt;
    }
    if (KeyDown) {
        img.y += speed * dt;
    }
}

function draw(pCtx) {
    img.draw(pCtx);
}