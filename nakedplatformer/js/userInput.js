"use strict";

document.addEventListener('keydown', function (event) {
    // Prevent default browser behavior for game controls
    if ([32, 37, 38, 39, 40].includes(event.keyCode)) {
        event.preventDefault();
    }

    if (event.keyCode == 87) {
        //W
        keys.W.pressed = true;
    }
    if (event.keyCode == 38) {
        //Up Arrow
        keys.UP.pressed = true;
    }
    if (event.keyCode == 32) {
        //Space
        keys.SPACE.pressed = true;
    }
    if (event.keyCode == 65 || event.keyCode == 37) {
        //A or Left Arrow
        keys.A.pressed = true;
    }
    if (event.keyCode == 68 || event.keyCode == 39) {
        //D or Right Arrow
        keys.D.pressed = true;
    }
});

document.addEventListener('keyup', function (event) {
    // Prevent default browser behavior for game controls
    if ([32, 37, 38, 39, 40].includes(event.keyCode)) {
        event.preventDefault();
    }

    if (event.keyCode == 87) {
        //W
        keys.W.pressed = false;
        keys.W.released = true;
    }
    if (event.keyCode == 38) {
        //Up Arrow
        keys.UP.pressed = false;
        keys.UP.released = true;
    }
    if (event.keyCode == 32) {
        //Space
        keys.SPACE.pressed = false;
        keys.SPACE.released = true;
    }
    if (event.keyCode == 65 || event.keyCode == 37) {
        //A or Left Arrow
        keys.A.pressed = false;
        keys.A.released = true;
    }
    if (event.keyCode == 68 || event.keyCode == 39) {
        //D or Right Arrow
        keys.D.pressed = false;
        keys.D.released = true;
    }
});