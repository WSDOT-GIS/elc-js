/**
 * @file Generates the "Templates" TypeScript file containing content pulled from HTML files.
 */

const fs = require("fs");
const path = require("path");
const htmlMinify = require("html-minifier").minify;

// Get the path to the folder that contains the template HTML files.
const templatesPath = path.resolve(__dirname, "..", "src", "Templates");
// Get the path where the output *.ts file will be written.
const srcPath = path.resolve(templatesPath, "..");

// Define the list of file names.
const filenames = fs.readdirSync(templatesPath); // ["elc-ui.html", "elc-ui-bootstrap.html"];

// Initialize output object.
const output = {};

for (const filename of filenames) {
  // Get the full path to the template file.
  const filePath = path.resolve(templatesPath, filename);
  // Get the file extension (e.g., ".html").
  const extension = path.extname(filename);
  // Get the filename without extension to create output property name.
  let key = path.basename(filename, extension);
  // Remove the "elc-ui-" prefix from the property name. If this leaves the
  // name empty, replace with "default".
  key = key.replace(/elc-ui-?/, "") || "default";
  // Read the content (HTML markup) from the template file.
  let content = fs.readFileSync(filePath).toString();

  if (/\.html?$/i.test(extension)) {
    // Minify the HTML markup.
    content = htmlMinify(content, {
      collapseWhitespace: true
    });
  }
  // Add property to the output template object.
  output[key] = content;
}

const json = JSON.stringify(output, undefined, 2);
const outFile = path.resolve(srcPath, "Templates.ts");
fs.writeFileSync(outFile, `export default ${json}`);
