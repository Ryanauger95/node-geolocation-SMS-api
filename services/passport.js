const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('../config/keys');
const ipInfo = require('../config/ipInfo');

passport.use(
    new GoogleStrategy(
        {
          clientID: keys.googleClientID,
          clientSecret: keys.googleClientSecret,
          callbackURL: 'http://' + ipInfo.localDomain + ':' + ipInfo.localPort + '/auth/google/callback',
        },
        (accessToken, refreshToken, profile, done) => {
          console.log('accessToken: ', accessToken);
          console.log('refreshToken: ', refreshToken);
          console.log('profile: ', profile);
          console.log('done: ', done);
        }
    )
);
