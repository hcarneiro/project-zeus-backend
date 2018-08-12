const config = require('./config');
const sendgrid = require('sendgrid')(process.env.SENDGRID_API_KEY);

const email = {
  sendTemplate(options) {
    options = options || {};
    if (!options.template_id || !options.message) {
      return Promise.reject('Missing required option');
    }

    const templateOptions = new sendgrid.Email({
      to: options.message.to.email,
      from: 'support@hugocarneiro.me',
      subject: options.message.subject,
      html: '<p></p>',
      substitutions: options.message.substitutions
    });

    templateOptions.addFilter('templates', 'enable', 1);
    templateOptions.addFilter('templates', 'template_id', options.template_id);

    return new Promise(function (resolve, reject) {
      sendgrid.send(templateOptions, resolve, reject);
    });
  }
};

module.exports = email;