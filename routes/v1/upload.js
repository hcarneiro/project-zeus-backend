const express = require('express');
const router = express.Router();
const config = require('../../libs/config');
const AWS = require('aws-sdk');
const Busboy = require('busboy');
const _ = require('lodash');

function uploadToS3(file) {
  let s3bucket = new AWS.S3({
    Bucket: config.S3.BUCKET_NAME,
    accessKeyId: config.AWS.ACCESS_KEY_ID,
    secretAccessKey: config.AWS.SECRET_ACCESS_KEY,
    region: config.S3.BUCKET_REGION
  });

  return new Promise(function(resolve, reject) {
    return s3bucket.createBucket(function() {
      const params = {
        Bucket: config.S3.BUCKET_NAME,
        Key: file.name,
        Body: file.data,
      };
      
      s3bucket.upload(params, function (err, data) {
        if (err) {
         reject(err)
        }
        resolve(data)
      });
    });
 });
}

router.post('/', (req, res, next) => {
  let busboy = new Busboy({ headers: req.headers });
  // The file upload has completed
  busboy.on('finish', function() {
    // Your files are stored in req.files. In this case,
    // Grabs your file object from the request.
    const file = req.files.element2;

    uploadToS3(file)
      .then(function(response) {
        const fileData = _.pick(file, ['name', 'mimetype', 'size']);
        fileData.url = response['Location']
        res.send(fileData);
      })
      .catch(function(error) {
        let errorMessage = '';

        if (error) {
          errorMessage = 'We couldn\'t upload your file, Please try again.';
        }

        res.send({
          message: errorMessage,
          error: error
        });
      });
  });
  req.pipe(busboy);
});

module.exports = router;