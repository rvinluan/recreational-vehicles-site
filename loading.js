var c = document.getElementById("canvas");

/** @type {CanvasRenderingContext2D} */
var ctx = c.getContext("2d");

// Set display size (css pixels).
const w = window.innerWidth;
const h = window.innerHeight;
canvas.style.width = `${w}px`;
canvas.style.height = `${h}px`;

// Set actual size in memory (scaled to account for extra pixel density).
const scale = window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.
canvas.width = Math.floor(w * scale);
canvas.height = Math.floor(h * scale);

// Normalize coordinate system to use CSS pixels.
ctx.scale(scale, scale);

const iw = 350;
const ih = iw / 3.29;
const logoImage = new Image(iw,ih);

logoImage.onload = start;
logoImage.src = "rv-white.png";
var lx = w/2 - iw/2,
    ly = h/2 - ih/2,
    xvelocity = (Math.random()*2) - 1,
    yvelocity = (Math.random()*2) - 1,
    speed = 6;

function start() {
    console.log("loaded");
    console.log(this);
    requestAnimationFrame(draw);
}

function draw() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    lx += xvelocity * speed;
    ly += yvelocity * speed;
    if(ly+ih > h && yvelocity > 0) {
        yvelocity *= -1;
    }
    if(ly < 0 && yvelocity < 0) {
        yvelocity *= -1;
    }
    if(lx+iw > w && xvelocity > 0) {
        xvelocity *= -1;
    }
    if(lx < 0 && xvelocity < 0) {
        xvelocity *= -1;
    }
    ctx.drawImage(logoImage, lx, ly, iw, ih);
    requestAnimationFrame(draw);
}