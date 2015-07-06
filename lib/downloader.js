// Dependencies
var fs = require('fs');
var url = require('url');
var path = require('path');
var request = require('request');
var mkdirp = require('mkdirp');
var zlib = require('zlib');
var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var compress = zlib.createGzip();

// Configuration
AWS.config.loadFromPath('./config.json');
var params = {
    Bucket: 'webcdn2',
    CORSConfiguration: {
        CORSRules: [{
            AllowedMethods: ['GET'],
            AllowedOrigins: ['*']
        }]
    }
};
s3.putBucketCors(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else console.log(data); // successful response
});
s3Stream = require('s3-upload-stream')(s3);

/**
 * @constructor
 */ 
function Downloader() {};

/**
 * 
 * @param {string} uri - The uri of the image you want to upload to S3
 * @callback {Downloader~loadCallback} callback - The callback that handles the response
 */
Downloader.load = function(uri, callback) {
    var parsed_uri = url.parse(uri);
    var parsed_path = parsed_uri.path;
    var filename = path.basename(parsed_path);
    var dirname = path.dirname(parsed_path);
    var base_path = parsed_uri.host + dirname;
    var full_path = base_path + '/' + filename;

    request.head(uri, function(err, res, body) {
        mkdirp(base_path, function(err) {
            if (err) console.error(err)
            var upload = s3Stream.upload({
                "Bucket": "webcdn2",
                "Key": full_path,
                "ContentEncoding": "gzip",
                "ACL": "public-read"
            });
            upload.maxPartSize(20971520); // 20 MB 
            upload.concurrentParts(5);
            upload.on('error', function(error) {
                callback(error, null);
            });
            upload.on('uploaded', function(details) {
                callback(false, details);
            });
            request(uri).pipe(compress).pipe(upload);
        });
    });
};

/**
 * This callback is displayed as part of the Downloader class.
 * @callback Downloader~loadCallback
 * @param {string} error
 * @param {Object} data
 */

module.exports = Downloader;
