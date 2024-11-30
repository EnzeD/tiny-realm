let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let lastUpdate = 0;
let fps = 0;

let targetRefreshRate = 1 / 250;

function showFPS() {
    ctx.fillStyle = "White";
    ctx.font = "normal 16pt Arial";
    ctx.fillText(Math.floor(fps) + " FPS", 15, 30);
}

function run(time) {
    requestAnimationFrame(run);
    let now = Date.now();
    let dt = (time - lastUpdate) / 1000;

    // FrameRate Limiter
    if (dt < targetRefreshRate - 0.001) {
        return;
    }

    fps = 1 / dt;
    lastUpdate = time;
    console.log("Run !");
    update(dt);
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    draw(ctx);
    showFPS();
}

function init() {
    console.log("Init");
    load();
    requestAnimationFrame(run);
}

init();