function parseQueryString(str) {
    var vars = str.split('&');
    var ret = {};
    for (var i = 0; i < vars.length; i++) {
        var v = vars[i];
        var ei = v.indexOf('=');
        if (ei == -1) {
            ret[decodeURIComponent(v)] = true;
            continue;
        }
        var key = decodeURIComponent(v.substring(0, ei));
        var val = decodeURIComponent(v.substring(ei + 1));
        ret[key] = val;
    }
    return ret;
}

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

    queryString: parseQueryString(window.location.search.substring(1)),

    objects: [],

    attackLKeys: [81, 87, 69, 82, 84, 65, 83, 68, 70, 71, 90, 88, 67, 86],
    attackRKeys: [89, 85, 73, 79, 80, 91, 123, 93, 125, 92, 124, 72, 74, 75, 76, 59, 58, 39, 34, 66, 78, 77, 44, 60, 46, 62, 47, 63],
    jumpKeys: [32],
    slideKeys: [16, 17],
    bg: null,
    tempoTap: 0,
    tempos: [],
    tempoTimeout: null,
    missY: 0,


    keymap: {},

    init: function() {
        window.editing = this.queryString.editing === 'true';

        this.attackLKeys.forEach(function(k) {this.keymap[k] = 'attackL';}, this);
        this.attackRKeys.forEach(function(k) {this.keymap[k] = 'attackR';}, this);
        this.jumpKeys.forEach(function(k) {this.keymap[k] = 'jump';}, this);
        this.slideKeys.forEach(function(k) {this.keymap[k] = 'slide';}, this);

        var titleh1 = document.createElement("h1");
        titleh1.textContent = this.queryString.title;
        document.body.appendChild(titleh1);
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
        this.music.init("../levels/" + this.queryString.music, (function() {
            window.musicLoaded = true;
            window.triggerLoad();
        }).bind(this));
        this.redSound = new Music();
        this.redSound.init("../res/Audio/red.ogg", undefined, true);
        this.blueSound = new Music();
        this.blueSound.init("../res/Audio/blue.ogg", undefined, true);
        this.jumpSound = new Music();
        this.jumpSound.init("../res/Audio/jump.ogg", undefined, true);
        this.failSound = new Music();
        this.failSound.init("../res/Audio/fail.ogg", undefined, true);

        if (!this.queryString.editing) {
            var a = new XMLHttpRequest();
            a.onreadystatechange = (function() {
                if (a.readyState == 4 && a.status == 200) {
                    var json = JSON.parse(a.responseText);
                    this.objects.push(new Level(json));
                    this.objects[0].init();
                }
            }).bind(this);
            a.open("GET", "../levels/" + this.queryString.json, true);
            a.send();
        } else {
            this.objects.push(new Level());
            this.objects[0].init();
            // create editing panel
            var panel = document.createElement("div");
            panel.id = "editing";
            document.body.appendChild(panel);
            var pheading = document.createElement("h1");
            pheading.textContent = "Editing Panel";
            panel.appendChild(pheading);
            this.music.el.controls = true;
            panel.appendChild(this.music.el);
            this.music.el.addEventListener("play", this.canvas.focus.bind(this.canvas));
            var testButton = document.createElement("button");
            testButton.id = "testbutton";
            testButton.textContent = "Test Level";
            testButton.addEventListener("click", this.test.bind(this));
            panel.appendChild(testButton);
            var stopTestButton = document.createElement("button");
            stopTestButton.id = "stoptestbutton";
            stopTestButton.textContent = "Stop Testing";
            stopTestButton.addEventListener("click", this.stopTesting.bind(this));
            panel.appendChild(stopTestButton);
            panel.appendChild(this.createParameter("velocity", "Scroll speed (pixels/sec)"));
            panel.appendChild(this.createParameter("tolerance", "Tolerance (seconds)"));
            panel.appendChild(this.createParameter("jumpTime", "Jump Time (seconds)"));
            panel.appendChild(this.createParameter("jumpHeight", "Jump Height (pixels)"));
            panel.appendChild(this.createParameter("bpm", "Beats per Minute"));
            var tempo = document.createElement("button");
            tempo.id = "tempo";
            tempo.textContent = "Tap for tempo";
            tempo.addEventListener("click", (function() {
                if (this.tempoTap == 0) {
                    this.stop();
                    this.music.play();
                } else {
                    if (this.tempoTimeout) window.clearTimeout(tempoTimeout);
                    this.tempos.push(this.music.getTime());
                    var a = 0;
                    for (var i=0; i<this.tempos.length; i++) {
                        a += (i+1) * (this.tempos[i]);
                    }
                    a *= this.tempos.length;
                    var temp1 = 0;
                    for (var i=0; i<this.tempos.length; i++) {
                        temp1 += i+1;
                    }
                    var temp2 = 0;
                    for (var i=0; i<this.tempos.length; i++) {
                        temp2 += this.tempos[i];
                    }
                    a -= temp1 * temp2;
                    temp2 = 0;
                    for (var i=0; i<this.tempos.length; i++) {
                        temp2 += (i+1) * (i+1);
                    }
                    a /= this.tempos.length * temp2 - temp1 * temp1;
                    document.getElementById('editbpm').value = 60 / a;
                    this.objects[0].bpm = 60/a;
                    setTimeout((function() {
                        this.restart();
                        this.music.stop();
                    }).bind(this), 2000);
                }
                this.tempoTap++;
            }).bind(this));
            panel.appendChild(tempo);

            this.objects[0].bpm = 120;
            this.objects[0].offset = 0;
        }
    },

    test: function() {
        // reset all dones and deads
        var level = this.objects[0];
        level.events.forEach(function(e) {delete e.done;});
        level.objects.forEach(function(e) {delete e.dead;});
        this.combo = 0;
        this.score = 0;
        this.updateScore();
        this.currentEvent = 0;
        window.editing = false;
        this.music.setTime(0);
        this.music.play();
        this.canvas.focus();
    },

    createParameter: function(param, text) {
        var p = document.createElement("p");
        var label = document.createElement("label");
        var input = document.createElement("input");
        var level = this.objects[0];
        input.type = "number";
        input.id = "edit" + param;
        input.value = level[param];
        label.htmlFor = "edit" + param;
        label.textContent = text;
        p.appendChild(label);
        p.appendChild(input);
        input.addEventListener("change", function() {
            level[param] = parseFloat(input.value);
            input.value = level[param];
            level.regenerate();
        });
        return p;
    },

    stopTesting: function() {
        // reset all dones and deads
        var level = this.objects[0];
        level.events.forEach(function(e) {delete e.done;});
        level.objects.forEach(function(e) {delete e.dead;});
        this.combo = 0;
        this.score = 0;
        this.updateScore();
        this.currentEvent = 0;
        window.editing = true;
        this.music.stop();
        this.music.setTime(0);
    },

    redraw: function() {
        //this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.controller.updateGamepads();
        this.bg.draw();
        for (var i = this.objects.length - 1; i >= 0; i--) {
            if (!this.objects[i].dead)
                this.objects[i].draw(this.ctx);
        }
        this.realCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.realCtx.drawImage(this.buffer, 0, 0);
        if (!window.editing) {
            if (this.objects.length > 0) {
                if (this.currentEvent < this.objects[0].events.length) {
                    var ev = this.objects[0].events[this.currentEvent];
                    if (this.music.getTime() > ev.time + this.objects[0].tolerance) {
                        this.currentEvent++;
                        if (!ev.done) {
                            this.score -= 25;
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

    restart: function() {
        if (!this.running) {
            this.running = true;
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
        if (func && !window.editing) {
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
        } else if (window.editing && func) {
            if (player.jumping || player.sliding) {
                if (func == 'jump' || func == 'slide') {
                    this.failSound.play();
                    return false;
                }
            }
            var level = this.objects[0];
            var time = this.music.getTime();
            var ii = binarySearch(level.events, time);
            if (ii < 0) ii = (~ii) - 1;
            var snapdivisions = 4;
            if (level.events[ii]) {
                var delay = time - level.events[ii].time;
                if (delay * level.bpm / 60 * 4 < 0.75)
                    snapdivisions = 8;
            }
            time = Math.round((time - level.offset) * level.bpm / 60 * snapdivisions) * 60 / level.bpm / snapdivisions + level.offset;
            if (func == 'jump') {
                this.generateObject("spike", time);
                this.generateEvent("jump", time, false);
                player.jump();
                this.jumpSound.play();
            } else if (func == 'attackL') {
                this.generateObject("red", time);
                this.generateEvent("attackL", time);
                this.redSound.play();
            } else if (func == 'attackR') {
                this.generateObject("blue", time);
                this.generateEvent("attackR", time);
                this.blueSound.play();
            } else if (func == 'slide') {
                this.generateObject("ceiling", time);
                this.generateEvent("slide", time);
                player.slide();
            } else {
                alert("Unknown function " + func);
            }
            return false;
        } else return true;
    },

    generateObject: function(type, time) {
        var i = binarySearch(this.objects[0].objects, time);
        if (i < 0) i = ~i;
        this.objects[0].objects.splice(i, 0, {"type": type, "time": time, "rand": Math.random()});
    },

    generateEvent: function(type, time, ground) {
        var obj = {"type": type, "time": time};
        if (type == 'jump') obj.ground = ground;
        var i = binarySearch(this.objects[0].events, time);
        if (i < 0) i = ~i;
        this.objects[0].events.splice(i, 0, obj);
    },

    attackL: function() {
        console.log("Attacking left");
        var ce = closest(this.objects[0].objects, this.music.getTime());
        if (!this.objects[0].objects[ce[0]]) return this.failSound.play();
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
        if (!this.objects[0].objects[ce[0]]) return this.failSound.play();
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
        } else {
            this.comboText.textContent = "";
        }
    }
};

function start() {
    if (game.running) return;
    game.init();
    var gpbutton = document.getElementById("gpbutton");
    if (gpbutton)
        gpbutton.addEventListener("click", game.controller.startScan.bind(game.controller));
    // scan for gamepads?
    var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    if (isChrome) game.controller.startScan();
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
window.allLoaded = false;
window.musicLoaded = false;

window.trigger = function() {
    if (window.keyboardLog) {
        window.keyboardLog.forEach(writeMessage);
        window.keyboardLog = null;
    }
    if (domReady && window.playerModuleLoaded && window.keyboardModuleLoaded && window.musicModuleLoaded && window.levelModuleLoaded && window.playerModuleLoaded && window.backgroundModuleLoaded) {
        start();
    }
};

function triggerLoad() {
    if (window.allLoaded && window.musicLoaded && !game.queryString.editing)
        game.music.play();
};

window.addEventListener("DOMContentLoaded", window.trigger);
window.addEventListener("load", function() {
    window.allLoaded = true;
    triggerLoad();
});

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
