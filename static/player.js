player = {
    x: 100,
    y: 500,
    jumping: false,
    jumpTime: 0,
    sliding: false,
    slideTime: 0,

    jump: function () {
        if (this.sliding)
            return;
        this.jumping = true;
        this.jumpTime = game.music.getTime();
    },

    draw: function (y) {
        game.ctx.fillRect(this.x - 40, y - 130 - (this.sliding? (-130+40) : 0), 80, this.sliding ? 40:130);
    },

    slide: function () {
        if (this.jumping)
            return;
        this.sliding = true;
        this.slideTime = game.music.getTime();
    }
};

window.playerModuleLoaded = true;
window.trigger && window.trigger();
