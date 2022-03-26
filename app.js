// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv/config");

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require("hbs");

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

const projectName = "Thejukeb0x";
const capitalized = (string) => string[0].toUpperCase() + string.slice(1).toLowerCase();


app.locals.title = `${capitalized(projectName)}`;

app.use(function (req, res, next) {
    app.locals.user = req.session.user;
    next();
});

// 👇 Start handling routes here
const index = require("./routes/index");
app.use("/", index);

const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

const spotifyAuth = require("./routes/spotify-auth");
app.use("/", spotifyAuth);

const spotifyRoutes = require("./routes/spotify.routes");
app.use("/", spotifyRoutes);

const dbRoutes = require("./routes/db.routes");
app.use("/", dbRoutes); 

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
