function createCanvas(width, height) {
    var canv = document.createElement("canvas");
    canv.width = width;
    canv.height = height;
    canv.tabIndex = 0;
    canv.style.outline = "none";
    document.body.appendChild(canv);
    return canv;
}

var game = {
    width: 1024,
    height: 576,

    running: false,

    canvas: null,
    ctx: null,

    controller: null,

    objects: [],

    grid: [[0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 1, 1, 1, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0],
           [1, 1, 1, 1, 1, 1, 1, 1]],

    attackLKeys: [81, 87, 69, 82, 84, 65, 83, 68, 70, 71, 90, 88, 67, 86],
    attackRKeys: [89, 85, 73, 79, 80, 91, 123, 93, 125, 92, 124, 72, 74, 75, 76, 59, 58, 39, 34, 66, 78, 77, 44, 60, 46, 62, 47, 63],
    jumpKeys: [32],
    slideKeys: [16, 17],

    keymap: {},

    init: function() {
        this.attackLKeys.forEach(function(k) {this.keymap[k] = this.attackL.bind(this);}, this);
        this.attackRKeys.forEach(function(k) {this.keymap[k] = this.attackR.bind(this);}, this);
        this.jumpKeys.forEach(function(k) {this.keymap[k] = this.jump.bind(this);}, this);
        this.slideKeys.forEach(function(k) {this.keymap[k] = this.slide.bind(this);}, this);

        this.canvas = createCanvas(this.width, this.height);
        this.ctx = this.canvas.getContext("2d");

        this.controller = new Controller();
        this.controller.init(game.canvas);

        this.music = new Music();
        this.music.init("test.mp3", (function() {
            this.music.play();
        }).bind(this));

        this.controller.keyPressed = this.keyPressed.bind(this);
        this.objects.push(new Level())
    },

    drawGrid: function() {
        for (var y = 0; y < this.grid.length; y++) {
            for (var x = 0; x < this.grid[0].length; x++) {
                var tile = this.grid[y][x];
                if (tile) {
                    this.ctx.fillRect(x * 32, y * 32, 32, 32);
                }
            }
        }
    },

    redraw: function() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
        for (var i = 0; i < this.objects.length; i++)
            this.objects[i].draw(this.ctx);
        this.controller.updateGamepads();
        if (this.running)
            window.requestAnimationFrame(this.redraw.bind(this));
    },

    updateRunningText: function() {
        var text = document.getElementById("statustext");
        if (text) text.textContent = this.running ? "running" : "not running";
    },

    start: function() {
        if (!this.running) {
            this.running = true;
            this.updateRunningText();
            this.redraw();
        }
    },

    stop: function() {
        this.running = false;
        this.updateRunningText();
    },

    toggle: function() {
        if (this.running) this.stop();
        else this.start();
    },

    keyPressed: function(e) {
        func = this.keymap[e];
        if (func) {
            func();
            return false;
        } else return true;
    },

    attackL: function() {
        console.log("Attacking left");
    },

    attackR: function() {
        console.log("Attacking right");
    },

    jump: function() {
        console.log("Jumping");
    },

    slide: function() {
        console.log("Sliding");
    }
};

function start() {
    game.init();
    var gpbutton = document.getElementById("gpbutton");
    if (gpbutton)
        gpbutton.addEventListener("click", game.controller.startScan.bind(game.controller));
    game.start();
}

function writeMessage(m) {
    var console = document.getElementById("devconsole");
    if (console) {
        var p = document.createElement("p");
        p.appendChild(document.createTextNode(m));
        console.appendChild(p);
    } else {
        window.alert(m);
    }
}

window.trigger = function() {
    if (window.keyboardLog) {
        window.keyboardLog.forEach(writeMessage);
        window.keyboardLog = null;
    }
    if (window.playerModuleLoaded && window.keyboardModuleLoaded && window.musicModuleLoaded && window.levelModuleLoaded) {
        start();
    }
}

window.addEventListener("DOMContentLoaded", window.trigger);

window.setTimeout(function() {
    if (!game.running) writeMessage("Warning: all modules not loaded");
}, 1000);

window.addEventListener("DOMContentLoaded", function() {
    var button = document.getElementById("startstop");
    if (button)
        button.addEventListener("click", game.toggle.bind(game));
});
