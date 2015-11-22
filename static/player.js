player = {
    x: 100,
    y: 500,
    jumping: false,
    jumpTime: 0,
    jump: function() {
        this.jumping = true;
        this.jumpTime = game.music.getTime();
    },

    draw: function(y) {
        game.ctx.fillRect(this.x - 40, y - 130, 80, 130);
    }
};

window.playerModuleLoaded = true;
window.trigger && window.trigger();
