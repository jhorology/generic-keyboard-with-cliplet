(function(root, Bitwig, Backbone, _) {
    'use strict';

    // import
    var UserControlBank = root.bitbone.UserControlBank,
        ClipLauncherSlot = root.bitbone.ClipLauncherSlot,
        TrackBank = root.bitbone.TrackBank;

    // constnats
    var MAX_TRACKS = 32,
        MAX_SCENES = 32,
        LOWEST_CC = 1,
        HIGHEST_CC = 119;


    // Clips
    // -------------
    // Collection of ClipLauncherSlot
    var Clips = Backbone.Collection.extend({
        model: ClipLauncherSlot
    });

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
                noteInput = midiIn.createNoteInput('MIDI Keyboard', '??????'),
                ctx = this, i;

            midiIn.setMidiCallback(function(status, data1, data2) {
                ctx.onMidi(status, data1, data2);
            });
            noteInput.setShouldConsumeEvents(false);
            this.trackBank = TrackBank.create({
                numTracks: MAX_TRACKS,
                numScenes: MAX_SCENES
            });
            this.clipsOnMidi = new Clips();

            this.trackBank.get('tracks').each(function(track) {
                var clipLauncherSlots = track.get('clipLauncherSlots');
                clipLauncherSlots.on('change:name', ctx.onClipNameChanged, ctx);
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
                var clips = this.clipsOnMidi.filter(function(clip) {
                    var c = clip.cliplet;
                    return (!c.ch || c.ch === ch) &&
                        ((cc && d1 === c.cc) ||
                         (no && d1 === c.note));
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
            var o, f = false;
            try {
                o = eval('({' + name + '})');
                f =  _.isObject(o);
            } catch (e) {}
            var cliplet = {
                cc: (f && _.isNumber(o.cc)) ? o.cc : undefined,
                note: (f && _.isNumber(o.note)) ? o.note : undefined,
                ch : (f && _.isNumber(o.ch)) ? o.ch : undefined,
                ply : (f && _.isFunction(o.ply)) ? o.ply : undefined,
                stp:  (f && _.isFunction(o.stp)) ? o.stp : undefined,
                que:  (f && _.isFunction(o.que)) ? o.que : undefined,
                sel: (f && _.isFunction(o.sel)) ? o.sel : undefined
            };
            clip.cliplet = cliplet;
            var contains = this.clipsOnMidi.contains(clip),
                triggalble =  _.isNumber(cliplet.cc) ||  _.isNumber(cliplet.note);
            contains &&  !triggalble && this.clipsOnMidi.remove(clip);
            !contains && triggalble && this.clipsOnMidi.add(clip);
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
