const loadCfgFiles = (modFiles) => {
  const cfgFiles = modFiles.filter((f) => f.split(".")[1] === "cfg");
  console.log(cfgFiles);
  //   fs.readdirSync(rootDir).forEach((fileName) => {
  //     const splitted = fileName.split(".");
  //     fileList.push({ name: splitted[0], extension: splitted[1] });
  //   });
  return [];
};

module.exports = loadCfgFiles;
