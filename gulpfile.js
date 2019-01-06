var less = require("gulp-less");
var gulp = require("gulp");
var path = require("path");
var child = require("child_process");
var fs = require("fs");
var glob = require("glob");

var livereload = require("gulp-livereload");

var xml2js = require("xml2js");
var xmlParseString = xml2js.parseString;
var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = new JSDOM("").window;
global.document = document;

var $ = (jQuery = require("jquery")(window));

var readDirWithGlob = pathPattern => {
  return new Promise((resolve, reject) => {
    glob(path.join(pathPattern), (err, matches) => resolve(matches));
  });
};
var createSvgIconSetPartial = async () => {
  var svgDirPath = path.join(__dirname, "assets", "svg");
  var partialsPath = path.join(__dirname, "_partials", "svg");
  var lessPath = path.join(__dirname, "assets", "less", "src", "svgs.less");

  var builder = new xml2js.Builder({
    rootName: "svg"
  });

  var svgs = await readDirWithGlob(path.join(svgDirPath, "**/*.svg"));
  var lessToWrite = "";

  await Promise.all(
    svgs.map(filePath => {
      return new Promise((resolve, reject) => {
        var svgContent = fs.readFileSync(filePath).toString();

        var originalSvg = $($.parseXML(svgContent)).find("svg");

        var svgPosix = filePath
          .replace(svgDirPath, "")
          .substr(1)
          .replace("/", "-")
          .replace(".svg", "");
        var svgId = `svg-${svgPosix}`;

        var style = $($.parseXML(svgContent))
          .find("style")
          .text();

        lessToWrite += `#${svgId}{ ${style} }`;
        //    console.log(style.text());

        xmlParseString(svgContent, (err, xml) => {
          delete xml.svg.defs;

          if (xml.svg.g && xml.svg.g[0] && xml.svg.g[0].g)
            xml.svg.g = xml.svg.g[0].g;

          var resXml = builder.buildObject(xml.svg);
          var lines = resXml.split("\n");
          lines.shift();
          lines.shift();
          lines.unshift(
            `<svg id="${svgId}" viewBox="${originalSvg.attr("viewBox")}">`
          );
          resXml = lines.join("\n");

          fs.writeFileSync(
            path.join(partialsPath, svgId.replace("svg-", "") + ".hbs"),
            resXml
          );

          resolve();
        });
      });
    })
  );

  fs.writeFileSync(lessPath, lessToWrite);
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

  createSvgIconSetPartial();
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
