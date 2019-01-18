var less = require("gulp-less");
var gulp = require("gulp");
var path = require("path");
var child = require("child_process");
var fs = require("fs");
var glob = require("glob");
var postcss = require("gulp-postcss");

var livereload = require("gulp-livereload");
var autoprefixer = require("autoprefixer");
var cssnano = require("cssnano");

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
  var lessPath = path.join(
    __dirname,
    "assets",
    "less",
    "src",
    "layout",
    "svgs.less"
  );

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
          .replace(/\\/g, "/")
          .replace(svgDirPath.replace(/\\/g, "/"), "")
          .replace(/\//g, "-")
          .replace(".svg", "");

          var relativeFilePath = filePath
          .replace(/\\/g, "/")
          .replace(svgDirPath.replace(/\\/g, "/"), "");

          console.log(relativeFilePath);

        

        if (svgPosix.startsWith("-")) svgPosix = svgPosix.substr(1);

        var svgId = `svg-${svgPosix}`;

        var style = $($.parseXML(svgContent))
          .find("style")
          .text();

        lessToWrite += `#${svgId}{ ${style} }`;

        xmlParseString(svgContent, (err, xml) => {
          delete xml.svg.defs;

          if (xml.svg.g && xml.svg.g[0] && xml.svg.g[0].metadata)
            delete xml.svg.g[0].metadata;

          xml.svg.$ = {};
          xml.svg.$.id = svgId;
          xml.svg.$.viewBox = originalSvg.attr("viewBox");
          if (originalSvg.attr("style"))
            xml.svg.$.style = originalSvg.attr("style");

          var resXml = builder.buildObject(xml.svg);
          var lines = resXml.split("\n");
          lines.shift();
          //   lines.shift();
          // lines.unshift(
          //   `<svg id="${svgId}" viewBox="${originalSvg.attr("viewBox")}">`
          // );
          resXml = lines.join("\n");

          fs.writeFileSync(
            path.join(partialsPath, svgId.replace("svg-", "") + ".hbs"),
          //  resXml
          `<img src="/assets/svg${relativeFilePath}" />`
          );

          console.log("bundling svg as hbs: " + svgId);

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
        // paths: [path.join(__dirname, "./assets/less/src/", "includes")]
      })
    )
    .pipe(gulp.dest("./assets/less/dist/"))
    .pipe(livereload());
};
var minifyCss = function() {
  var plugins = [autoprefixer({ browsers: ["last 1 version"] }), cssnano()];

  return gulp
    .src("./assets/less/dist/bundle.css")
    .pipe(postcss(plugins))
    .pipe(gulp.dest("./assets/less/dist"));
};

gulp.task("postcss", minifyCss);

gulp.task("less", compileLess);


gulp.task("default", async () => {
  livereload.listen();

  gulp.watch(["./assets/less/src/**/*.less"], gulp.series("less", "postcss"));

  await createSvgIconSetPartial();
  compileLess();
  minifyCss();

  child.spawn(
    "node",
    [
      "node_modules/serendip-web/bin/server.js"
      // "--tunnel",
      // "--tunnel-subdomain=serendip-agency"
    ],
    {
      stdio: "inherit"
    }
  );
});
