const { exec } = require("child_process");
const fs = require("fs");
const { files } = require("node-dir");
const check = require("./lib/checker");
const loadCfgFiles = require("./lib/loadCfgFiles");
const logger = require("./lib/logger");
const { assetKeys, externalLinksContent, skipList } = require("./config");
const { exit } = require("process");

const rootDir = "./";
const fileList = [];

fs.readdirSync(rootDir).forEach((fileName) => {
  const splitted = fileName.split(".");
  fileList.push({ name: splitted[0], extension: splitted[1] });
});

check(fileList);

const modFile = fileList.find((file) => file.extension === "rpk");
if (!modFile) throw new Error("No rpk file found.");

if (process.platform === "win32") {
  exec(`resdecode.exe ${modFile.name}`, (error) => {
    if (error) throw new Error(`error decoding rkp: ${error.message}`);
  });
}

const modFiles = files(modFile.name, "file", null, { sync: true }).filter(
  (f) => {
    const fileExtension = f.split(".")[1];
    return !skipList.includes(fileExtension.toLowerCase());
  }
);
const modFilesOnRpk = [];
const cfgFiles = loadCfgFiles(modFiles);
console.log(cfgFiles);
exit();

let rdbData;
rdbData = fs.readFileSync(`${modFile.name}.rdb`, "utf8");
if (!rdbData) throw new Error(`No rdb file found.`);

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
      else {
        const value = lineData.slice(1);
        if (value.join().startsWith("cars\\racers")) {
          tempFile[lineData[0]] = value.join();
          logger(`file path has spaces: ${tempFile.text}`);
        } else tempFile[lineData[0]] = value;
      }
    } else tempFile[lineData[0]] = lineData[1];
  }
});

rdbFiles.forEach((file) => {
  if (file.superid) {
    if (!rdbFiles.some((f) => f.typeid === file.superid))
      logger(`superid not found (${file.superid}) for ${file.text}`);
  }

  const fileKeys = Object.keys(file);

  if (file.text === "external_links") {
    externalLinksContent.forEach((content) => {
      if (!fileKeys.find((key) => key === content))
        logger(`${content} is missing from external_links file`);
    });
  } else {
    fileKeys.some((key) => {
      if (assetKeys.includes(key)) {
        const parsedFileName =
          process.platform === "win32"
            ? file[key].replace("cars\\racers\\", "")
            : file[key].replace("cars\\racers\\", "").replace(/\\/g, "/");
        const found = modFiles.find(
          (fileName) => fileName.toLowerCase() === parsedFileName.toLowerCase()
        );

        if (found) {
          modFilesOnRpk.push(found);
        } else logger(`file not found ${parsedFileName} (${file.text})`);
      }
    });

    if (file.typeid) {
    }
  }
});

const orphanFiles = modFiles.filter((f) => !modFilesOnRpk.includes(f));

console.log(
  `Total files: ${modFiles.length}, on rpk: ${modFilesOnRpk.length}`,
  orphanFiles
);
// console.log(rdbFiles);
