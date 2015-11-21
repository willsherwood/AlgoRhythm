function Music() {
    this.el = null;
    this.source = null;
    this.gain = null;
    this.context = null;
}

Music.prototype.init = function(url, loadCallback) {
    this.el = document.createElement("audio");
    this.el.src = url;
    this.el.addEventListener("canplaythrough", loadCallback);
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.source = this.context.createMediaElementSource(this.el);
    this.gain = this.context.createGain();
    this.gain.gain.value = 1;
    this.source.connect(this.gain);
    this.gain.connect(this.context.destination);
    document.body.appendChild(this.el);
};

Music.prototype.play = function() {
    this.el.play();
};

Music.prototype.getTime = function() {
    return this.el.currentTime;
}

window.musicModuleLoaded = true;
window.trigger && trigger();
