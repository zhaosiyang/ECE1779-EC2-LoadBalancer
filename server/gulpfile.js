var gulp = require('gulp');
var runSequence = require('run-sequence');
var shell = require('gulp-shell');

gulp.task('start:client:dev', shell.task([
  'npm run dev'
], {cwd: '../client'}));

gulp.task('start:server:dev', shell.task([
  'npm run dev'
]));

gulp.task('start:client:prod', shell.task([
  'npm run start'
], {cwd: '../client'}));

gulp.task('start:server:prod', shell.task([
  'npm run start'
]));

gulp.task('dev', function (cb) {
  runSequence(['start:client:dev', 'start:server:dev'], cb);
});

gulp.task('prod', function (cb) {
  runSequence(['start:client:prod', 'start:server:prod'], cb);
});
