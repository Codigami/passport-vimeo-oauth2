/**
 * Parse profile.
 *
 * @param {Object|String} json
 * @return {Object}
 * @api private
 */
exports.parse = function(json) {
  if ('string' == typeof json) {
    json = JSON.parse(json);
  }

  var profile = { provider: 'vimeo' };

  profile.id = json.uri.replace('/users/','')
  profile.username = json.link.replace('https://vimeo.com/','')
  profile.displayName = json.name;
  profile.profileUrl = json.link;
  
  return profile;
};
