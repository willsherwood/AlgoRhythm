window.keyboardLog = [];

function kbLog(m) {
    if (window.writeMessage) {
        window.writeMessage(m);
    } else {
        window.keyboardLog.append(m);
    }
}

function Controller() {
    this.gamepad = null;
    this.gamepadKeys = [];
    this.gamepadPressed = [];
    this.pressedKeys = {};
    this.scanInterval = null;
    this.keyPressed = function(){};
    this.keyReleased = function(){};
}

Controller.prototype.startScan = function() {
    if ('ongamepadconnected' in window) {
        window.addEventListener("gamepadconnected", this.gpConnect.bind(this));
        window.addEventListener("gamepaddisconnected", this.gpDisconnect.bind(this));
    } else {
        kbLog("Scanning for gamepads...");
        this.scanInterval = window.setInterval(this.gpScan.bind(this), 500);
    }
};

Controller.prototype.stopScan = function(successful) {
    if (this.scanInterval) {
        clearInterval(this.scanInterval);
        this.scanInterval = null;
        if (!successful)
            kbLog("Stopping scan");
    } else kbLog("Not scanning");
};

Controller.prototype.gpConnect = function(e) {
    if (this.gamepad) {
        kbLog("New gamepad connected, not ejecting previous gamepad.");
        return;
    }
    this.gamepad = e.gamepad;
    this.gamepadKeys = new Array(this.gamepad.buttons.length);
    this.gamepadPressed = new Array(this.gamepad.buttons.length);
    this.stopScan(true);
};

Controller.prototype.gpDisconnect = function(e) {
    kbLog("Gamepad disconnected.");
    this.gamepad = null;
};

Controller.prototype.gpScan = function() {
    var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
    if (gamepads.length > 0) {
        this.gpConnect({gamepad: gamepads[0]});
        kbLog("Stopping scan.");
        window.clearInterval(this.scanInterval);
        this.scanInterval = null;
    }
};

Controller.prototype.updateGamepads = function() {
    if (!this.gamepad) return;
    if (!this.gamepad.connected) {
        kbLog("Gamepad disconnected. Not scanning.");
        this.gamepad = null;
        return;
    }
    for (var i = 0; i < this.gamepad.buttons.length; i++) {
        var button = this.gamepad.buttons[i];
        var pressed = false;
        if (typeof(button) == "object")
            pressed = button.pressed;
        else
            pressed = button == 1.0;
        if ((!pressed != !this.gamepadPressed[i]) && this.gamepadKeys[i])
            if (pressed)
                this.handleKeyPressed({key: this.gamepadKeys[i]});
            else
                this.handleKeyReleased({key: this.gamepadKeys[i]});
        this.gamepadPressed[i] = pressed;
    }
};

Controller.prototype.handleKeyDown = function(e) {
    var kc = e.key || e.which || e.keyCode;
    if (!pressedKeys[kc])
        this.keyPressed(kc);
    this.pressedKeys[kc] = true;
    return false;
};

Controller.prototype.handleKeyUp = function(e) {
    var kc = e.key || e.which || e.keyCode;
    if (pressedKeys[kc])
        this.keyReleased(kc);
    this.pressedKeys[kc] = false;
    return false;
};

Controller.prototype.initKeyboard = function(el) {
    el.addEventListener("keydown", this.handleKeyDown.bind(this), true);
    el.addEventListener("keyup", this.handleKeyUp.bind(this), true);
}

window.keyboardModuleLoaded = true;
window.trigger && window.trigger();
