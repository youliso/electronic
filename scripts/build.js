const path = require("path");
const fs = require("fs");

fs.writeFileSync(
  "./dist/package.json",
  JSON.stringify(require("../package.json"), null, 2)
);
fs.writeFileSync(
  "./dist/README.md",
  fs.readFileSync(path.resolve("README.md"), { encoding: "utf8" })
);
