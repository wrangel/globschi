/*  Used solely to fix the issue with the missing export of index.css 
    in @photo-sphere-viewer/core package.json:

    "exports": {
      ".": {
        "import": "./index.module.js",
        "require": "./index.cjs"
      }
    }, 

    needs to be 

    "exports": {
      ".": {
        "import": "./index.module.js",
        "require": "./index.cjs"
      },
        "./index.css": "./index.css"
    },

*/

import { writeFileSync, readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const packageJsonPath = join(
  __dirname,
  "../node_modules/@photo-sphere-viewer/core/package.json"
);
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));

packageJson.exports["./index.css"] = "./index.css";

writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
