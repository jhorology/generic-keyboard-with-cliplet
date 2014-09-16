(function(root, Bitwig, Backbone, _) {
    'use strict';

    // import classes
    var UserControlBank = root.bitbone.UserControlBank,
        ClipLauncherSlot = root.bitbone.ClipLauncherSlot,
        TrackBank = root.bitbone.TrackBank;

    // ManagedClipCollection
    // -------------
    // Collection of ClipLauncherSlot
    var ManagedClipCollection = Backbone.Collection.extend({
        model: ClipLauncherSlot
    });

    // ClipletController
    // -------------
    //
    var ClipletController = Backbone.Model.extend({
        initialize: function(attributes, options) {
            this.initController(options);
            this.initialized = true;
        },

        initController: function(attributes, options) {
            var context = this;

            // options defualts
            _.defaults(options, {
                numTracks: 32,
                numScenes: 32
            });

            this.managedClips = new ManagedClipCollection();
            this.trackBank = TrackBank.create(options);
            this.trackBank.get('tracks').each(function(track) {
                track.get('clipLauncherSlots')
                    .on('change:name', context.onChangeClipName, context);
            });
        },
        
        onMidi: function(sts, d1, d2) {
            var cc = root.isChannelController(sts),
                no = root.isNoteOn(sts),
                ch = sts && 0x0f;

            // launch clips;
            if ((cc || no) && d2 > 0) {
                var clips = this.managedClips.filter(function(clip) {
                    var c = clip.cliplet;
                    return (c.ch === undefined || c.ch === ch) &&
                        ((cc && d1 === c.cc) ||
                         (no && d1 === c.note));
                });
                _.each(clips, function(clip) {
                    clip.launch();
                });
            }
        },

        onFlush: function() {
        },

        onExit: function() {
        },

        onChangeClipName: function(clip, name, options) {
            clip.cliplet = this.createCliplet(name);
            var contains = this.managedClips.contains(clip),
                triggable =  _.isNumber(clip.cliplet.cc) ||
                    _.isNumber(clip.cliplet.note);
            // update triggable
            if (contains && !triggable) {
                clip.off(null, null, this);
                this.managedClips.remove(clip);
            }
            if (!contains && triggable) {
                this.managedClips.add(clip);
            }
        },

        createCliplet: function(str) {
            var o, f = false;
            try {
                o = eval('({' + str + '})');
                f =  _.isObject(o);
            } catch (e) {}

            if (_.isObject(o)) {
                return {
                    cc: _.isNumber(o.cc) ? o.cc : undefined,
                    note: _.isNumber(o.note) ? o.note : undefined,
                    ch: _.isNumber(o.ch) ? o.ch : undefined,
                    ply: _.isFunction(o.ply) ? o.ply : undefined,
                    stp: _.isFunction(o.stp) ? o.stp : undefined,
                    que: _.isFunction(o.que) ? o.que : undefined,
                    rec: _.isFunction(o.rec) ? o.rec : undefined,
                    sel: _.isFunction(o.sel) ? o.sel : undefined
                };
            } else {
                return {cc:undefined, note:undefined, ch:undefined,
                        ply:undefined, stp:undefined, que:undefined, 
                        rec: undefined, sel:undefined};
            }
        }

    },{
        create: function(options) {
            return new ClipletController(options);
        }
    });

    // export
    root.controller || (root.controller = {});
    root.controller.ClipletController = ClipletController;

}(this, host, Backbone, _));
