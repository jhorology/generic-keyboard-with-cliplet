(function(root, Bitwig) {
    'use strict';

    // see directive.js
    // root.loadAPI(1);

    Bitwig.defineMidiPorts(1, 0);
    Bitwig.defineController(
        'Generic',
        'MIDI Keyboard + Cliplet',
        '0.1',
        'ad120050-3b2e-11e4-916c-0800200c9a66'
    );

    var LOWEST_CC = 1;
    var HIGHEST_CC = 119;

    // import class
    var ClipletController = root.controller.ClipletController;
        
    // variables
    var userControls,
        clipletController;

    root.init = function() {
        Bitwig.getMidiInPort(0).setMidiCallback(onMidi);
        var generic = Bitwig.getMidiInPort(0).createNoteInput('MIDI Keyboard', '??????');
        generic.setShouldConsumeEvents(false);

        // Make CCs 1-119 freely mappable
        userControls = Bitwig.createUserControlsSection(HIGHEST_CC - LOWEST_CC + 1);
        for(var i=LOWEST_CC; i<=HIGHEST_CC; i++)
        {
            userControls.getControl(i - LOWEST_CC).setLabel('CC' + i);
        }

        // plug cliplet
        clipletController = ClipletController.create();
    };


    root.flush = function() {
        // plug cliplet controller
        clipletController.onFlush();
    };

    root.exit = function() {
        // plug cliplet controller
        clipletController.onExit();
    };

    function onMidi(status, data1, data2) {
        // plug cliplet controller
        clipletController.onMidi(status, data1, data2);


        if (root.isChannelController(status))
        {
            if (data1 >= LOWEST_CC && data1 <= HIGHEST_CC)
            {
                var index = data1 - LOWEST_CC;
                userControls.getControl(index).set(data2, 128);
            }
        }	 
    }

}(this, host));
