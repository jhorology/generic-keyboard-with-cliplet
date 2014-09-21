(function(root, Bitwig, Backbone, _) {
    'use strict';

    // import classes
    var Application = root.bitbone.Application,
        Arranger = root.bitbone.Arranger,
        CursorDevice = root.bitbone.CursorDevice,
        Groove = root.bitbone.Groove,
        Mixer = root.bitbone.Groove,
        Track = root.bitbone.Track,
        TrackBank = root.bitbone.TrackBank,
        Transport = root.bitbone.Transport;


    var ClipletEnvironment = Backbone.Model.extend({
        initialize: function(attributes, options) {
            // options defaults
            options || (options = {});
            _.defaults(options, {
                numTracks: 32,
                numScenes: 32,
                numEffectTracks: 2
            });
            this.initClipletEnvironment(attributes, options);
        },

        initClipletEnvironment: function(attributes, options) {
            attributes.application || this.set('application', Application.create());
            attributes.arranger || this.set('arranger', Arranger.create());
            attributes.cursorDevice || this.set('cursorDevice',CursorDevice.create());
            attributes.groove || this.set('groove', Groove.create());
            attributes.mixer || this.set('mixer', Mixer.create());
            attributes.trackBank || this.set('trackBank', TrackBank.createMain({
                numTracks: options.numTracks,
                numScenes: options.numScenes
            }));
            attributes.effectTrackBank || this.set('effectTrackBank', TrackBank.createEffect({
                numTracks: options.numEffectTracks,
                numScenes: options.numScenes
            }));
            attributes.masterTrack || this.set('masterTrack', Track.createMaster({
                numScenes: options.numScenes
            }));
            attributes.transport || this.set('transport',Transport.create());
        },

        // accessor
        // -------------

        applictaion: function() {
            return this.get('application');
        },

        arranger: function() {
            return this.get('arranger');
        },

        cursorDevice: function() {
            return this.get('cursorDevice');
        },

        transport: function() {
            return this.get('transport');
        },

        groove: function() {
            return this.get('groove');
        },

        mixer: function() {
            return this.get('mixer');
        },

        track: function(id) {
            var  trk = _track(this.get('trackBank').get('tracks'), id);

            trk || (trk = _track(this.get('effectTrackBank').get('tracks'), id));

            if (!trk && _.isString(id)) {
                var masterTrack =  this.get('masterTrack');
                masterTrack.get('name') === id && (trk = masterTrack);
            } 
            return trk;
        },

        scene: function(id) {
            var  slots = this.get('trackBank').get('clipLauncherScenes'),
                scene;
            return _slot(slots, id);
        },

        clip: function(trkId, clipId) {
            var track = this.track(trkId),
                slots = track ? track.get('clipLauncherSlots') : undefined,
                clip;
            slots && (clip = _slot(slots, clipId));
            return clip;
        },

        // abbreviated accessor
        // -------------

        app: function() {
            return this.application();
        },

        arr: function() {
            return this.arranger();
        },

        clp: function(trkId, clpId) {
            return this.clip(trkId, clpId);
        },

        cdv: function() {
            return this.cursorDevice();
        },

        grv: function() {
            return this.groove();
        },

        scn: function(id) {
            return this.scene(id);
        },

        mxr: function() {
            return this.mixer();
        },

        trp: function() {
            return this.transport();
        },

        trk: function(id) {
            return this.track(id);
        },

        // Utilities
        // -------------

        msg: function(text) {
            Bitwig.showPopupNotification(text);
        }

    },{
        create: function(attributes, options) {
            return new ClipletEnvironment(attributes, options);
        }
    });


    // prototyp
    // -------------
    Track.prototype.clip = function(id) {
        return _slot(this.get('clipLauncherSlots'), id);
    };

    Track.prototype.primaryDevice = function() {
        return this.get('primaryDevice');
    };


    // abbreviated prototyp
    // -------------
    Track.prototype.clp = function(id) {
        return this.clip(id);
    };

    Track.prototype.pdv = function() {
        return this.primaryDevice();
    };

    // internal
    // -------------

    function _track(tracks, id) {
        var trk;
        if (_.isString(id)) {
            trk = tracks.findWhere({name: id});
        } else if (_.isNumber(id) && id > 0 && id <= tracks.size()) {
            // -1 for natural number index
            trk = tracks.at(id - 1);
        }
        return trk;
    }

    function _slot(slots, id) {
        var slot;
        if (_.isString(id)) {
            slot = slots.find(function(slot) {
                return this._compareName(slot, id);
            });
        } else if (_.isNumber(id) && id > 0 && id <= slots.size()) {
            // -1 for natural number index
            slot = slots.get(id - 1);
        }
        return slot;
    }

    function _compareName(slot, name) {
        if (slot.get('name') === 'name') {
            return true;
        }
        return _.isObject(slot.cliplet) && _.isString(slot.cliplet.name) && slot.cliplet.name === name;
    }

    // export
    root.controller || (root.controller = {});
    root.controller.ClipletEnvironment = ClipletEnvironment;

}(this, host, Backbone, _));
