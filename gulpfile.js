var gulp = require('gulp'),
    gulpif = require('gulp-if'),
    argv = require('yargs').argv,
    rename = require('gulp-rename'),
    replace = require('gulp-replace'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    less = require('gulp-less'),
    minifyCSS = require('gulp-minify-css'),
    minifyHTML = require('gulp-minify-html'),
    fileInclude = require('gulp-file-include'),
    sourcemaps = require('gulp-sourcemaps'),
    csslint = require('gulp-csslint'),
    lessReporter = require('gulp-csslint-less-reporter'),
    jshint = require('gulp-jshint'),
    del = require('del'),
    crypto = require('crypto'),
    outputFolder = 'public',
    currentTS = '',
    isProductionBuild = !!argv.prod;
	
function hash(str, postfix) {
    postfix = postfix || '';
    return crypto.createHash('md5').update(str + postfix).digest('hex');
}

var paths = {

    scriptsGlobal: [
        './node_modules/routerjs/src/router.js',
        './node_modules/jquery/dist/jquery.js'
    ],
    
    scriptsApp : [
        './config.js',
        './src/scripts/radio/index.js',
        './src/scripts/radio/router.js',
        './src/scripts/radio/nowplaying.js'
    ],
    
    styles : [
        './node_modules/normalize.css/normalize.css',
        './node_modules/font-awesome/css/font-awesome.css',
        './src/styles/radio/fonts.css',
        './src/styles/radio/basic.less',
        './src/styles/radio/left.less',
        './src/styles/radio/right.less'
    ],
    
    html : [
        './src/html/index.html'
    ],
  
    htmlPartials : [
        './src/html/partials/*.html'
    ],
    
    icons : [
        './src/icons/*'   
    ],
    
    fonts : [
        './node_modules/font-awesome/fonts/*',
        './src/fonts/*' 
    ]
    
};

gulp.task('clean-all', function() {
    return del.sync([
        './' + outputFolder + '/files/fonts',
        './' + outputFolder + '/files/icons',
        './' + outputFolder + '/files/scripts',
        './' + outputFolder + '/files/styles',
        './' + outputFolder + '/index.html'
    ]);	
});

gulp.task('set-currentTS', function() {
    return currentTS = '' + new Date().valueOf();
});

gulp.task('lint-scripts', function() { 
    return gulp.src(paths.scriptsApp)
		.pipe(jshint())
		.pipe(jshint.reporter('default', { verbose: true }));
});

gulp.task('gen-scripts', function() { 
    return gulp.src(paths.scriptsGlobal.concat(paths.scriptsApp))
       .pipe(gulpif(!isProductionBuild, sourcemaps.init()))
       .pipe(concat(hash(currentTS, 'js') + '.js'))
       .pipe(gulpif(isProductionBuild, uglify()))
       .on('error', function(err) {
          console.error("\n==================\n" + 'UglifyJS Error: ', err.message + "\n==================\n");
          this.emit('end');
       })
       .pipe(gulpif(!isProductionBuild, sourcemaps.write('.')))
       .pipe(replace('var radio={};', 'var radio={};radio.releaseDate=\'' + new Date() + '\';'))
       .pipe(gulp.dest('./' + outputFolder + '/files/scripts'));
});

gulp.task('lint-styles', function() {
    return gulp.src(['./src/styles/radio/*'])
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(csslint())
        .pipe(lessReporter());
});

gulp.task('gen-styles', function() {
    return gulp.src(paths.styles)
        .pipe(concat(hash(currentTS, 'css') + '.css'))
        .pipe(less())
        .pipe(gulpif(isProductionBuild, minifyCSS({keepSpecialComments:0})))
        .pipe(gulp.dest('./' + outputFolder + '/files/styles'));
});

gulp.task('copy-icons', function() {
    return gulp.src(paths.icons)
        .pipe(rename('icons/' + hash(currentTS, 'ico') + '.ico'))
        .pipe(gulp.dest('./' + outputFolder + '/files'));
});

gulp.task('copy-fonts', function() {
    return gulp.src(paths.fonts)
        .pipe(gulp.dest('./' + outputFolder + '/files/fonts'));
});

gulp.task('gen-index-html', function() {
    return gulp.src(paths.html)
        .pipe(fileInclude())
        .pipe(gulpif(isProductionBuild, minifyHTML({empty:true, spare:true, quotes:true})))
        .pipe(replace(/<head>/, '<head><link rel="stylesheet" type="text/css" href="./files/styles/' + hash(currentTS, 'css') + '.css" /><script type="text/javascript" src="./files/scripts/' + hash(currentTS, 'js') + '.js"></script><link rel="shortcut icon" href="./files/icons/' + hash(currentTS, 'ico') + '.ico" />'))
        .pipe(gulp.dest('./' + outputFolder));
});

gulp.task('all', ['clean-all', 'set-currentTS', 'lint-scripts',  'gen-scripts', 'lint-styles', 'gen-styles', 'copy-icons', 'copy-fonts', 'gen-index-html'], function() {
	return true;
});

gulp.task('watch', function() {
	gulp.watch((paths.scriptsGlobal).concat(paths.scriptsApp, paths.html, paths.htmlPartials, paths.styles, paths.fonts, paths.icons), ['all']);
});

gulp.task('default', ['all']);
