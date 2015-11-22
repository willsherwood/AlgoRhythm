player = {
    x: 100,
    y: 500,
    jumping: false,
    jumpTime: 0,
    sliding: false,
    slideTime: 0,
    mod: 0,
    images: [],
    slideImage: null,

    init: function() {
        for (var i=1; i<=8; i++) {
            this.images.push(document.getElementById('r'+i));
        }
        this.slideImage = document.getElementById('slide');
    },

    jump: function () {
        if (this.sliding)
            return;
        this.jumping = true;
        this.jumpTime = game.music.getTime();
    },

    draw: function (y) {
        this.mod = (this.mod+1) % 24;
        //game.ctx.fillRect(this.x - 40, y - 130 - (this.sliding? (-130+40) : 0), 80, this.sliding ? 40:130);
        game.ctx.fillStyle = "#aaaaaa";
        game.ctx.fillRect(this.x, 0, 1, game.height);
        game.ctx.fillStyle = "#000000";
        if (this.sliding)
            game.ctx.drawImage(this.slideImage, this.x - 100, y - 100);
        else
            game.ctx.drawImage(this.images[Math.floor(this.mod / 3)], this.x - 80, y - 250);
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
