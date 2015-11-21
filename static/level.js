function Level() {
    this.objects = [];
    this.visible = [];
    this.bpm = 168;
    this.ppf = 3; // pixels per frame
}


Level.prototype.updateVisible = function (frame) {
    for (var i = 0; i < this.objects.length; i++) {
        var t = this.objects[i];
        this.visible = [];
        if (t.startTime <= frame && frame < t.startTime + 1024 / this.ppf)
            this.visible.push(t);
    }
};

Level.prototype.draw = function (g) {

    var currentTime = game.music.getTime();
    var frame = Math.floor(currentTime / 60);

    for (var i = 0; i < this.visible.length; i++) {

        var x = this.objects[this.visible[i]];
        if (!x.visible)
            x.visible = time;
        x.draw(g, time - x.visible);
    }
}