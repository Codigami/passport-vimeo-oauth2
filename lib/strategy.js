/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2Strategy = require('passport-oauth2')
  , Profile = require('./profile')
  , InternalOAuthError = require('passport-oauth2').InternalOAuthError;


/**
 * `Strategy` constructor.
 *
 * The Vimeo authentication strategy authenticates requests by delegating to
 * Vimeo using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your Vimeo application's Client ID
 *   - `clientSecret`  your Vimeo application's Client Secret
 *   - `callbackURL`   URL to which Vimeo will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new VimeoStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/vimeo/callback',
 *         userAgent: 'myapp.com'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://api.vimeo.com/oauth/authorize';
  options.tokenURL = options.tokenURL || 'https://api.vimeo.com/oauth/access_token';
  options.scopeSeparator = options.scopeSeparator || ',';
  options.customHeaders = options.customHeaders || {};

  if (!options.customHeaders['User-Agent']) {
    options.customHeaders['User-Agent'] = options.userAgent || 'passport-vimeo';
  }
  options.customHeaders['Accept'] = "application/vnd.vimeo.*+json;version=3.0";

  OAuth2Strategy.call(this, options, verify);
  this.name = 'vimeo';
  this._userProfileURL = options.userProfileURL || 'https://api.vimeo.com/me';

  this._oauth2.useAuthorizationHeaderforGET(true);

}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


/**
 * Retrieve user profile from Vimeo.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `vimeo`
 *   - `id`               the user's Vimeo ID
 *   - `username`         the user's Vimeo username
 *   - `displayName`      the user's full name
 *   - `profileUrl`       the URL of the profile for the user on Vimeo
 *   - `emails`           the user's email addresses
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
  this._oauth2.get(this._userProfileURL, accessToken, function (err, body, res) {
    var json;
    
    if (err) {
      return done(new InternalOAuthError('Failed to fetch user profile', err));
    }
    
    try {
      json = JSON.parse(body);
    } catch (ex) {
      return done(new Error('Failed to parse user profile'));
    }
    
    var profile = Profile.parse(json);
    profile.provider  = 'vimeo';
    profile._raw = body;
    profile._json = json;
    
    done(null, profile);
  });
}


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
