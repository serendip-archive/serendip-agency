const less = require("gulp-less");
const gulp = require("gulp");
const path = require("path");
const child = require("child_process");
const fs = require("fs");
const glob = require("glob");
const postcss = require("gulp-postcss");
const livereload = require("gulp-livereload");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const xml2js = require("xml2js");
const xmlParseString = xml2js.parseString;
const jsdom = require("jsdom");
const cheerio = require("cheerio");

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
  console.log('createSvgIconSetPartial ...');
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
        // var svgContent = fs.readFileSync(filePath).toString();

        // var originalSvg = $($.parseXML(svgContent)).find("svg");

        var svgPosix = filePath
          .replace(/\\/g, "/")
          .replace(svgDirPath.replace(/\\/g, "/"), "")
          .replace(/\//g, "-")
          .replace(".svg", "");

        var relativeFilePath = filePath
          .replace(/\\/g, "/")
          .replace(svgDirPath.replace(/\\/g, "/"), "");

        if (svgPosix.startsWith("-")) svgPosix = svgPosix.substr(1);

        var svgId = `svg-${svgPosix}`;

        // ///////////////////

        // var $svg = cheerio("svg", svgContent);

        // $svg.attr("id", svgId);
        // $svg.removeAttr("xmlns");
        // $svg.removeAttr("xlink");

        // var style =
        //   $svg
        //     .find("defs")
        //     .remove()
        //     .find("style")
        //     .html() || "";

        // fs.writeFileSync(
        //   path.join(partialsPath, svgId.replace("svg-", "") + ".hbs"),
        //   cheerio("<div />")
        //     .append($svg)
        //     .html()
        // );

        // lessToWrite += `\n#${svgId}{ ${style} }\n`;

        // console.log("bundling svg as hbs: " + svgId);

        // return resolve();

        ///////////////////

        fs.writeFileSync(
          path.join(partialsPath, svgId.replace("svg-", "") + ".hbs"),
          `<img src="/assets/svg${relativeFilePath}" />`
        );

        return resolve();

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
          // if (originalSvg.attr("style"))
          //   xml.svg.$.style = originalSvg.attr("style");

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
            resXml
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
  var plugins = [
    autoprefixer({
      browsers: ["last 1 version"]
    }),
    cssnano()
  ];

  return gulp
    .src("./assets/less/dist/bundle.css")
    .pipe(postcss(plugins))
    .pipe(gulp.dest("./assets/less/dist"));
};

gulp.task("postcss", minifyCss);

gulp.task("less", compileLess);

let server;

function run(done) {
  if (server && server.kill) server.kill();

  server = child.spawn(
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

  if (done) done();
}

gulp.task("run", run);

gulp.task("default", async () => {
  livereload.listen();

  gulp.watch(["./assets/less/src/**/*.less"], gulp.series("less", "postcss"));

  gulp.watch(["./assets/svg/**/*.svg"], createSvgIconSetPartial);

  gulp.watch("server.js", gulp.series("run"));

  await createSvgIconSetPartial();
  compileLess();
  minifyCss();

  run();
});
