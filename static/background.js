function Background() {

    this.back = [];
    this.mid = [];
    this.fore = [];
}

Background.prototype.init = function() {
    for (var i=1; i<=6; i++)
        this.back.push(document.getElementById('Bg' + i));
    for (var i=1; i<=6; i++)
        this.mid.push(document.getElementById('Mg' + (i == 6? 7 : i)));
    for (var i=0; i<=8; i++)
        this.fore.push(document.getElementById('Fg' + i));
};

Background.prototype.draw = function() {
    game.ctx.drawImage(document.getElementById('sky'), 0, 0);
};


window.backgroundModuleLoaded = true;
window.trigger && window.trigger();
