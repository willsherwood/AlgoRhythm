test = {
    draw: function(g, time) {
        // draw something based on the time since it first became visible on screen
        g.fillRect(1024 - time / 30, 400, 32, 32);
    },

    startTime: 1000
};