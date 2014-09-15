module.exports = function (grunt) {
    'use strict';
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            files: [
                'src/**/*.js',
                'package.json',
                '.jshintrc'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        concat: {
            files: {
                src: [
                    'node_modules/bitbone/node_modules/underscore/underscore.js',
                    'node_modules/bitbone/node_modules/backbone/backbone.js',
                    'node_modules/bitbone/bitbone.js',
                    'src/model.js',
                    'src/controller.js',
                    'src/main.js'
                ],
                dest: 'Generic MIDI Keyboard with Cliplet.control.js'
            }
        },
        uglify: {
            dist: {
                files: {
                    'Generic MIDI Keyboard with Cliplet-mini.control.js':
                    'Generic MIDI Keyboard with Cliplet.control.js'
                }
            }
        },
        copy: {
            test: {
                src: '<%= pkg.name %>.js',
                dest: '~/Documents/Bitwig Studio/Controller Script/Debug/'
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
    grunt.registerTask('integration-test', ['copy']);
};
