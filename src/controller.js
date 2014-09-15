(function(root, Bitwig, Backbone, _) {
    'use strict';

    // import
    var UserControlBank = root.bitbone.UserControlBank,
        Clip = root.model.Clip,
        ClipSlots = root.model.ClipSlots,
        Tracks = root.model.Tracks,
        Clips = root.model.Clips;
        

    // constnats
    var MAX_TRACKS = 128,
        MAX_SLOTS = 128,
        LOWEST_CC = 1,
        HIGHEST_CC = 119;


    // Controller
    // -------------
    //
    var Controller = Backbone.Model.extend({
        initialize: function(attributes, options) {
            this.initController();
            this.initialized = true;
        },

        initController: function() {
            var midiIn = Bitwig.getMidiInPort(0),
                noteInput = Bitwig.createNoteInput('MIDI Keyboard', '??????'),
                trackBank = Bitwig.createTrackBank(MAX_TRACKS, 0, MAX_SLOTS),
                ctx = this, i;

            this.tracks = new Tracks();
            this.clipsOnMidi = new Clips();


            midiIn.setMidiCallback(function(status, data1, data2) {
                ctx.onMidi(status, data1, data2);
            });
            noteInput.setShouldConsumeEvents(false);


            for(i = 0; i <= MAX_TRACKS; i++) {
                var slots = ClipSlots.create(
                    trackBank.getTrack(i).getClipLauncherSlots());
                // 1 based index
                slots.set('track', i + 1);
                this.tracks.add(slots);
            }

            this.tracks.each(function(slots) {
                slots.on('change:name', ctx.onClipNameChanged, ctx);
            });

            // Make CCs 1-119 freely mappable
            this.userControls = UserControlBank.create(HIGHEST_CC - LOWEST_CC + 1);
            for(i=LOWEST_CC; i<=HIGHEST_CC; i++) {
                this.userControls.at(i - LOWEST_CC).setLabel('CC' + i);
            }
        },
        
        onMidi: function(sts, d1, d2) {
            var cc = root.isChannelController(sts),
                no = root.isNoteOn(sts),
                ch = sts && 0x0f;

            // launch clips;
            if ((cc || no) && d2 > 0) {
                var clips = this.clipsOnMidi.filtter(function(clip) {
                    return (!clip.ch || clip.ch === ch) &&
                        ((cc && d1 === clip.cc) ||
                         (no && d1 === clip.note));
                });
                _.each(clips, function(clip) {
                    clip.launch();
                });
            }

            // user controls
            if (cc && d1 >= LOWEST_CC && d1 <= HIGHEST_CC) {
                var index = d1 - LOWEST_CC;
                this.userControls.at(index).set(d2, 128);
            }
        },

        onFlush: function() {
        },

        onExit: function() {
        },

        onClipNameChanged: function(clip, name, options) {
            var c = this.clipsOnMidi.contains(clip),
                t = clip.triggerableOnMidi();
            c &&  !t && this.clipsOnMidi.remove(clip);
            !c && t && this.clipsOnMidi.add(clip);
        }
    },{
        create: function(options) {
            return new Controller(options);
        }
    });

    // export
    root.controller || (root.controller = {});
    root.controller.Controller = Controller;

}(this, host, Backbone, _));
