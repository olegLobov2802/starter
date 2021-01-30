// npm install -g npm-check-updates
// ncu
// npm cache clean --force

const { src, dest, watch } = require("gulp");
const gulp = require("gulp");
const browserSync = require("browser-sync").create();
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const rename = require("gulp-rename");
const plumber = require("gulp-plumber");
const uglify = require("gulp-uglify");
const del = require("del");
const imageMin = require("gulp-imagemin");
const fileinclude = require("gulp-file-include");
const babel = require("gulp-babel");
const ttf2woff = require("gulp-ttf2woff");
const ttf2woff2 = require("gulp-ttf2woff2");

/* Paths */
const path = {
  build: {
    html: "dist/",
    js: "dist/js/",
    css: "dist/css/",
    images: "dist/img/",
    fonts: "dist/fonts/",
  },
  src: {
    html: ["src/*.html", "!src/_*.html"],
    js: ["src/js/*.js", "!src/js/_*.js"],
    sass: "src/sass/**/*.+(scss|sass)",
    images: "src/img/**/*.{jpg,png,svg,gif}",
    fonts: "src/fonts/**/*.{woff2,ttf}",
  },
  watch: {
    html: "src/**/*.html",
    js: "src/js/**/*.js",
    sass: "src/sass/**/*.+(scss|sass)",
    images: "src/img/**/*.{jpg,png,svg,gif,ico,webp}",
    fonts: "src/fonts/**/*.{woff,woff2,ttf}",
  },
  clean: "./dist",
};

function browsersync() {
  browserSync.init({
    server: {
      baseDir: "./dist/",
    },
    port: 3000,
    notify: false,
  });
}

function html() {
  return src(path.src.html)
    .pipe(plumber())
    .pipe(fileinclude())
    .pipe(dest(path.build.html))
    .pipe(browserSync.stream());
}

function styles() {
  return src(path.src.sass)
    .pipe(sass({ outputStyle: "expanded" }))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 5 versions"],
        cascade: true,
      })
    )
    .pipe(dest(path.build.css))
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(rename({ suffix: ".min", prefix: "" }))
    .pipe(dest(path.build.css))
    .pipe(browserSync.stream());
}

function js() {
  return src(path.src.js)
    .pipe(fileinclude())
    .pipe(plumber())
    .pipe(
      babel({
        presets: ["@babel/env"],
      })
    )
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(
      rename({
        suffix: ".min",
        prefix: "",
      })
    )
    .pipe(dest(path.build.js))
    .pipe(browserSync.stream());
}

function fonts() {
  src(path.src.fonts).pipe(ttf2woff()).pipe(dest(path.build.fonts));
  return src(path.src.fonts)
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonts))
    .pipe(browserSync.stream());
}

function img() {
  return src(path.src.images)
    .pipe(
      imageMin({
        interlaced: true,
        progressive: true,
        optimizationLevel: 3,
        svgoPlugins: [
          {
            removeViewBox: true,
          },
        ],
      })
    )
    .pipe(dest(path.build.images))
    .pipe(browserSync.stream());
}

function clean() {
  return del(path.clean);
}

function watchFiles() {
  watch([path.watch.html], html);
  watch([path.watch.sass], styles);
  watch([path.watch.js], js);
  watch([path.watch.images], img);
  watch([path.watch.fonts], fonts);
}

const build = gulp.series(clean, gulp.parallel(html, styles, js, img, fonts));
const watching = gulp.parallel(build, watchFiles, browsersync);

/* Exports Tasks */
exports.html = html;
exports.styles = styles;
exports.js = js;
exports.img = img;
exports.fonts = fonts;
exports.clean = clean;
exports.watchFiles = watchFiles;
exports.build = build;
exports.watching = watching;
exports.default = watching;
