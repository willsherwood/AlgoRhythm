var game = {
    width: 1024,
    height: 576,

    score: 0,
    currentEvent: 0,
    combo: 0,

    running: false,

    canvas: null,
    ctx: null,

    controller: null,

    redSound: null,
    blueSound: null,
    jumpSound: null,

    objects: [],

    attackLKeys: [81, 87, 69, 82, 84, 65, 83, 68, 70, 71, 90, 88, 67, 86],
    attackRKeys: [89, 85, 73, 79, 80, 91, 123, 93, 125, 92, 124, 72, 74, 75, 76, 59, 58, 39, 34, 66, 78, 77, 44, 60, 46, 62, 47, 63],
    jumpKeys: [32],
    slideKeys: [16, 17],
    bg: null,

    missY: 0,

    keymap: {},

    init: function() {
        this.attackLKeys.forEach(function(k) {this.keymap[k] = 'attackL';}, this);
        this.attackRKeys.forEach(function(k) {this.keymap[k] = 'attackR';}, this);
        this.jumpKeys.forEach(function(k) {this.keymap[k] = 'jump';}, this);
        this.slideKeys.forEach(function(k) {this.keymap[k] = 'slide';}, this);

        var container = document.createElement("div");
        container.id = "gamearea";
        container.style.width = this.width + "px";
        container.style.height = this.height + "px";
        document.body.appendChild(container);
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.tabIndex = 0;
        this.canvas.style.outline = "none";
        container.appendChild(this.canvas);
        this.realCtx = this.canvas.getContext("2d");
        this.buffer = document.createElement("canvas");
        this.buffer.width = this.width;
        this.buffer.height = this.height;
        this.ctx = this.buffer.getContext("2d");
        this.scoreText = document.createElement("p");
        this.scoreText.id = "scoretext";
        this.scoreText.textContent = "Score: 0";
        container.appendChild(this.scoreText);
        this.comboText = document.createElement("p");
        this.comboText.id = "combotext";
        this.comboText.textContent = "";
        container.appendChild(this.comboText);

        this.controller = new Controller();
        this.controller.init(game.canvas);
        this.controller.keyPressed = this.keyPressed.bind(this);

        this.music = new Music();
        this.music.init("../res/Music/hard.ogg", (function() {
            this.music.play();
        }).bind(this));
        this.redSound = new Music();
        this.redSound.init("../res/Audio/red.ogg", undefined, true);
        this.blueSound = new Music();
        this.blueSound.init("../res/Audio/blue.ogg", undefined, true);
        this.jumpSound = new Music();
        this.jumpSound.init("../res/Audio/jump.ogg", undefined, true);
        this.failSound = new Music();
        this.failSound.init("../res/Audio/fail.ogg", undefined, true);

        var a = new XMLHttpRequest();
        a.onreadystatechange = (function() {
            if (a.readyState == 4 && a.status == 200) {
                var json = JSON.parse(a.responseText);
                this.objects.push(new Level(json));
                this.objects[0].init();
            }
        }).bind(this);
        a.open("GET", "hard.json", true);
        a.send();
    },

    redraw: function() {
        //this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.controller.updateGamepads();
        this.bg.draw();
        for (var i = this.objects.length - 1; i >= 0; i--) {
            this.objects[i].draw(this.ctx);
            if (this.objects[i].dead)
                this.objects.splice(i, 1);
        }
        this.realCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.realCtx.drawImage(this.buffer, 0, 0);
        if (this.objects.length > 0) {
            if (this.currentEvent < this.objects[0].events.length) {
                var ev = this.objects[0].events[this.currentEvent];
                if (this.music.getTime() > ev.time + this.objects[0].tolerance) {
                    this.currentEvent++;
                    if (!ev.done) {
                        this.score -= 5;
                        this.combo = 0;
                        // this is a MISS
                        var ny = 200 - this.missY;
                        var t = this;
                        if (this.missY == 0)
                            setTimeout(function() {t.missY = 0;}, 600);
                        t.missY += 50;
                        this.objects.push(new Particle("misi", this.width >> 1, ny));
                        this.updateScore();
                    }
                }
            }
        }
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
        this.music.stop();
        this.updateRunningText();
    },

    toggle: function() {
        if (this.running) this.stop();
        else this.start();
    },

    keyPressed: function(e) {
        func = this.keymap[e];
        if (func) {
            this[func]();
            var time = this.music.getTime();
            var level = this.objects[0];
            var wi = this.currentEvent;
            if (!level.events[wi]) return false;
            var wm;
            if (level.events[wi].type != func)
                wm = Infinity;
            else
                wm = Math.abs(level.events[wi].time - time);
            var ii = this.currentEvent + 1;
            while (level.events[ii] && time >= level.events[ii].time - level.tolerance) {
                var dist = Math.abs(level.events[ii].time - time);
                if (dist < wm && level.events[ii].type == func) {
                    wm = dist;
                    wi = ii;
                }
                ii++;
            }
            if (wm <= level.tolerance) {
                var score = this.computeScore(wm);
                this.combo++;
                this.score += score;
                this.updateScore();
                level.events[wi].done = true;
                if (score == 30)
                    this.objects.push(new Particle("peri", game.width / 2, game.height / 2));
                else if (score == 20)
                    this.objects.push(new Particle("grei", game.width / 2, game.height / 2));
                else if (score == 10)
                    this.objects.push(new Particle("gooi", game.width / 2, game.height / 2));
                else if (score == 5)
                    this.objects.push(new Particle("badi", game.width / 2, game.height / 2));
            }
            return false;
        } else return true;
    },

    attackL: function() {
        console.log("Attacking left");
        var ce = closest(this.objects[0].objects, this.music.getTime());
        if (ce[0] < 0) return this.failSound.play();
        if (this.objects[0].objects[ce[0]].type != 'red') return this.failSound.play();
        if (ce[1] < this.objects[0].tolerance) {
            this.objects[0].objects[ce[0]].dead = true;
            this.objects.push(new Particle("rgi"));
            this.redSound.play();
        } else this.failSound.play();
    },

    attackR: function() {
        console.log("Attacking right");
        var ce = closest(this.objects[0].objects, this.music.getTime());
        if (ce[0] < 0) return this.failSound.play();
        if (this.objects[0].objects[ce[0]].type != 'blue') return this.failSound.play();
        if (ce[1] < this.objects[0].tolerance) {
            this.objects[0].objects[ce[0]].dead = true;
            this.objects.push(new Particle("bgi"));
            this.blueSound.play();
        } else this.failSound.play();
    },

    jump: function() {
        console.log("Jumping");
        if (!player.jumping) {
            player.jump();
            this.jumpSound.play();
        } else this.failSound.play();
    },

    slide: function() {
        if (!player.sliding)
            player.slide();
        else this.failSound.play();
        console.log("Sliding");
    },

    computeScore: function(dt) {
        var tol = this.objects[0].tolerance;
        if (dt < tol / 10) return 30;
        if (dt < tol / 5) return 20;
        if (dt < tol / 2) return 10;
        return 5;
    },

    updateScore: function() {
        this.scoreText.textContent = "Score: " + this.score;
        if (this.combo > 1) {
            this.comboText.textContent = this.combo + " combo";
            var fs = 36;
            if (this.combo > 20)
                fs = 48;
            if (this.combo > 50)
                fs = 60;
            if (this.combo > 100)
                fs = 72;
            if (this.combo > 200)
                fs = 84;
            if (this.combo > 300)
                fs = 100;
            if (this.combo > 500)
                fs = 144;
            this.comboText.style.fontSize = fs + "pt";
        }
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
