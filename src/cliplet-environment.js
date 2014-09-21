(function(root, Bitwig, Backbone, _) {
    'use strict';

    var ClipletEnvironment = Backbone.Model.extend({

        // accessor
        // -------------

        applictaion: function() {
            return this.get('application');
        },

        arranger: function() {
            return this.get('arranger');
        },

        transport: function() {
            return this.get('transport');
        },

        groove: function() {
            return this.get('groove');
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
            if (slots) {
                clip = _slot(slots, clipId);
            }
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

        trp: function() {
            return this.transport();
        },

        grv: function() {
            return this.groove();
        },

        trk: function(id) {
            return this.track(id);
        },

        scn: function(id) {
            return this.scene(id);
        },

        clp: function(trkId, clpId) {
            return this.clip(trkId, clpId);
        },

        // Utilities
        // -------------

        msg: function(text) {
            Bitwig.showPopupNotification(text);
        }

    },{

    });


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
