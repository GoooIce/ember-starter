/*global module:false*/
var path           = require('path');
var escapeChar     = process.platform.match(/^win/) ? '^' : '\\';
var cwd            = process.cwd().replace(/( |\(|\))/g, escapeChar + '$1');

module.exports = function (grunt, starter) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    // ### grunt-shell
    // Command line tools where it's easier to run a command directly than configure a grunt plugin
    shell: {
      // #### Run bower install
      // Used as part of `grunt init`. See the section on [Building Assets](#building%20assets) for more
      // information.
      bower: {
        command: path.resolve(cwd + '/node_modules/.bin/bower --allow-root install'),
        options: {
          stdout: true
        }
      }
    },
    // ### grunt-contrib-copy
    // Copy files into their correct locations as part of building assets, or creating release zips
    copy: {
      main:{
        files: [{
          cwd: 'bower_components/bootstrap/dist/',
          src: ['**'],
          dest: 'ember-starter/',
          expand: true
        }, {
          cwd: 'bower_components/ember/',
          src: 'ember.js',
          dest: 'ember-starter/js/',
          expand: true
        }, {
          cwd: 'bower_components/ember-data/',
          src: 'ember-data.js',
          dest: 'ember-starter/js/',
          expand: true
        }, {
          cwd: 'bower_components/handlebars/',
          src: 'handlebars.js',
          dest: 'ember-starter/js/',
          expand: true
        }, {
          cwd: 'bower_components/jquery/dist/',
          src: 'jquery.js',
          dest: 'ember-starter/js/',
          expand: true
        }, {
          cwd: 'bower_components/moment/min/',
          src: 'moment-with-langs.min.js',
          dest: 'ember-starter/js/',
          expand: true
        }]
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-shell');

  // Default task.
  grunt.registerTask('default','Prepare the project for development', ['shell:bower','copy']);
};
