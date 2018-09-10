// https://m4xq07441x.codesandbox.io
// https://arjunphp.com/enable-cors-express-js/
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");
const corsOptions = {
  // some legacy browsers (IE11, various SmartTVs) choke on 204
  optionsSuccessStatus: 200,
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      var msg =
        "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }

    return callback(null, true);
  }
};

module.exports = {
  PORT: process.env.PORT || 3001,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
  corsOptions
};
