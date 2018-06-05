const fs = require("fs");
const path = require("path");

const outCssDir = path.resolve(__dirname, "..", "Style");
const sourceDir = path.resolve(__dirname, "..", "..", "elc-ui");

fs.readdir(sourceDir, (err, files) => {
  // Get a list of the CSS files.
  const cssFiles = files.filter(file => file.match(/.css$/i));

  for (const file of cssFiles) {
    const sourcePath = path.resolve(sourceDir, file);
    const destPath = path.resolve(outCssDir, file);
    console.log(`copying ${sourcePath} to ${destPath}...`);
    fs.copyFile(sourcePath, destPath, err => {
      if (err) {
        console.error(err);
      } else {
        console.log(`copied ${sourcePath} to ${destPath}...`);
      }
    });
  }
});
