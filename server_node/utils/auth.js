require("dotenv").config();
const jwt = require("jsonwebtoken");
const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//Generate a signed JWT token after user is authenticated
const generateToken = (user) => {
  return jwt.sign({ id: user.id, username: user.username, isAuthor: user.isAuthor }, process.env.JWT_SECRET, {
    expiresIn: 3 * (24 * 60 * 60), //seconds (3 days)
  });
};

//Passport JWT Strategy Options (How to extract JWT from request header)
const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

//Configure Passport JWT Strategy (Extract JWT from request header and validate it)
const configurePassport = (passport) => {
  passport.use(
    new JwtStrategy(options, async (payload, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { id: payload.id } });
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (error) {
        return done(error, false);
      }
    })
  );
};

//Authentication Middleware (Validate JWT token for before proceeding to protected routes)
const authenticateToken = passport.authenticate("jwt", { session: false });

module.exports = {
  generateToken,
  configurePassport,
  authenticateToken,
};
