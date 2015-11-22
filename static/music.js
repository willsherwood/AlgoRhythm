function Music() {
    this.el = null;
    this.source = null;
    this.gain = null;
    this.buffer = null;
}

Music.context = null;

Music.prototype.init = function(url, loadCallback, buffer) {
    if (!Music.context)
        Music.context = new (window.AudioContext || window.webkitAudioContext)();
    this.gain = Music.context.createGain();
    if (!buffer) {
        this.el = document.createElement("audio");
        this.el.src = url;
        this.el.addEventListener("canplaythrough", loadCallback);
        this.source = Music.context.createMediaElementSource(this.el);
        this.source.connect(this.gain);
        document.body.appendChild(this.el);
    } else {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = "arraybuffer";
        var t = this;
        xhr.onload = function() {
            if (xhr.status == 200) {
                Music.context.decodeAudioData(xhr.response, function(buffer) {
                    t.buffer = buffer;
                });
            }
        };
        xhr.send();
    }
    this.gain.gain.value = 1;
    this.gain.connect(Music.context.destination);
};

Music.prototype.play = function() {
    if (this.buffer) {
        var source = Music.context.createBufferSource();
        source.buffer = this.buffer;
        source.connect(this.gain);
        source.start();
    } else
        this.el.play();
};

Music.prototype.stop = function() {
    this.el.pause();
}

Music.prototype.getTime = function() {
    return this.el.currentTime;
};

Music.prototype.setTime = function(t) {
    this.el.currentTime = t;
}

Music.prototype.isPaused = function() {
    return this.el.paused;
}

window.musicModuleLoaded = true;
window.trigger && trigger();
