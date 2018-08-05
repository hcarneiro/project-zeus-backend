const cookieMaxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

function setCookie(res, value, options) {
  options = options || {};
  options.httpOnly = true;

  if (typeof options.expires === 'undefined') {
    options.maxAge = cookieMaxAge;
  }

  res.cookie(options.name || 'auth_token', value, options);
}

module.exports.set = setCookie;
