#!/usr/bin/env node
"use strict";

var _path = require("path");

var _fs = require("fs");

var _inquirer = require("inquirer");

var _inquirer2 = _interopRequireDefault(_inquirer);

var _minimist = require("minimist");

var _minimist2 = _interopRequireDefault(_minimist);

var _updateNotifier = require("update-notifier");

var _updateNotifier2 = _interopRequireDefault(_updateNotifier);

var _app = require("../app");

var _app2 = _interopRequireDefault(_app);

var _toc = require("../libs/toc");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var pkg = require("../../package.json");

var questions = [{
  type: "input",
  name: "toc",
  message: "There is no `toc.yml` which is table of contents file to generate static book\nPlease create table of content [Y/n]"
}];

var argv = (0, _minimist2.default)(process.argv.slice(2), {
  alias: {
    h: "help",
    s: "silent",
    o: "outdir",
    t: "toc"
  },
  boolean: ["h"],
  default: {
    s: false,
    o: null
  }
});

if (argv.help || !argv._[0]) {
  console.log("\n    Description\n      Exports the static website for production deployment\n\n    Usage\n      $ flybook <outdir> [options]\n      <outdir> represents where the compiled dist folder should go.\n\n    If no directory is provided, the 'out' folder will be created in the current directory.\n    You can set a custom folder in config https://rhiokim.github.io/flybook\n\n    Options\n      -h - list this help\n      -o - set the output dir (defaults to 'out')\n      -s - do not print any messages to console\n      -t - generate new toc.yml file\n  ");
  process.exit(0);
}

var dir = (0, _path.resolve)(argv._[0] || ".");

var gen = function gen() {
  var options = {
    docDir: dir,
    silent: argv.silent,
    outDir: argv.outdir ? (0, _path.resolve)(argv.outdir) : (0, _path.resolve)(dir, "../out")
  };

  (0, _app2.default)(options);
};

// Check if pages dir exists and warn if not
if (!(0, _fs.existsSync)(dir)) {
  console.log("> No such directory exists as the documentation root: " + dir);
  process.exit(1);
}

// No table of contents file found
if (!(0, _fs.existsSync)((0, _path.join)(dir, "toc.yml"))) {
  _inquirer2.default.prompt(questions).then(function (answer) {
    console.log(answer);
    if (answer.toc === "" || answer.toc === "y") {
      (0, _toc.writeTOC)(dir);
      gen();
    } else {
      console.log("> No `toc.yml` file found. Did you mean to run `flybook` in the parent (`../`) directory?");
      process.exit(1);
    }
  });
} else {
  // `toc.yml` file found, but wannt renew
  if (argv.toc) {
    _inquirer2.default.prompt([{
      type: "input",
      name: "toc",
      message: "`toc.yml` file found. Overwrite? [y/N]"
    }]).then(function (answer) {
      if (answer.toc === "y") {
        (0, _toc.overwriteTOC)(dir);
      }
      gen();
    });
  } else {
    gen();
  }
}

(0, _updateNotifier2.default)({ pkg: pkg }).notify();