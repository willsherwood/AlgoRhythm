function Level() {
    this.objects = [];
    this.visible = [];
    this.bpm = 168;
    this.velocity = 60; // pixels/sec
}

Level.prototype.updateVisible = function () {
    var time = game.music.getTime();
    for (var i = 0; i < this.objects.length; i++) {
        var t = this.objects[i];
        this.visible = [];
        if (t.startTime <= time && time < t.startTime + game.width / this.velocity)
            this.visible.push(t);
    }
};

Level.prototype.draw = function (g) {
    var time = game.music.getTime();

    for (var i = 0; i < this.visible.length; i++) {
        var x = this.objects[this.visible[i]];
        if (!x.visible)
            x.visible = time;
        x.draw(g, time - x.visible);
    }
};

window.levelModuleLoaded = true;
window.trigger && window.trigger();
