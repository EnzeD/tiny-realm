let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let lastUpdate = 0;
let fps = 0;
let frameCount = 0;
let displayedFPS = 0;

let targetRefreshRate = 1 / 250;

function showFPS() {
    ctx.save();
    drawShadowedText(ctx, Math.floor(displayedFPS) + " FPS", canvas.width - 170, 30, {
        font: getFont('FPS'),
        baseline: "middle"
    });
    ctx.restore();
}

function run(time) {
    requestAnimationFrame(run);
    let now = Date.now();
    let dt = (time - lastUpdate) / 1000;

    if (dt < targetRefreshRate - 0.001) {
        return;
    }

    fps = 1 / dt;
    frameCount++;

    if (frameCount >= 4) {
        displayedFPS = fps;
        frameCount = 0;
    }

    lastUpdate = time;
    update(dt);
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    draw(ctx);
    showFPS();
}

function init() {
    console.log("Init");

    ctx.imageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;

    ctx.textBaseline = "middle";
    ctx.textAlign = "left";

    if (typeof load === 'function') {
        load();
    } else {
        console.error('load function not found');
    }

    requestAnimationFrame(run);
}

init();