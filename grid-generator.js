var c = document.getElementById("canvas");

/** @type {CanvasRenderingContext2D} */
var ctx = c.getContext("2d");

function randBetween(x, y) {
    return x + Math.random() * (y - x);
}

function randIntBetween(x, y) {
    return x + Math.floor(Math.random() * (y - x));
}

function shuffleArray(array) {
    let a = array.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// t: current time, b: begInnIng value, c: change In value, d: duration
function ease(x0, x1, amt) {
    t = amt;
    b = x0;
    c = x1 - x0;
    d = 1;
    return c * (t /= d) * t + b;
}

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

const darks = [
    "#020B20",
    "#2B5A8C",
    "#754F82",
    "#CB435F"
];

const lights = [
    "#ADE0EE",
    "#C6EBF0",
    "#E9EBE8",
    "#EFB5BF",
    "#F8E3D5",
    "#7BAACB",
    "#A7A4BD"
]

var currentFg;
var currentBg;

class Box {
    constructor(x, y, w, h, a) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.x1 = x;
        this.y1 = y;
        this.w1 = w;
        this.h1 = h;
        this.startTime = 0; //domain of performance.now()
        this.o = 0; //[0,1]
        this.horizontal = true;
        this.age = a;
        this.lines = [];
        this.childA = null;
        this.childB = null;

        if(a == maxAge) {
            //set up lines array
            for(var i = 0; i < globalMaxDivisions*2; i++) {
                if(i < globalMaxDivisions) {
                    this.lines.push(new Line(this, 1 / globalMaxDivisions, true));
                } else {
                    this.lines.push(new Line(this, 1 / globalMaxDivisions, false));
                }
            }
        } else {
            //make 2 boxes
            this.o = randBetween(0.1,0.9);
            this.horizontal = Math.random() > 0.5;
            if(this.horizontal) {
                this.childA = new Box(
                    this.x, this.y, this.w, this.h * this.o, this.age + 1
                )
                this.childB = new Box(
                    this.x, this.y + (this.h * this.o), this.w, this.h * (1 - this.o), this.age + 1
                )
            } else {
                this.childA = new Box(
                    this.x, this.y, this.w * this.o, this.h, this.age + 1
                )
                this.childB = new Box(
                    this.x + (this.w * this.o), this.y, this.w * (1 - this.o), this.h, this.age + 1
                )
            }
        }
    }
};

Box.prototype.newCoords = function(newX, newY, newW, newH) {
    this.x1 = newX;
    this.y1 = newY;
    this.w1 = newW;
    this.h1 = newH;
    this.o1 = randBetween(.1,.9);
    this.startTime = performance.now();
    if(this.age == maxAge) {
        let maxDivisions = this.lines.length/2;
        let cols = randIntBetween(4, maxDivisions);
        let rows = randIntBetween(4, maxDivisions);
        for (var i = 0; i < maxDivisions*2; i++) {
            if (i < maxDivisions) {
                this.lines[i].o1 = (1 / cols) * i;
            } else {
                this.lines[i].o1 = (1 / rows) * (i - maxDivisions);
            }
        }
    } else {
        if(this.horizontal) {
            this.childA.newCoords(this.x1, this.y1, this.w1, this.h1 * this.o1);
            this.childB.newCoords(this.x1, this.y1 + (this.h1 * this.o1), this.w1, this.h1 * (1 - this.o1))
        } else {
            this.childA.newCoords(this.x1, this.y1, this.w1 * this.o1, this.h1);
            this.childB.newCoords(this.x1 + (this.w1 * this.o1), this.y1, this.w1 * (1 - this.o1), this.h1);
        }
    }
}

Box.prototype.newCoordsFinish = function(newX, newY, newW, newH) {
    //the same as newCoords but with fixed parameters instead of random ones
    this.x1 = newX;
    this.y1 = newY;
    this.w1 = newW;
    this.h1 = newH;
    this.o1 = 1;
    this.startTime = performance.now();
    if (this.age == maxAge) {
        let maxDivisions = this.lines.length / 2;
        let cols = maxDivisions;
        let rows = maxDivisions;
        for (var i = 0; i < maxDivisions * 2; i++) {
            if (i < maxDivisions) {
                this.lines[i].o1 = (1 / cols) * i;
            } else {
                this.lines[i].o1 = (1 / rows) * (i - maxDivisions);
            }
        }
    } else {
        if (this.horizontal) {
            this.childA.newCoordsFinish(this.x1, this.y1, this.w1, this.h1 * this.o1);
            this.childB.newCoordsFinish(this.x1, this.y1 + (this.h1 * this.o1), this.w1, this.h1 * (1 - this.o1))
        } else {
            this.childA.newCoordsFinish(this.x1, this.y1, this.w1 * this.o1, this.h1);
            this.childB.newCoordsFinish(this.x1 + (this.w1 * this.o1), this.y1, this.w1 * (1 - this.o1), this.h1);
        }
    }
}

Box.prototype.update = function(time) {
    var duration = 150;
    var deltaTime = time - this.startTime;
    var s = deltaTime / duration;
    if(s > 1) s = 1;
    this.x = ease(this.x, this.x1, s);
    this.y = ease(this.y, this.y1, s);
    this.w = ease(this.w, this.w1, s);
    this.h = ease(this.h, this.h1, s);
    this.o = ease(this.o, this.o1, s);
    if (this.age == maxAge) {
        this.lines.forEach(l => l.update(time));
    } else {
        if(this.childA) this.childA.update(time);
        if(this.childB) this.childB.update(time);
    }
}

Box.prototype.draw = function() {
    if (this.age == maxAge) {
        ctx.strokeRect(this.x, this.y, this.w, this.h);
        this.lines.forEach(l => {
            l.draw();
        });
    } else {
        this.childA.draw();
        this.childB.draw();
    }
    // ctx.strokeRect(this.x, this.y, this.w, this.h);
}

class Line {
    constructor(bounds, offset, h) {
        this.bounds = bounds;
        this.o = offset;
        this.o1 = offset;
        this.startTime = 0;
        this.horizontal = h;
    }
}

Line.prototype.update = function(time) {
    var duration = 150;
    var deltaTime = time - this.bounds.startTime;
    var s = deltaTime / duration;
    if (s > 1) s = 1;
    this.o = ease(this.o, this.o1, s);
}

Line.prototype.draw = function() {
    if(this.o > 1) {
        return;
    }
    ctx.save();
    ctx.translate(this.bounds.x, this.bounds.y);
    ctx.beginPath();
    if(this.horizontal) {
        ctx.moveTo(0, this.bounds.h * this.o);
        ctx.lineTo(this.bounds.w, this.bounds.h * this.o);
    } else {
        ctx.moveTo(this.bounds.w * this.o, 0);
        ctx.lineTo(this.bounds.w * this.o, this.bounds.h);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
}

var maxAge = 3;
var globalMaxDivisions = 10;
var boundingbox = new Box(50,50,w-100,h-100, 0);

function run() {
    // if(Math.random() > 0.5) {
    //     currentBg = shuffleArray(darks).pop();
    //     currentFg = shuffleArray(lights).pop();
    // } else {
    //     currentBg = shuffleArray(lights).pop();
    //     currentFg = shuffleArray(darks).pop();
    // }
    currentBg = "#000000";
    currentFg = "#FFFFFF";

    let rw = randIntBetween(w/4,w-100);
    let rh = randIntBetween(h/4,h-100);
    let rx = (w - rw)/2 + randIntBetween(0,0);
    let ry = (h - rh)/2 + randIntBetween(0,0);
    boundingbox.newCoords(rx, ry, rw, rh);
}

function runFinish() {
    boundingbox.newCoordsFinish(50,50,w-100,h-100,0);
}

run();

function loop(t) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = currentBg;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = currentFg;
    ctx.lineWidth = 2;
    boundingbox.update(t);
    boundingbox.draw();
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

document.addEventListener('keydown', function (e) {
    if (e.key == 'f') {
        run();
    } else if (e.key == 'g') {
        runFinish();
    }
})