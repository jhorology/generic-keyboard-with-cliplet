(function(root, Bitwig, Backbone, _) {
    'use strict';

    // import
    var ClipLauncherSlot = root.bitbone.ClipLauncherSlot,
        ClipLauncherSlots = root.bitbone.ClipLauncherSlots,
        UserControlBank = root.bitbone.UserControlBank;

    // Clip
    // -------------
    //
    var Clip =  ClipLauncherSlot.extend({
        initialize: function(attributes, options, api) {
            this.initClip(attributes, options, api);
            this.api = api;
            this.initialized = true;
        },

        initClip: function(attributes, options, api) {
            this.initClipLauncherSlot(attributes, options, api);
            this.on('change:name', function(model, value, options) {
                var o, f = false;
                try {
                    o = eval('({' + value + '})');
                    f =  _.isObject(o);
                } catch (e) {}
                this.cc = (f && _.isNumber(o.cc)) ? o.cc : undefined;
                this.note  = (f && _.isNumber(o.note)) ? o.note : undefined;
                this.ch = (f && _.isNumber(o.ch)) ? o.ch : undefined;
                this.ply = (f && _.isFunction(o.ply)) ? o.ply : undefined;
                this.stp = (f && _.isFunction(o.stp)) ? o.stp : undefined;
                this.que = (f && _.isFunction(o.que)) ? o.que : undefined;
                this.sel = (f && _.isFunction(o.sel)) ? o.sel : undefined;
            });
        },

        triggerableOnMidi: function() {
            return this.cc || this.note;
        },

        scriptable: function() {
            return this.ply || this.stp || this.que || this.sel;
        }
    });


    // ClipSlots
    // -------------
    //
    var ClipSlots =  ClipLauncherSlots.extend({
        idAttribute: 'track',
        model: Clip,
        initialize: function(models, options, api) {
            this.initClipSlots(models, options, api);
            this.api = api;
            this.initialized = true;
        },

        initClipSlots: function(models, options, api) {
            var context = this;
            // use oneBased slot id index
            options.oneBased = true;
            this.initClipLauncherSlots(models, options, api);
        }
    }, {

        // factory method
        create: function(api, options) {
            return new ClipSlots(undefined, options, api);
        }

    });

    // Tracks
    // -------------
    // Collection of ClipSlots
    var Tracks = Backbone.Collection.extend({
    });


    // Tracks
    // -------------
    // Collection of Clip
    var Clips = Backbone.Collection.extend({
        model: Clip
    });

    // export
    root.model || (root.model = {});
    root.model.Clip = Clip;
    root.model.ClipSlots = ClipSlots;
    root.model.Tracks = Tracks;
    root.model.Clips = Clips;

}(this, host, Backbone, _));
