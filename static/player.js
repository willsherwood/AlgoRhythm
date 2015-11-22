player = {
    x: 100,
    y: 500,
    jumping: false,
    jumpTime: 0,
    sliding: false,
    slideTime: 0,
    mod: 0,
    images: [],

    init: function() {
        for (var i=1; i<=8; i++) {
            this.images.push(document.getElementById('r'+i));
        }
    },

    jump: function () {
        if (this.sliding)
            return;
        this.jumping = true;
        this.jumpTime = game.music.getTime();
    },

    draw: function (y) {
        this.mod+=1/3;
        //game.ctx.fillRect(this.x - 40, y - 130 - (this.sliding? (-130+40) : 0), 80, this.sliding ? 40:130);
        game.ctx.drawImage(this.images[Math.floor(this.mod % 8)], this.x - 40, y - 250);
        //this.realCtx.drawImage(this.buffer, 0, 0);

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
