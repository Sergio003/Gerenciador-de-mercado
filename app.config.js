const config = require("./app.json").expo;

module.exports = {
  expo: {
    ...config,
    android: {
      ...config.android,
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON ||
        "./google-services.json",
    },
  },
};
