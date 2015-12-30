var del = require('del')
var path = require('path')
var gulp = require('gulp')
var plumber = require('gulp-plumber')
var compass = require('gulp-compass')
var cssnano = require('gulp-cssnano')
var concat = require('gulp-concat')
var webserver = require('gulp-webserver')
var run_sequence = require('run-sequence')

var paths = {
    src: 'src',
    build: 'build',
    html: '',
    css: 'stylesheets',
    js: 'javascripts'
}

var src = {
    root: paths.src,
    html: path.join(paths.src, paths.html),
    css: path.join(paths.src, paths.css),
    js: path.join(paths.src, paths.js),
}

var build = {
    root: paths.build,
    html: path.join(paths.build, paths.html),
    css: path.join(paths.build, paths.css),
    js: path.join(paths.build, paths.js),
}

var server = {
    host: 'localhost',
    port: '8080'
}

gulp.task('build', function(callback) {
    run_sequence(
        'clean', ['html', 'compass', 'js', 'bower'],
        callback
    )
})

gulp.task('bower', function() {
    var bower_files = [
        'bower_components/jquery/dist/jquery.min.js'
    ]
    return gulp.src(bower_files)
        .pipe(concat('bower.js'))
        .pipe(gulp.dest(build.js))
})

gulp.task('clean', function() {
    return del(build.root).then(paths => {
        console.log('Deleted files and folders:\n', paths.join('\n'))
    })
})

gulp.task('compass', function() {
    return gulp.src([path.join(src.css, '**/*.scss'), '!' + path.join(src.css, '**/_*.scss')])
        .pipe(plumber())
        .pipe(compass({
            css: build.css,
            sass: src.css,
            comments: false,
            bundle_exec: true
        }))
        .pipe(cssnano())
        .pipe(gulp.dest(build.css))
})

gulp.task('html', function() {
    return gulp.src(path.join(src.html, '**/*.html'))
        .pipe(gulp.dest(build.html));
});

gulp.task('js', function() {
    return gulp.src(path.join(src.js, '**/*.js'))
        .pipe(concat('all.js'))
        .pipe(gulp.dest(build.js))
})

gulp.task('start', function(callback) {
    run_sequence(
        'build',
        'webserver',
        'watch',
        callback
    )
})

gulp.task('watch', function() {
    gulp.watch(path.join(src.html, '**/*.html'), ['html'])
    gulp.watch(path.join(src.css, '**/*.scss'), ['compass'])
    gulp.watch(path.join(src.js, '**/*.js'), ['js'])
})

gulp.task('webserver', function() {
    gulp.src(build.root)
        .pipe(webserver({
            host: server.host,
            port: server.port,
            livereload: true
        }))
})
