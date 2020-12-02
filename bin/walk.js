const fs = require("fs");
const fsp = fs.promises;
const path = require("path");

const walk = async (dir, cb) => {
  const entryGit = path.join(dir, ".git");
  const existsGit = fs.existsSync(entryGit);

  if (existsGit) {
    return [await cb(dir)];
  } else {
    const entryNodeModules = path.join(dir, "node_modules");
    const existsNodeModules = fs.existsSync(entryNodeModules);

    if (!existsNodeModules) {
      let files = await fsp.readdir(dir);

      const promises = files.map(async file => {
        const newPath = path.join(dir, file);
        const stats = await fsp.stat(newPath);
        if (stats.isDirectory()) {
          return walk(newPath, cb);
        }
      });

      const dirs = await Promise.all(promises);

      return dirs.reduce((acc, x) => (x ? [...acc, ...x] : acc), []);
    }
  }
};

module.exports = walk;
