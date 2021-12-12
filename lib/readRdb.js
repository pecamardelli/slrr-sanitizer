const logger = require("./logger");
const fs = require("fs");

const readRdb = (filename) => {
  rdbData = fs.readFileSync(`${filename}.rdb`, "utf8");
  if (!rdbData) throw new Error(`No rdb file found.`);

  const rdbFiles = [];
  let aux;
  let fileText;
  let tempFile = {};

  rdbData.split("\r\n").forEach((string) => {
    if (string.startsWith("<FILE", 0)) {
      aux = {};
      fileText = string.replace(/[<|>]/g, "").trim().split(" ")[1];
    } else if (string.startsWith("</FILE>", 0)) {
      if (fileText === "external_links")
        return rdbFiles.push([...Object.keys(aux)]);

      const fileExtension = fileText.split(".")[1];
      if (fileExtension === "res") {
        tempFile.res = aux;
      } else if (fileExtension === "rsd") {
        tempFile.rsd = aux;
        rdbFiles.push(tempFile);
        tempFile = {};
      }
    } else {
      const lineData = string.trim().split(/\s/g);
      if (lineData.length > 2) {
        if (string.startsWith("native", 0))
          aux[`${lineData[0]} ${lineData[1]}`] = lineData[2];
        else {
          const value = lineData.slice(1);
          if (value.join().startsWith("cars\\racers")) {
            aux[lineData[0]] = value.join();
            logger(`file path has spaces: ${fileText}`);
          } else aux[lineData[0]] = value;
        }
      } else if (string !== "") aux[lineData[0]] = lineData[1];
    }
  });

  return rdbFiles;
};

module.exports = readRdb;
