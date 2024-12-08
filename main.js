let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let lastUpdate = 0;
let fps = 0;
let frameCount = 0;
let displayedFPS = 0;

let targetRefreshRate = 1 / 250;

function showFPS() {
    ctx.save();
    drawShadowedText(ctx, Math.floor(displayedFPS) + " FPS", canvas.width + UI_CONFIG.positions.FPS.x, UI_CONFIG.positions.FPS.y, {
        font: getFont('FPS'),
        align: "right",
        baseline: "top"
    });
    ctx.restore();
}

function run() {
    const now = Date.now();
    const dt = (now - lastUpdate) / 1000;
    lastUpdate = now;

    // Calculate FPS
    frameCount++;
    fps += (1 / dt - fps) / 10;
    if (frameCount % 10 === 0) {
        displayedFPS = fps;
    }

    update(dt);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw(ctx, dt);
    showFPS();

    requestAnimationFrame(run);
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