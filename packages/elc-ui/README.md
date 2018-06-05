# @wsdot/elc-ui

User interface for _wsdot-elc_.

## Install

```console
npm install @wsdot/elc-ui
```

## Generate required stylesheets

1.  Install _@wsdot/elc-ui_ into your project.
2.  Copy the following into a new file called `generate-css.js`.

    ```javascript
    const css = require("@wsdot/elc-ui").css;
    const fs = require("fs");
    const path = require("path");

    // Modify the output path here to point to your desired location.
    const outCssDir = path.resolve(__dirname, "..", "Style");

    // Create the output directory.
    fs.mkdir(outCssDir, err => {
      if (err) {
        if (err.code == "EEXIST") {
          console.log(
            `Directory already exists: ${outCssDir}. Skipping creation.`
          );
        } else {
          console.error(err);
        }
      }

      // For each property of the css object, write a new CSS file.
      for (const cssName in css) {
        if (css.hasOwnProperty(cssName)) {
          const cssData = css[cssName];
          let file = `${cssName}.css`;
          if (!file.match(/^elc-ui/)) {
            file = `elc-ui-${file}`;
          }
          const destPath = path.resolve(outCssDir, file);
          fs.writeFile(destPath, cssData, err => {
            if (err) {
              console.error(err);
            } else {
              console.log(`file ${destPath} has been written.`);
            }
          });
        }
      }
    });
    ```

3.  Execute the script

    ```console
    node generate-css.js
    ```

4.  Reference the stylesheets in your HTML file that will have the ELC UI control.

    ```html
    <!DOCTYPE html>
    <html>
    <head>
        <title>My example page</title>
        <link rel="stylesheet" href="Style/elc-ui-behavior.css" /> <!-- required -->
        <link rel="stylesheet" href="Style/elc-ui.css" /> <!-- optional. You can omit and specify your own styling. -->
        ...
    </head>
    ...
    </html>
    ```
