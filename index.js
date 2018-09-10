require("dotenv").config();
const configuration = require("./configuration");
const compression = require("compression");
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors(configuration.corsOptions));
app.use(compression());

app.get("/api/search/:packageName", async (req, res, next) => {
  const { packageName } = req.params;

  try {
    res.send(packageName);
  } catch (e) {
    res.status(400).send(`Error while getting Group and Event details = ${e}`);
  }
});

app.get("/api/versions/:packageName", async (req, res) => {
  const { packageName } = req.params;

  const filterByData = _ => _.data;
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
});

app.listen(configuration.PORT, () =>
  console.log(`listening on port ${configuration.PORT}`)
);
