const { exec } = require("child_process");
const fs = require("fs");
const check = require("./lib/checker");
const logger = require("./lib/logger");

const assetKeys = ["native car", "native part", "sourcefile", "shape"];
const externalLinksContent = [
  "system\\",
  "cars\\",
  "cars\\racers\\",
  "parts\\",
  "sound\\",
  "particles\\",
];

const rootDir = "./";
const fileList = [];

fs.readdirSync(rootDir).forEach((fileName) => {
  const splitted = fileName.split(".");
  fileList.push({ name: splitted[0], extension: splitted[1] });
});

check(fileList);

const modFile = fileList.find((file) => file.extension === "rpk");

if (!modFile) throw new Error("No rpk file found.");

exec(`resdecode.exe ${modFile.name}`, (error) => {
  if (error) throw new Error(`error decoding rkp: ${error.message}`);
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
        if (!fs.existsSync(file[key].replace("cars\\racers\\", "")))
          logger(`file not found ${file[key]} (${file.text})`);
      }
    });

    if (file.typeid) {
    }
  }
});
// console.log(rdbFiles);
