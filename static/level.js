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
    this.platforms.push({start: land, end: Infinity});
}

Level.prototype.drawObject = function (o, x) {
    // o is the object to be drawn
    // o.type is a string
    // x is the x coordinate//

    //TODO: fade out
    if (o.type == 'spike') {
        game.ctx.fillRect(x, 0, 1, game.height);
        game.ctx.fillRect(x - 16 + this.velocity * (this.jumpTime / 2), player.y - 32, 32, 32);
    }
    else
        game.ctx.fillRect(x - 16, player.y - 32, 32, 32);
};

Level.prototype.draw = function () {
    var time = game.music.getTime();
    for (var i = 0; i < this.objects.length; i++) {
        var x = this.objects[i];
        var xc = (x.time - time) * this.velocity + player.x;
        // y = this.jumpFactor * -time * (time - this.jumpTime)
        // where time is time after jump
        // if time > this.jumpTime then stop jump
        this.drawObject(x, xc);
    }
    var flag = false;
    for (var i = 0; i < this.platforms.length; i++) {
        var x = this.platforms[i];
        var sx = (x.start - time) * this.velocity + player.x;
        if (sx < 0) sx = 0;
        if (sx > game.width) continue;
        var ex = (x.end - time) * this.velocity + player.x;
        if (ex < 0) continue;
        if (ex > game.width) ex = game.width;
        game.ctx.fillRect(sx, player.y, ex - sx, game.height - player.y);
        if (player.x >= sx && player.x <= ex) flag = true;
    }
    if (!(flag || player.jumping))
        console.log("You died");
    var py = player.y;
    if (player.jumping) {
        var t = time - player.jumpTime;
        var y = this.jumpFactor * t * (t - this.jumpTime);
        if (y > 0) {
            player.jumping = false;
        } else
            py = y + player.y;
    }
    player.draw(py);

};


window.levelModuleLoaded = true;
window.trigger && window.trigger();
