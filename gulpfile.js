var less = require("gulp-less");
var gulp = require("gulp");
var path = require("path");
var child = require('child_process');

var livereload = require("gulp-livereload");

var compileLess = ()=>{
    return gulp
    .src("./assets/less/src/*.less")
    .pipe(
      less({
        paths: [path.join(__dirname, "./assets/less/src/", "includes")]
      })
    )
    .pipe(gulp.dest("./assets/less/dist/"))
    .pipe(livereload());

};


gulp.task("less",  compileLess);

gulp.task("default",() => {


    livereload.listen();

  gulp.watch(["./assets/less/src/**/*.less"], compileLess);
 

  compileLess();

  child.spawn("node", ["node_modules/serendip-web/bin/server.js","--tunnel","--tunnel-subdomain=serendip-agency"], {
    stdio: "inherit"
  });


});
