(function(root, Bitwig, Backbone, _) {
    'use strict';

    // import classes
    var UserControlBank = root.bitbone.UserControlBank,
        ClipLauncherSlot = root.bitbone.ClipLauncherSlot,
        ClipLauncherScenesOrSlots = root.bitbone.ClipLauncherScenesOrSlots,
        ClipLauncherSceneOrSlot = root.bitbone.ClipLauncherSceneOrSlots,
        TrackBank = root.bitbone.TrackBank,
        Track = root.bitbone.Track,
        ClipletEnvironment = root.controller.ClipletEnvironment;


    var MAX_SCENES = 32,
        MAX_TRACKS = 32,
        MAX_EFFECT_TRACKS = 2;
    
    // Launcables clip
    // -------------
    // Collection of ClipLauncherSceneOrSlot
    var Launchables = Backbone.Collection.extend({
        model: ClipLauncherSceneOrSlot
    });

    // ClipletController
    // -------------
    //
    var ClipletController = Backbone.Model.extend({
        initialize: function(attributes, options) {
            this.initClipletController(attributes, options);
            this.initialized = true;
        },

        initClipletController: function(attributes, options) {
            var context = this;

            this.launchables = new Launchables();
            this.trackBank = TrackBank.createMain({
                numTracks: MAX_TRACKS,
                numScenes: MAX_SCENES
            });
            this.effectTrackBank = TrackBank.createEffect({
                numTracks: MAX_EFFECT_TRACKS,
                numScenes: MAX_SCENES
            });
            this.masterTrack = Track.createMaster({
                numScenes: MAX_SCENES
            });

            this.clipletEnv = new ClipletEnvironment({
                trackBank: this.trackBank,
                effectTrackBank: this.effectTrackBank,
                masterTrack: this.masterTrack
            });

            // main tracks
            this.trackBank.get('tracks').each(function(track) {
                track.get('clipLauncherSlots')
                    .on('change:name', function(clip, name) {context.onChangeClipName(track, clip, name);})
                    .on('change:queued',function(clip, value) {context.onChangeClipQueued(track, clip, value);})
                    .on('change:playing', function(clip, value) {context.onChangeClipPlaying(track, clip, value);})
                    .on('change:recording', function(clip, value) {context.onChangeClipRecording(track, clip, value);})
                    .on('change:selected', function(clip, value) {context.onChangeClipSelected(track, clip, value);});
            });

            // scene
            this.trackBank.get('clipLauncherScenes')
                .on('change:name', function(clip, name) {context.onChangeClipName(null, clip, name);});

            // effect tracks
            this.effectTrackBank.get('tracks').each(function(track) {
                track.get('clipLauncherSlots')
                    .on('change:name', function(clip, name) {context.onChangeClipName(track, clip, name);})
                    .on('change:queued',function(clip, value) {context.onChangeClipQueued(track, clip, value);})
                    .on('change:playing', function(clip, value) {context.onChangeClipPlaying(track, clip, value);})
                    .on('change:recording', function(clip, value) {context.onChangeClipRecording(track, clip, value);})
                    .on('change:selected', function(clip, value) {context.onChangeClipSelected(track, clip, value);});
            });

            // master track
            this.masterTrack.get('clipLauncherSlots')
                .on('change:name', function(clip, name) {context.onChangeClipName(this.masterTrack, clip, name);})
                .on('change:queued',function(clip, value) {context.onChangeClipQueued(this.masterTrack, clip, value);})
                .on('change:playing', function(clip, value) {context.onChangeClipPlaying(this.masterTrack, clip, value);})
                .on('change:recording', function(clip, value) {context.onChangeClipRecording(this.masterTrack, clip, value);})
                .on('change:selected', function(clip, value) {context.onChangeClipSelected(this.masterTrack, clip, value);});
        },
        
        onMidi: function(sts, d1, d2) {
            var cc = root.isChannelController(sts),
                no = root.isNoteOn(sts),
                ch = sts && 0x0f;

            // launch
            if ((cc || no) && d2 > 0) {
                var clips = this.launchables.filter(function(clip) {
                    var c = clip.cliplet;
                    return (c.ch === undefined || c.ch === ch) && ((cc && d1 === c.cc) || (no && d1 === c.note));
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

        onChangeClipName: function(track, clip, name) {
            clip.cliplet = this.createCliplet(name);
            var contains = this.launchables.contains(clip),
                launchable =  _.isNumber(clip.cliplet.cc) || _.isNumber(clip.cliplet.note);
            // update launchables
            if (contains && !launchable) {
                this.launchables.remove(clip);
            } else if (!contains && launchable) {
                this.launchables.add(clip);
            }
        },

        onChangeClipQueued: function(track, clip, value) {
            value && _.isObject(clip.cliplet) && _.isFunction(clip.cliplet.que) &&
                clip.cliplet.que.call(this.clipletEnv, this.clipletEnv);
        },

        onChangeClipPlaying: function(track, clip, value) {
            if (value) {
                _.isObject(clip.cliplet) && _.isFunction(clip.cliplet.ply) &&
                    clip.cliplet.ply.call(this.clipletEnv, this.clipletEnv);
            } else {
                _.isObject(clip.cliplet) && _.isFunction(clip.cliplet.stp) && clip.get('playing') &&
                    clip.cliplet.stp.call(this.clipletEnv, this.clipletEnv);
            }
        },

        onChangeClipRecording: function(track, clip, value) {
            value && _.isObject(clip.cliplet) && _.isFunction(clip.cliplet.rec) &&
                clip.cliplet.rec.call(this.clipletEnv, this.clipletEnv);
        },

        onChangeClipSelected: function(track, clip, value) {
            value && _.isObject(clip.cliplet) && _.isFunction(clip.cliplet.sel) &&
                clip.cliplet.sel.call(this.clipletEnv, this.clipletEnv);
        },

        createCliplet: function(str) {
            var o, cliplet = {};
            try { o = eval('({' + str + '})'); } catch (e) {}
            if (_.isObject(o)) {
                cliplet.name = _.isString(o.name) ? o.name : undefined;
                cliplet.cc = _.isNumber(o.cc) ? o.cc : undefined;
                cliplet.note = _.isNumber(o.note) ? o.note : undefined;
                cliplet.ch = _.isNumber(o.ch) ? o.ch : undefined;
                cliplet.que = _.isFunction(o.que) ? o.que : undefined;
                cliplet.ply = _.isFunction(o.ply) ? o.ply : undefined;
                cliplet.stp = _.isFunction(o.stp) ? o.stp : undefined;
                cliplet.rec = _.isFunction(o.rec) ? o.rec : undefined;
                cliplet.sel = _.isFunction(o.sel) ? o.sel : undefined;
            }
            return cliplet;
        }
        
    },{
        create: function(options) {
            return new ClipletController(null, options);
        }
    });

    // export
    root.controller || (root.controller = {});
    root.controller.ClipletController = ClipletController;

}(this, host, Backbone, _));
