const logger = require("./logger");

const check = (fileList = []) => {
  const resconvertAvailable = fileList.some(
    (value) => value.name === "resconvert" && value.extension === "exe"
  );

  const resdecodeAvailable = fileList.some(
    (value) => value.name === "resdecode" && value.extension === "exe"
  );

  if (!resconvertAvailable) throw new Error("resconvert not available.");
  if (!resdecodeAvailable) throw new Error("resdecode not available.");

  logger("Checks passed..");
};

module.exports = check;
