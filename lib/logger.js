const fs = require("fs");
const logFile = "./report.log";

let fd;

const logger = (logData) => {
  try {
    if (!fd) fd = fs.openSync(logFile, "w+");
    fs.writeSync(fd, logData + "\n");
    console.log(logData);
  } catch (err) {
    console.error(err);
  }
};

module.exports = logger;
