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

    attackLKeys: [81, 87, 69, 82, 84, 65, 83, 68, 70, 71, 90, 88, 67, 86],
    attackRKeys: [89, 85, 73, 79, 80, 91, 123, 93, 125, 92, 124, 72, 74, 75, 76, 59, 58, 39, 34, 66, 78, 77, 44, 60, 46, 62, 47, 63],
    jumpKeys: [32],
    slideKeys: [16, 17],
    bg: null,

    keymap: {},

    init: function() {
        this.attackLKeys.forEach(function(k) {this.keymap[k] = this.attackL.bind(this);}, this);
        this.attackRKeys.forEach(function(k) {this.keymap[k] = this.attackR.bind(this);}, this);
        this.jumpKeys.forEach(function(k) {this.keymap[k] = this.jump.bind(this);}, this);
        this.slideKeys.forEach(function(k) {this.keymap[k] = this.slide.bind(this);}, this);

        this.canvas = createCanvas(this.width, this.height);
        this.realCtx = this.canvas.getContext("2d");
        this.buffer = document.createElement("canvas");
        this.buffer.width = this.width;
        this.buffer.height = this.height;
        this.ctx = this.buffer.getContext("2d");

        this.controller = new Controller();
        this.controller.init(game.canvas);

        this.music = new Music();
        this.controller.keyPressed = this.keyPressed.bind(this);

        this.music.init("../res/Music/dancedance.mp3", (function() {
            this.music.play();
        }).bind(this));
        var a = new XMLHttpRequest();
        a.onreadystatechange = (function() {
            if (a.readyState == 4 && a.status == 200) {
                var json = JSON.parse(a.responseText);
                this.objects.push(new Level(json));
            }
        }).bind(this);
        a.open("GET", "samplelevel.json", true);
        a.send();
    },

    redraw: function() {
        //this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.bg.draw();
        for (var i = this.objects.length - 1; i >= 0; i--) {
            this.objects[i].draw(this.ctx);
            if (this.objects[i].dead)
                this.objects.splice(i, 1);
        }
        this.realCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.realCtx.drawImage(this.buffer, 0, 0);
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
            player.init();
            this.bg = new Background();
            this.bg.init();
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
        var ce = closest(this.objects[0].objects, this.music.getTime());
        if (ce[0] < 0) return;
        if (this.objects[0].objects[ce[0]].type != 'red') return;
        if (ce[1] < this.objects[0].tolerance) {
            this.objects[0].objects[ce[0]].dead = true;
            this.objects.push(new Particle("rgi"));
            console.log("Success");
        }
    },

    attackR: function() {
        console.log("Attacking right");
        var ce = closest(this.objects[0].objects, this.music.getTime());
        if (ce[0] < 0) return;
        if (this.objects[0].objects[ce[0]].type != 'blue') return;
        if (ce[1] < this.objects[0].tolerance) {
            this.objects[0].objects[ce[0]].dead = true;
            this.objects.push(new Particle("bgi"));
            console.log("Success");
        }
    },

    jump: function() {
        console.log("Jumping");
        if (!player.jumping)
            player.jump();
    },

    slide: function() {
        if (!player.sliding)
            player.slide();
        console.log("Sliding");
    }
};

function start() {
    if (game.running) return;
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

window.domReady = false;

window.trigger = function() {
    if (window.keyboardLog) {
        window.keyboardLog.forEach(writeMessage);
        window.keyboardLog = null;
    }
    if (domReady && window.playerModuleLoaded && window.keyboardModuleLoaded && window.musicModuleLoaded && window.levelModuleLoaded && window.playerModuleLoaded && window.backgroundModuleLoaded) {
        start();
    }
};

window.addEventListener("DOMContentLoaded", window.trigger);

window.setTimeout(function() {
    if (!game.running) writeMessage("Warning: all modules not loaded");
}, 1000);

window.addEventListener("DOMContentLoaded", function() {
    var button = document.getElementById("startstop");
    if (button)
        button.addEventListener("click", game.toggle.bind(game));
    domReady = true;
    trigger();
});
