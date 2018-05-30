/**
 * Reads CSS content and creates TypeScript file.
 */

const fs = require("fs");
const path = require("path");

const cssDir = path.resolve(__dirname, "..");

const files = fs.readdirSync(cssDir);

const cssFiles = files.filter(fn => /\.css$/i.test(fn));

const outObj = {};

for (const filename of cssFiles) {
    let key = path.basename(filename, path.extname(filename));
    key = key.replace(/^elc-ui-/, "");

    const cssPath = path.resolve(cssDir, filename);
    let content = fs.readFileSync(cssPath).toString();
    // Remove import statement.
    content = content.replace("@import \"elc-ui-behavior.css\";", "");
    outObj[key] = content;
}

const srcDir = path.resolve(cssDir, "src");
const outFilePath = path.resolve(srcDir, "stylesheets.ts");

const json = JSON.stringify(outObj, undefined, 2);

const text = `export default ${json}`;

fs.writeFile(outFilePath, text, (err) => {
    if (err) {
        console.error(err);
    }
})
