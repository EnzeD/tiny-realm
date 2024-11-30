
let KeyRight = false;
let KeyLeft = false;
let KeyUp = false;
let KeyDown = false;

function keyUp(t) {
    t.preventDefault();
    if (t.code == "ArrowRight") {
        KeyRight = false;
    }
    if (t.code == "ArrowLeft") {
        KeyLeft = false;
    }
    if (t.code == "ArrowUp") {
        KeyUp = false;
    }
    if (t.code == "ArrowDown") {
        KeyDown = false;
    }
}

function keyDown(t) {
    t.preventDefault();
    if (t.code == "ArrowRight") {
        KeyRight = true;
    }
    if (t.code == "ArrowLeft") {
        KeyLeft = true;
    }
    if (t.code == "ArrowUp") {
        KeyUp = true;
    }
    if (t.code == "ArrowDown") {
        KeyDown = true;
    }
}
