const config = require('./config');
const sendgrid = require('@sendgrid/mail');
sendgrid.setApiKey(process.env.SENDGRID_API_KEY || config.SENDGRID_API_KEY);
sendgrid.setSubstitutionWrappers('{{', '}}');

const email = {
  sendTemplate(options) {
    options = options || {};
    if (!options.template_id || !options.message) {
      return Promise.reject('Missing required option');
    }

    const templateOptions = {
      from: {
        email: 'support@hugocarneiro.me',
        name: 'Project Zeus'
      },
      reply_to: {
        email: 'support@hugocarneiro.me',
        name: 'Project Zeus'
      },
      personalizations: [
        {
          to: [
            {
              email: options.message.to.email,
              name: options.message.to.name
            }
          ],
          dynamic_template_data: options.message.dynamicData
        }
      ],
      template_id: options.template_id
    };

    return new Promise(function (resolve, reject) {
      sendgrid.send(templateOptions, resolve, reject);
    });
  }
};

module.exports = email;