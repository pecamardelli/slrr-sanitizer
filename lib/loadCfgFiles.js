const fs = require("fs");

const loadCfgFiles = (modFiles) => {
  const files = [];
  let cfgObject;

  modFiles
    .filter((f) => f.split(".")[1] === "cfg")
    .forEach((element) => {
      cfgObject = { filename: element };
      cfgFile = fs
        .readFileSync(element, "utf8")
        .split(/\r\n/g)
        .map((line) =>
          line.split(/\s/g).filter((word) => word !== "" && word !== "eof")
        )
        .filter((array) => array.length > 0 && array[0] !== "#")
        .map((entry) => (cfgObject[entry[0]] = entry.slice(1)));
      files.push(cfgObject);
    });
  return files;
};

module.exports = loadCfgFiles;
