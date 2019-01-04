var less = require("gulp-less");
var gulp = require("gulp");
var path = require("path");
var child = require("child_process");
var fs = require("fs");

var livereload = require("gulp-livereload");

var xml2js = require("xml2js");
var xmlParseString = xml2js.parseString;
var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = new JSDOM("").window;
global.document = document;

var $ = (jQuery = require("jquery")(window));

var createSvgIconSetPartial = async () => {
  var svgDirPath = path.join(__dirname, "assets", "svg");
  var partialPath = path.join(__dirname, "_partials", "svg-icons.hbs");

  fs.writeFileSync(
    partialPath,
    `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">`
  );

  var builder = new xml2js.Builder({
    rootName: "symbol"
  });

  var svgs = fs.readdirSync(svgDirPath);

  await Promise.all(
    svgs.map(fileName => {
      return new Promise((resolve, reject) => {
        if (!fileName.endsWith(".svg")) return resolve();

        var svgContent = fs
          .readFileSync(path.join(svgDirPath, fileName))
          .toString();

        var originalSvg = $($.parseXML(svgContent)).find("svg");

        var svgId = `svg-${fileName.replace(".svg", "")}`;

        xmlParseString(svgContent, (err, xml) => {
          var resXml = builder.buildObject(xml.svg);
          var lines = resXml.split("\n");
          lines.shift();
          lines.shift();
          lines.unshift(
            `<symbol id="${svgId}" viewBox="${originalSvg.attr("viewBox")}">`
          );
          resXml = lines.join("\n");
          console.log(resXml);

          fs.appendFileSync(partialPath, resXml);

          resolve();
        });
      });
    })
  );

  fs.appendFileSync(partialPath, `</svg>`);
};

var compileLess = () => {
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

gulp.task("less", compileLess);

gulp.task("default", () => {
  livereload.listen();

  gulp.watch(["./assets/less/src/**/*.less"], compileLess);

  compileLess();

  child.spawn(
    "node",
    [
      "node_modules/serendip-web/bin/server.js",
      "--tunnel",
      "--tunnel-subdomain=serendip-agency"
    ],
    {
      stdio: "inherit"
    }
  );
});
