const express = require("express");
const cors = require("cors");

const userroutes = require("./routes/userroutes");
const taskroutes = require("./routes/taskroutes");
const postroutes = require("./routes/postroutes");
const projectroutes = require("./routes/projectroutes");
const notificationroutes = require("./routes/notificationroutes");
const eventroutes = require("./routes/eventroutes" );
const adminroutes = require("./routes/adminroutes");
const messageroutes = require("./routes/messageroutes");
const meetingroutes = require("./routes/meetingroutes");

const app = express();

app.use(cors());
app.options("*", cors());
app.use("/api/V1/users", userroutes);
app.use("/api/V1/task", taskroutes);
app.use("/api/V1/post", postroutes);
app.use("/api/V1/project", projectroutes);
app.use("/api/V1/notifications", notificationroutes);
app.use("/api/V1/events", eventroutes);
app.use("/api/V1/admin", adminroutes);
app.use("/api/V1/message", messageroutes);
app.use("/api/V1/meeting", meetingroutes);

module.exports = app;
