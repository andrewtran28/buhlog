reqiure("dotenv").config();
const express = require("express");
const cors = require("cors");
// const session = require("express-session");
const path = require("node:path");
// const passport = require("./config/passport");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("@prismaClient");

const usersRouter = require("./routes/usersRouter");
const postsRouter = require("./routes/postsRouter");
const authorRouter = require("./routes/authorRouter");

const app = express();
// const prisma = PrismaClient();

app.use(express.urlencode({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     cookie: { maxAge: 1000 * 60 * 60 * 24 }, //ms
//     store: new PrismaSessionStore(prisma, {
//       checkPeriod: 2 * 60 * 1000, //ms
//       dbRecordIdIsSessionId: true,
//       dbRecordIdFunction: undefined,
//     }),
//   })
// );
// app.use(passport.initialize());
// app.use(passport.session());

//Authentication setup
const isAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login"); // Redirect to /login if not authenticated
};

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

//Routing
app.get("/", indexController.getIndex);
app.use(indexController.getErrorPage);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Express App - Listening on port http://localhost:${PORT}`);
});
