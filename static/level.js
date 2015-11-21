function Level(json) {
    this.objects = json.objects;
    this.events = json.events;
    this.velocity = json.velocity; // pixels/sec
    this.jumpTime = json.jumpTime;
    this.jumpHeight = json.jumpHeight;
    this.jumpFactor = this.jumpHeight * 4 / (this.jumpTime * this.jumpTime);
    this.platforms = [];
    var land = 0;
    for (var i = 0; i < this.events.length; i++) {
        var e = this.events[i];
        if (e.type != "jump" || !e.ground) continue;
        this.platforms.push({start: land, end: e.time});
        land = e.time + this.jumpTime;
    }
    this.platforms.push({start: land, end: land + 500});
    this.playerX = 80;
}

Level.prototype.drawObject = function(o, x) {
    // o is the object to be drawn
    // o.type is a string
    // x is the x coordinate
    game.ctx.fillRect(x - 16, 576-100, 32, 32);
};

Level.prototype.draw = function () {
    var time = game.music.getTime();
    for (var i=0; i<this.objects.length; i++) {
        var x = this.objects[i];
        var xc = (x.time - time) * this.velocity + this.playerX;
        // y = this.jumpFactor * -time * (time - this.jumpTime)
        // where time is time after jump
        // if time > this.jumpTime then stop jump
        this.drawObject(x, xc);
    }
};




window.levelModuleLoaded = true;
window.trigger && window.trigger();
