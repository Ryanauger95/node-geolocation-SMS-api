const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('./config/keys');
const app = express();

// Google won't allow us to use an IP, it must be a domain name.
// The only non-.com domain name allowed is localhost
// Because we are developing on a VM, we created a separate domain,
// vm.com, on the Mac. To use this, we must define it in our environment.
// Default we will leave as localhost, because that is how our cloud instances will run
const localDomain = process.env.LOCAL_DOMAIN || 'localhost';

// AWS Elastic Beanstalk routes all traffic on port 80 to
// an internal port (presumably port 8081). This internal port,
// the one we listen on, is defined in the ENV var PORT
const localPort = process.env.PORT || 5000;


app.get('/', (req, res) => {
  res.send({hi: 'there'});
});

app.get(
    '/auth/google',
    passport.authenticate('google', {scope: ['profile', 'email']})
);

passport.use(
    new GoogleStrategy(
        {
          clientID: keys.googleClientID,
          clientSecret: keys.googleClientSecret,
          callbackURL: 'http://' + localDomain + ':' + localPort + '/auth/google/callback',
        },
        (accessToken, refreshToken, profile, done) => {
          console.log(accessToken);
          console.log(refreshToken);
          console.log(profile);
          console.log(done);
        }
    )
);


app.get('/auth/google/callback', passport.authenticate('google'));

app.listen(localPort);
