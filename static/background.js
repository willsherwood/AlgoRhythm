function Background() {

    this.back = [];
    this.mid = [];
    this.fore = [];
    this.mod = 0;
    this.A = [];
    this.B = [];
    this.C = [];
    this.groundY = 405;
}

Background.prototype.init = function () {
    for (var i = 1; i <= 6; i++)
        this.back.push(document.getElementById('bg' + i));
    for (var i = 1; i <= 8; i++)
        this.mid.push(document.getElementById('mg' + i));
    for (var i = 1; i <= 6; i++)
        this.fore.push(document.getElementById('fg' + (i == 6 ? 7 : i)));
    for (var i = 0; i < 200; i++) {
        var ternary = Math.floor(Math.random() * 3);
        switch (ternary) {
            case 0:
                this.A.push({
                    img: this.back[Math.floor(Math.random() * this.back.length)],
                    mod: -3,
                    current: Math.random() * 1024 * 5 - 1024
                });
                break;
            case 1:
                this.B.push({
                    img: this.mid[Math.floor(Math.random() * this.mid.length)],
                    mod: -2,
                    current: Math.random() * 1024 * 5 - 1024
                });
                break;
            case 2:
                this.C.push({
                    img: this.fore[Math.floor(Math.random() * this.fore.length)],
                    mod: -1,
                    current: Math.random() * 1024 * 5 - 1024
                });
                break;
        }
    }
};

Background.prototype.draw = function () {
    if (!game.music.isPaused())
        this.mod++;
    game.ctx.drawImage(document.getElementById('sky'), 0, 0);
    game.ctx.drawImage(document.getElementById('stars'), 0, 0);
    for (var i = 0; i < this.A.length; i++) {
        var q = this.A[i];
        if (!game.music.isPaused())
            q.current += 1 / q.mod;
        if (q.current < -200) continue;
        game.ctx.drawImage(q.img, q.current, this.groundY - q.img.height);
    }
    for (var i = 0; i < this.B.length; i++) {
        var q = this.B[i];
        if (!game.music.isPaused())
            q.current += 1 / q.mod;
        if (q.current < -200) continue;
        game.ctx.drawImage(q.img, q.current, this.groundY - q.img.height);
    }
    for (var i = 0; i < this.C.length; i++) {
        var q = this.C[i];
        if (!game.music.isPaused())
            q.current += 1 / q.mod;
        if (q.current < -200) continue;
        game.ctx.drawImage(q.img, q.current, this.groundY - q.img.height);
    }
};


window.backgroundModuleLoaded = true;
window.trigger && window.trigger();
