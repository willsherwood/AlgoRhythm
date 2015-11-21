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
    width: 640,
    height: 480,

    running: false,

    canvas: null,
    ctx: null,

    controller: null,

    objects: [x],

    grid: [[0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 1, 1, 1, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0],
           [1, 1, 1, 1, 1, 1, 1, 1]],

    init: function() {
        this.canvas = createCanvas(this.width, this.height);
        this.ctx = this.canvas.getContext("2d");

        this.controller = new Controller();
        this.controller.initKeyboard(game.canvas);

        this.controller.startScan();

        this.controller.keyPressed = this.keyPressed.bind(this);
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
        console.log(e);
    }
};

function start() {
    game.init();
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
    if (window.playerModuleLoaded && window.keyboardModuleLoaded) {
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
