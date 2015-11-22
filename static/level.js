function Level(json) {
    if (json) {
        this.objects = json.objects;
        this.objects.forEach(function(o) {o.rand = Math.random();});
        this.events = json.events;
        this.velocity = json.velocity; // pixels/sec
        this.tolerance = json.tolerance;
        this.jumpTime = json.jumpTime;
        this.jumpHeight = json.jumpHeight;
        this.platforms = [];
        var land = 0;
        for (var i = 0; i < this.events.length; i++) {
            var e = this.events[i];
            if (e.type != "jump" || !e.ground) continue;
            this.platforms.push({start: land, end: e.time});
            land = e.time + this.jumpTime;
        }
        this.platforms.push({start: land, end: Infinity});
    } else {
        this.objects = [];
        this.events = [];
        this.velocity = 1000;
        this.tolerance = 0.15;
        this.jumpTime = 0.4;
        this.jumpHeight = 160;
        this.platforms = [{start: 0, end: Infinity}];
    }
    this.jumpFactor = this.jumpHeight * 4 / (this.jumpTime * this.jumpTime);
    this.images = {cone: null, pothole: null, redcoin: null, bluecoin: null, traffic: null};
}

Level.prototype.regenerate = function() {
    this.objects.forEach(function(o) {o.rand = Math.random();});
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
};

Level.prototype.init = function() {
    // load images
    this.images.cone = document.getElementById("cone");
    this.images.pothole = document.getElementById("pothole");
    this.images.redcoin = document.getElementById("redcoin");
    this.images.bluecoin = document.getElementById("bluecoin");
    this.images.traffic = document.getElementById("traffic");
};

Level.prototype.drawObject = function (o, x) {
    // o is the object to be drawn
    // o.type is a string
    // x is the x coordinate//

    //TODO: fade out
    if (o.type == 'spike') {
        game.ctx.fillRect(x, 0, 1, game.height);
        var i = o.rand < 0.5 ? this.images.cone : this.images.pothole;
        var cf = o.rand < 0.5 ? 80 : 30;
        game.ctx.drawImage(i, x - (i.width >> 1) + this.velocity * (this.jumpTime / 2), player.y - (i.height >> 1) - cf);
    } else if (o.type == 'ceiling') {
        // game.ctx.fillRect(x, 0, 1, game.height);
        // game.ctx.fillRect(x + this.velocity * (this.tolerance * 0.5), 0, (this.jumpTime - this.tolerance) * this.velocity, game.height - 160);
        game.ctx.drawImage(this.images.traffic, x - this.images.traffic.width / 2, 0);
    } else if (o.type == 'red') {
        if (o.dead) return;
        game.ctx.drawImage(this.images.redcoin, x - this.images.redcoin.width / 2, player.y - this.images.redcoin.height / 2 - 64);
    } else if (o.type == 'blue') {
        if (o.dead) return;
        game.ctx.drawImage(this.images.bluecoin, x - this.images.bluecoin.width / 2, player.y - this.images.bluecoin.height / 2 - 64);
    } else
        game.ctx.fillRect(x - 16, player.y - 32, 32, 32);
};

Level.prototype.draw = function () {
    var time = game.music.getTime();
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
        if (time >= x.start - this.tolerance && time <= x.end + this.tolerance) flag = true;
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
    if (player.sliding) {
        var t = time - player.slideTime;
        var y = this.jumpFactor * t * (t - this.jumpTime);
        if (y > 0) {
            player.sliding = false;
        }
    }
    player.draw(py);
    for (var i = 0; i < this.objects.length; i++) {
        var x = this.objects[i];
        var xc = (x.time - time) * this.velocity + player.x;
        // y = this.jumpFactor * -time * (time - this.jumpTime)
        // where time is time after jump
        // if time > this.jumpTime then stop jump
        this.drawObject(x, xc);
    }
};

function binarySearch(stuff, time) {
    var lo = 0;
    var hi = stuff.length - 1;
    while (hi >= lo) {
        var i = (lo + hi) >> 1;
        if (time < stuff[i].time) {
            hi = i - 1;
        } else if (time > stuff[i].time) {
            lo = i + 1;
        } else {
            return i;
        }
    }
    return ~lo;
};

function closest(stuff, time) {
    var res = binarySearch(stuff, time);
    if (res >= 0) return res;
    var mi = ~res;
    var mm = stuff[mi] ? Math.abs(stuff[mi].time - time) : Infinity;
    var ii = mi;
    if (stuff[ii - 2] && Math.abs(stuff[ii - 2].time - time) < mm) {
        mi = ii - 2;
        mm = Math.abs(stuff[ii - 2].time - time);
    }
    if (stuff[ii - 1] && Math.abs(stuff[ii - 1].time - time) < mm) {
        mi = ii - 1;
        mm = Math.abs(stuff[ii - 1].time - time);
    }
    if (stuff[ii + 1] && Math.abs(stuff[ii + 1].time - time) < mm) {
        mi = ii + 1;
        mm = Math.abs(stuff[ii + 1].time - time);
    }
    if (stuff[ii + 2] && Math.abs(stuff[ii + 2].time - time) < mm) {
        mi = ii + 2;
        mm = Math.abs(stuff[ii + 2].time - time);
    }
    return [mi, mm];

}

window.levelModuleLoaded = true;
window.trigger && window.trigger();
