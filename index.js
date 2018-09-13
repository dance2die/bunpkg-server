require("dotenv").config();
const configuration = require("./configuration");
const compression = require("compression");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const tar = require("tar");
const gunzip = require("gunzip-maybe");

const app = express();
app.use(cors(configuration.corsOptions));
app.use(express.static("public"));
app.use(compression());

const filterByData = _ => _.data;

const sendErrorResponse = (res, e) =>
  res.status(400).send(`Error while getting Group and Event details = ${e}`);

const ignoredDirectoryPattern = /^.+\/(src|test|tests)\/.*/gi;
// Michael Jackson's unpkg source
// https://github.com/unpkg/unpkg.com/blob/21ed6ee42e298b7eb640ed35912e9c0355c1270d/modules/middleware/findFile.js#L29
// Turns 'package/dist/jquery.js into 'dist/jquery.js
const leadingSegmentPattern = /^[^/]+\/?/gi;
const includedFilePattern = /\.(js|map)$/gi;

const getFilesFromTarballUrl = async tarballUrl => {
  const response = await axios({
    method: "get",
    url: tarballUrl,
    responseType: "stream"
  });

  let files = [];

  return new Promise(resolve => {
    response.data
      .pipe(gunzip())
      .pipe(tar.t())
      .on("entry", entry => {
        if (entry.path.match(ignoredDirectoryPattern)) return;

        if (entry.path.match(includedFilePattern)) {
          const file = entry.path.replace(leadingSegmentPattern, "");
          // Lodash has a 💩 load of helper files starting with "_"
          if (file.startsWith("_")) return;
          if (file.endsWith(".config.js")) return;

          files.push(file);
        }
      })
      .on("end", () => {
        resolve(files);
      });
  });
};

const getFiles = async package => {
  let files = [];
  /**
   * 1. Get "files" list
   *    if "browser" field exist, add it to list of files to return
   *    else if "tarball", extract it, and return only JS & .map files.
   *    else return "main", "module", & "jsnext:main"
   *
   * 2. Get meta data
   *    2.1 homepage
   *    2.2 repository
   */
  // https://docs.npmjs.com/files/package.json#browser
  // e.g) https://registry.npmjs.org/styled-components/3.4.5
  if (package.browser) {
    // Sometimes `package.browser` contains a list of object, else just one file
    // case "object": https://registry.npmjs.org/styled-components/3.4.5
    // case "string": https://registry.npmjs.org/zone.js/0.8.26
    if (typeof package.browser === "object")
      files = Object.values(package.browser);
    else if (typeof package.browser === "string") files = [package.browser];
  }
  // https://docs.npmjs.com/files/package.json#bundleddependencies
  else if (package.dist && package.dist.tarball) {
    files = await getFilesFromTarballUrl(package.dist.tarball);
  }
  // Least favorable
  else {
    if (package.main) files.push(package.main);
    if (package.module) files.push(package.module);
    if (package["jsnext:main"]) files.push(package["jsnext:main"]);
  }

  return files;
};

// Extract meta data from package
// 😜 LOL so easy with ES6 object destructring~
const getMeta = package => {
  const { name, version, description, homepage, repository } = package;
  return { name, version, description, homepage, repository };
};

// optional version???
// Nah, maybe later. May not need it at all so let me optimize later...
// app.get("/api/info/:packageName/:version?", async (req, res, next) => {
app.get("/api/info/:packageName/:version", async (req, res) => {
  const { packageName, version } = req.params;

  try {
    const package = await axios
      .get(`https://registry.npmjs.org/${packageName}/${version}`)
      .then(filterByData);

    const files = await getFiles(package);
    const meta = getMeta(package);

    res.json({ meta, files });
  } catch (e) {
    sendErrorResponse(res, e);
  }
});

app.get("/api/versions/:packageName", async (req, res) => {
  try {
    const { packageName } = req.params;

    const filterByVersion = _ => _.versions;
    const extractVersions = versions =>
      Object.values(versions).map(_ => _.version);

    const versions = await axios
      .get(`https://registry.npmjs.org/${packageName}`)
      .then(filterByData)
      .then(filterByVersion)
      .then(extractVersions)
      .catch(err => console.log(`versions`, err));

    res.json(versions);
  } catch (e) {
    sendErrorResponse(res, e);
  }
});

app.listen(configuration.PORT, () =>
  console.log(`listening on port ${configuration.PORT}`)
);
