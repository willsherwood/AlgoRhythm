function Particle(id) {
    this.duration = 0.5
    this.startTime = game.music.getTime();
    this.el = document.getElementById(id);
    this.dead = false;
    this.width = this.el.width;
    this.height = this.el.height;
}

Particle.prototype.draw = function() {
    var time = game.music.getTime();
    if (time > this.startTime + this.duration) {
        this.dead = true;
        return;
    }
    game.ctx.globalAlpha = 1 - (time - this.startTime) / this.duration;
    game.ctx.drawImage(this.el, player.x - (this.width >> 1), player.y - this.height);
    game.ctx.globalAlpha = 1;
};