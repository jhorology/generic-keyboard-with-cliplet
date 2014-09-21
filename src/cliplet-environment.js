(function(root, Bitwig, Backbone, _) {
    'use strict';

    var ClipletEnvironment = Backbone.Model.extend({

        trk: function(arg) {
            var trk;
            if (_.isString(arg)) {
                trk = this._trb.get('tracks').find({name: arg});
            } else if (_.isNumber(arg)) {
                // -1 for natural number index
                trk = this.trb.get('tracks').at(arg - 1);
            }
            return trk;
        },

        msg: function(text) {
            Bitwig.showPopupNotification(text);
        }



    },{

    });

    // export
    root.controller || (root.controller = {});
    root.controller.ClipletEnvironment = ClipletEnvironment;

}(this, host, Backbone, _));
