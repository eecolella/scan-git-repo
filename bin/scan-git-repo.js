#!/usr/bin/env node
"use strict";

const Tilda = require("tilda");
const walk = require("./walk");
const ora = require("ora");
const path = require("path");
const chalk = require("chalk");
const unflatten = require("flat").unflatten;
const treeify = require("object-treeify");
const gitState = require("git-state");

const TEN_MEGABYTES = 1e7;
const TEXT = "Scanning directories...";

const sortObject = obj =>
  Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      result[key] = obj[key];
      return result;
    }, {});

new Tilda(`${__dirname}/../package.json`, {
  options: [
    {
      name: "path",
      opts: ["p", "path"],
      desc: "A custom folder path (default: the current working directory).",
      default: process.cwd()
    },
    {
      opts: ["a", "absolute"],
      desc: "Display the absolute paths.",
      default: false,
      type: Boolean
    }
  ],
  examples: [
    "scan-git-repo                  # Scans the current directory",
    "scan-git-repo -p ~/projects    # Scans the projects directory",
    "scan-git-repo -a               # Display absolute paths"
  ]
}).main(async action => {
  const cwd = process.cwd();

  const spinner = ora({
    text: TEXT
  }).start();

  const results = await walk(
    action.options.path.value,
    repoPath =>
      new Promise(resolve => {
        gitState.check(
          repoPath,
          {
            maxBuffer: TEN_MEGABYTES
          },
          (err, data) => {
            const messages = [];

            if (isNaN(data.ahead)) {
              messages.push(`no remote address`);
            } else if (data.ahead) {
              messages.push(`${data.ahead} unpushed commits`);
            }

            const modifiedAndUntracked = data.dirty + data.untracked;
            if (modifiedAndUntracked) {
              messages.push(`${modifiedAndUntracked} files to commit`);
            }

            if (data.stashes) {
              messages.push(`${data.stashes} stashes`);
            }

            const cPathRelative = path.relative(cwd, repoPath);

            const coloredPath = cPathRelative.replace(/\//g, ".");

            const coloredBranch = `${chalk[
              messages.length > 0 ? "red" : "green"
            ](` ${data.branch}`)} ${chalk.yellow(messages.join(" - "))}`;

            const cPath = action.options.a.value
              ? repoPath
              : cPathRelative.length > 0
              ? `./${cPathRelative}/`
              : "./";

            spinner.clear();

            console.log(`${cPath} ${coloredBranch}`);

            spinner.text = TEXT;
            spinner.render();

            resolve({
              key: coloredPath,
              value: coloredBranch
            });
          }
        );
      })
  );

  spinner.stop();

  const result = results.reduce((acc, x) => ({ ...acc, [x.key]: x.value }), {});

  const sortedResult = sortObject(result);
  const flatResult = unflatten(sortedResult);
  const treeResult = treeify(flatResult);

  console.log();
  console.log(treeResult);
});
