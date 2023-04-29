const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./db");


exports.initializingPassport = (passport) => {

    passport.use(new LocalStrategy(
        function(name, password, done) {
          User.findOne({ name: name }, function (err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            if (!user.verifyPassword(password)) { return done(null, false); }
            return done(null, user);
          });
        }
      ));
    
      passport.serializeUser(function(user, done) {
        done(null, user.id);
      }
        );
    
        passport.deserializeUser(function(id, done) {
            User.findById(id, function(err, user) {
                done(err, user);
            });
            }
        );
};

    exports.isAuthenticated = (req, res, next) => {
        if (req.user) return next();
        res.redirect("/");
    }