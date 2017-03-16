var gulp = require('gulp');
var runSequence = require('run-sequence');
var shell = require('gulp-shell');
var path = require('path');

gulp.task('start:client:dev', shell.task([
  'npm run dev'
], {cwd: path.join(__dirname, '..', 'client')}));

gulp.task('start:server:dev', shell.task([
  'npm run dev'
]));

gulp.task('build:client:prod', shell.task([
  'pwd && ng build -prod -op ' + path.join(__dirname, 'dist_client')
], {cwd: path.join(__dirname, '..', 'client')}));

gulp.task('start:server:prod', shell.task([
  'npm run start'
]));

gulp.task('dev', function (cb) {
  runSequence(['start:client:dev', 'start:server:dev'], cb);
});

gulp.task('prod', function (cb) {
  runSequence([
    'start:server:prod'
  ], cb);
});
