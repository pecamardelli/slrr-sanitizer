const { exec } = require("child_process");
const fs = require("fs");
const check = require("./lib/checker");
const logger = require("./lib/logger");

const rootDir = "./";
const fileList = [];

fs.readdirSync(rootDir).forEach((fileName) => {
  const splitted = fileName.split(".");
  splitted.length > 1
    ? fileList.push({ name: splitted[0], extension: splitted[1] })
    : fileList.push({ name: splitted[0], extension: undefined });
});

check(fileList);

const modFile = fileList.find((file) => file.extension === "rpk");

if (!modFile) throw new Error("No rpk file found.");

exec(`resdecode.exe ${modFile.name}`, (error) => {
  if (error) {
    throw new Error(`error decoding rkp: ${error.message}`);
  }
});

let rdbData;
rdbData = fs.readFileSync(`${modFile.name}.rdb`, "utf8");

let tempFile = {};
const rdbFiles = [];

rdbData.split("\r\n").forEach((string) => {
  if (string.startsWith("<FILE", 0)) {
    tempFile = {};
    const fileText = string.replace(/[<|>]/g, "").trim().split(" ")[1];
    tempFile.text = fileText;
  } else if (string.startsWith("</FILE>", 0)) {
    rdbFiles.push(tempFile);
  } else {
    const lineData = string.trim().split(/\s/g);
    if (lineData.length > 2) {
      if (string.startsWith("native", 0))
        tempFile[`${lineData[0]} ${lineData[1]}`] = lineData[2];
      else tempFile[lineData[0]] = lineData.slice(1);
    } else tempFile[lineData[0]] = lineData[1];
  }
});

rdbFiles.forEach((file) => {
  if (file.superid) {
    if (!rdbFiles.some((f) => f.typeid === file.superid))
      logger(`superid not found (${file.superid}) for ${file.text}`);
  }
});
// console.log(rdbFiles);
