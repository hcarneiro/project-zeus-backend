const express = require('express');
const router = express.Router();
const config = require('../../libs/config');
const aws = require('aws-sdk');
const Busboy = require('busboy');
const _ = require('lodash');
var url = require('url');
var https = require('https');
var sizeOf = require('image-size');

function uploadToS3(file) {
  let bucket = new aws.S3({
    params: {
      Bucket: config.S3.BUCKET_NAME,
      Region: config.S3.BUCKET_REGION
    }    
  });

  bucket.name = config.S3.BUCKET_NAME;

  return new Promise(function(resolve, reject) {
    const params = {
      Key: file.name,
      Body: file.data,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };
    
    return bucket.upload(params, function (err, data) {
      if (err) {
       reject(err)
      }
      resolve(data)
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
        let dimensions;
        const imageTest = new RegExp('image\/.*');
        const fileData = _.pick(file, ['name', 'mimetype', 'size']);

        fileData.url = `${config.cdn_host}/${fileData.name}`;
        
        if (imageTest.test(file.mimetype)) {
          dimensions = sizeOf(file.data);
          fileData.dimensions = _.pick(dimensions, ['width', 'height']);
        }
        
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