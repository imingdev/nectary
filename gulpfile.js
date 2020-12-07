const path = require('path');
const glob = require('glob');
const gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('default', gulp.series(glob.sync('packages/*').map(dirname => () => gulp
  .src(path.resolve(dirname, 'src/**/*.{js,jsx}'))
  .pipe(babel({
    presets: ['@babel/preset-env', '@babel/preset-react'],
    plugins: ['@babel/plugin-transform-runtime']
  }))
  .pipe(gulp.dest(path.resolve(dirname, 'dist')))
)));
