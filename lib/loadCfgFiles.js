const fs = require("fs");

const loadCfgFiles = (modFiles) => {
  const files = [];
  let cfgObject;

  modFiles
    .filter((f) => f.split(".")[1] === "cfg")
    .forEach((element) => {
      cfgObject = { filename: element, data: [] };
      cfgFile = fs
        .readFileSync(element, "utf8")
        .split(/\r\n/g)
        .map((line) =>
          line
            .split(/;|\/\//g)[0] // Remove comments starting with // or ;
            .split(/\s/g)
            .filter((word) => word !== "")
        )
        .filter((array) => array.length > 0 && array[0] !== "#")
        .map((entry, index) => {
          const values = entry.slice(1);
          cfgObject.data.push({
            [entry[0]]:
              values.length === 0
                ? undefined
                : values.length === 1
                ? values[0]
                : values,
          });
        });
      files.push(cfgObject);
    });

  return files;
};

module.exports = loadCfgFiles;
