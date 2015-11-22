function Particle(id, x, y) {
    this.duration = 0.5
    this.startTime = game.music.getTime();
    this.el = document.getElementById(id);
    this.dead = false;
    this.width = this.el.width;
    this.height = this.el.height;
    this.x = x || player.x;
    this.y = y || player.y;
}

Particle.prototype.draw = function() {
    var time = game.music.getTime();
    if (time > this.startTime + this.duration) {
        this.dead = true;
        return;
    }
    game.ctx.globalAlpha = 1 - (time - this.startTime) / this.duration;
    game.ctx.drawImage(this.el, this.x - (this.width >> 1), this.y - this.height);
    game.ctx.globalAlpha = 1;
};
