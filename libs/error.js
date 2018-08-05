const _ = require('lodash');

/**
 * Middle-ware for returning errors to the user
 * Usage: ".catch(res.error(400))"
 * or also "res.error(400, 'message')" to send it straight away
 */
module.exports = function userErrorMiddleware(req, res, next) {
  res.error = function sendError(statusCode = 400, error) {
    function sendErrorToClient (e) {
      const message = e && e.message || e.description || e || 'Unknown error.';
      let messageTitle = e && e.title;

      res.status(statusCode).format({
        'application/json': function(){
          res.send({
            message
          });
        },
        'text/html': function() {
          if (!messageTitle) {
            messageTitle = statusCode === 400
              ? _.sample([
                'Your input seems invalid.',
                'Please double check your input.',
                'Our backend cannot accept your input.',
                'Have you read the manual?',
                'Nope. You can\'t do that.'
              ])
              : _.sample([
                'Oops! Something weird happened.',
                'An error has occurred.',
                'Our backend didn\'t like that.',
                'Nope. That didn\'t work.'
              ]);
          }
          
          res.render('error', {
            message: messageTitle,
            description: message,
            status: statusCode
          });
        }
      });
    }

    if (error) {
      sendErrorToClient(error); // send straight away
    }

    return sendErrorToClient;
  };

  next();
}