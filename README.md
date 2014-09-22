Support MIDI map clip launching and scripting in Bitwig Studio.
This script based on [bitwig/generic-keyboard](https://github.com/bitwig/generic-keyboard).

### Dependencies
This controller script includes:
  - [Underscore.js](https://github.com/jashkenas/underscore)
  - [Backbone.js](https://github.com/jashkenas/backbone)
  - [Bitbone](https://github.com/jhorology/bitbone)

### Build

```
  npm install
  grunt
```

### Install
- [Generic MIDI Keyboard with Cliplet.control.js](Generic MIDI Keyboard with Cliplet.control.js)
<br/>or
- [Generic MIDI Keyboard with Cliplet.control.mini.js](Generic MIDI Keyboard with Cliplet.control.js) (minified script)

put into

OS| Location
:---|:---|:---|
Windows|%USERPROFILE%\Documents\Bitwig Studio\Controller Scripts\Generic
Mac| ~/Documents/Bitwig Studio/Controller Scripts/Generic

### Cliplet
Cliplet is tiny javascript code stored in clip launcher or scene slot.
```
  var cliplet = {
      name:'MyClip',
      ch:1,
      note:64,
      que:function($) {
        $.msg('Hello world!');
      }
  }
```
flatten single line string put into clip or scene slot name in inspector panel. like this:
```
name:'MyClip', ch:1, note:64, que:function($){$.mesg('Hello world!');}
```


### Cliplet Properties
All properties are optional. Function is not supported in scene slot.

property|type|description
:---|:---|:---|:---|
name| string | If you want to access clip by name, must be specified.
ch| Number 1 - 16 | MIDI channel to launch clip. If not specified, launch on all channel.
note| Number 0- 127 | MIDI note# to launch clip.
cc| Number 0- 127 | MIDI CC# to launch clip. if specified cc and note, launch on both.
que| function | called just after the clip is queued (launched).
ply| function | called just after the clip start playing.
stp| function | called just after the clip stop playing.
rec| function | called just after the clip start recording.
sel| function | called just after the clip is selected.

### Limitation

- 32 main tracks
- 2 effect tracks
- 1 master track
- 32 scenes

#### Scripting
Scripting is independent from MIDI devices. If you want to use this function with other controller, at least one unused MIDI-in port is needed.


### Function
The all function has two arguments context and track.

context
```
que:function($) {
  $.trk('Master').clp(2).launch();
}
```
same meaning this:
```
que:function() {
  this.trk('Master').clp(2).launch();
}
```

if this clip exist on Track 2.
```
que:function($,t) {
  t.clp(2).launch();
}
```
same meaning this:
```
que:function($) {
  $.trk(2).clp(2).launch();
}
```

###Accessor Methods
Various accessor methods can be used to access controller API.

method|abbrev|description
:---|:---|:---|:---|
`application()`|`app()`| return instance of [Application](https://github.com/jhorology/bitbone/blob/master/src/application.js) class
`arranger()`|`arr()`| return instance of [Arranger](https://github.com/jhorology/bitbone/blob/master/src/arranger.js) class
`clip(tid, cid)`|`clp(tid, cid)`|return instance of [ClipLauncherSlot](https://github.com/jhorology/bitbone/blob/master/src/clip-launcher-slots.js) class<br/>tid:track-id and cid:clip-id specify index number or name.
`cursorDevice()`|`cdv()`|return instance of [CursorDevice](https://github.com/jhorology/bitbone/blob/master/src/cursor-device.js) class
`groove()`|`grv()`|return instance of [Groove](https://github.com/jhorology/bitbone/blob/master/src/groove.js) class
`scend(id)`|`scn(id)`|return instance of [ClipLauncherSceneOrSlot](https://github.com/jhorology/bitbone/blob/master/src/clip-launcher-scenes-or-slots.js) class<br/>id specify index number or name.
`transport()`|`trp()`|return instance of [Transport](https://github.com/jhorology/bitbone/blob/master/src/transport.js) class
`track(id)`|`trk(id)`|return instance of [Track](https://github.com/jhorology/bitbone/blob/master/src/track.js) class<br/>id speciy index number or name.
`[track].clip(id)`|`[track].clp(id)`|return instance of [ClipLauncherSlot](https://github.com/jhorology/bitbone/blob/master/src/clip-launcher-slots.js) class<br/>id specify index number or name.
`[track].primaryDevice()`|`[track].pdv(id)`|return instance of [PrimaryDevice](https://github.com/jhorology/bitbone/blob/master/src/primary-device.js) class
