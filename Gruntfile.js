/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    meta: {
      version: '0.2.0'
    },
    banner: '/*! pio.ko.mapping - v<%= meta.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '* http://PROJECT_WEBSITE/\n' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
      'Micah Smith; Licensed MIT */\n',
    // Task configuration.,
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: 'src/*.js',
        dest: 'dist/pio.ko.util.mapping.min-<%= meta.version %>.js'
      }
    },

    jasmine: {
    pivotal: {
        src: 'src/**/*.js',
        options: {
          specs: 'spec/*_tests.js',
          helpers: 'spec/*Helper.js'
        }
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib_test: {
        files: '<%= jshint.lib_test.src %>',
        tasks: ['jshint:lib_test', 'nodeunit']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  //grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  // Default task.
  grunt.registerTask('default', ['jasmine:pivotal:build' ,  'uglify']);

};
