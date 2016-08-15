(function(){
    'use strict';

	var gulp 		= require('gulp'),
		browserSync = require("browser-sync"),
		concat 		= require('gulp-concat'),
		uglify 		= require('gulp-uglifyjs'),
		rename 		= require('gulp-rename'),
		del 		= require('del'),
		cssnano		= require('gulp-cssnano'),
		jshint 		= require('gulp-jshint'),
		stylish 	= require('jshint-stylish'),
		paths 		= {
	            		root: './',
			            demo: {
			            	root: 'demo/',
			            	html: 'demo/**/*'
			            },
			            dist: {
			                root: 		'dist/',
			                styles: 	'dist/css/',
			                scripts: 	'dist/js/',
			                lang: 		'dist/js/lang/',
			                libsJS: 	'dist/libs/',
			            },
			            source: {
			                root: 		'src/',
			                styles: 	'src/css/*.css',
			                scripts: 	'src/js/*.js',
			                lang: 		'src/js/lang/*.js',
			                libsJS: 	"src/libs/*.js"
		            	},
       			 	},
       	v 			= {
       					filename: 'jquery.citrusValidator',
       					jsFiles: [
       						'src/js/wrap_start.js',
       						'src/js/obMessages.js',
       						'src/js/obRules.js',
       						'src/js/obEvents.js',
       						'src/js/prototype.js',
       						'src/js/citrusValidator.js',
       						'src/js/wrap_end.js',
       					]
       				},
       	libs		= {
       					jsFiles: [
       						"src/libs/*.js"
       					]
       				};


    gulp.task("checkJS", function () {
		return 	gulp.src(paths.source.scripts)
				.pipe(jshint())
				.pipe(jshint.reporter(stylish))
	});
	gulp.task("bildLang", function () {
		return  gulp.src(paths.source.lang)
					.pipe(gulp.dest(paths.dist.lang));
	});
	gulp.task("bildLibs", function () {
		return  gulp.src(paths.source.libsJS)
					.pipe(gulp.dest(paths.dist.libsJS));
	});
	gulp.task("bildJS", function () {
 		return 	gulp.src(v.jsFiles)
		 			.pipe(concat(v.filename+'.js'))
		 			.pipe(gulp.dest(paths.dist.scripts))

					.pipe(uglify())
					.pipe(rename({suffix: '.min'}))
					.pipe(gulp.dest(paths.dist.scripts));
	});

	gulp.task("bildCSS", function () {
		return  gulp.src(paths.source.styles)
					.pipe(gulp.dest(paths.dist.styles))

				   	.pipe(cssnano())
				   	.pipe(rename({suffix: '.min'}))
				   	.pipe(gulp.dest(paths.dist.styles));
	});


	gulp.task("bild", ['bildLang', 'bildLibs', 'bildJS', 'bildCSS'], function  () {
		return true;
	});
	gulp.task("browser-sync", function () {
		browserSync({
			server: {
				baseDir: paths.root
			},
			notify: false
		});
	});

	gulp.task('dev', ['browser-sync', 'bild'], function () {
		gulp.watch(paths.source.scripts, ['bildJS']);
		gulp.watch(paths.source.lang, ['bildLang']);
		gulp.watch(paths.source.styles, ['bildCSS']);
		gulp.watch(paths.source.libsJS, ['bildLibs']);

		gulp.watch(paths.source.scripts, browserSync.reload);
		gulp.watch(paths.source.libsJS, browserSync.reload);
		gulp.watch(paths.source.styles, browserSync.reload);
		gulp.watch(paths.root+"index.html", browserSync.reload);
	});

})();