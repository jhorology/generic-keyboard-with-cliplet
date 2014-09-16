(function(root, Bitwig) {
    'use strict';

    root.loadAPI(1);

    Bitwig.defineMidiPorts(1, 0);
    Bitwig.defineController(
        'Generic',
        'MIDI Keyboard + Cliplet',
        '0.1',
        'ad120050-3b2e-11e4-916c-0800200c9a66'
    );

    var Controller = root.controller.Controller,
        controller;

    root.init = function() {
        controller = Controller.create();
    };

    root.flush = function() {
        controller && controller.onFlush();
    };

    root.exit = function() {
        controller && controller.onExit();
        controller = undefined;
    };
}(this, host));
