const { preloadDefaultInit } = require("../dist/preload");
const { isSecondInstanceWin } = require("./cfg/app.json");

preloadDefaultInit({
  isSecondInstanceWin,
});
