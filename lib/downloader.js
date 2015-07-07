// Dependencies
var url = require('url');
var request = require('request');
var zlib = require('zlib');
var AWS = require('aws-sdk');

// Configuration
AWS.config.loadFromPath('./config.json');

/**
 * @constructor
 */
function Downloader(bucketName) {
    this.bucketName = bucketName;
    this.s3Stream = createS3Stream(this.bucketName);
};

/**
 * 
 * @param {string} uri - The uri of the image you want to upload to S3
 * @callback {Downloader~loadCallback} callback - The callback that handles the response
 */
Downloader.prototype.load = function(uri, hostname, callback) {
    var self = this;
    var parsed_uri = url.parse(uri);
    var compress = null;
    var upload = null;
    var host = parsed_uri.host;
    var pathname = parsed_uri.pathname;

    if (!parsed_uri.protocol) {
        if (!parsed_uri.host) {
            uri = 'http://' + hostname + uri;
        } else {
            uri = 'http:' + uri;
        }
    }

    request.head(uri, function(err, res, body) {
        if (err) {
            console.error(err)
        } else {
            compress = zlib.createGzip();
            if (!host && pathname.charAt(0) === '/') {
                pathname = pathname.slice(1);
            }
            var key = host ? host + pathname : pathname;
            upload = self.s3Stream.upload({
                "Bucket": self.bucketName,
                "Key": key,
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
        }
    });
};

function createS3Stream(bucketName) {
    var s3 = new AWS.S3();
    var params = {
        Bucket: bucketName,
        CORSConfiguration: {
            CORSRules: [{
                AllowedMethods: ['GET'],
                AllowedOrigins: ['*']
            }]
        }
    };
    s3.putBucketCors(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
    });
    s3.putBucketAcl({
        "Bucket": bucketName,
        "ACL": "public-read"
    }, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
    });
    return require('s3-upload-stream')(s3);
};

/**
 * This callback is displayed as part of the Downloader class.
 * @callback Downloader~loadCallback
 * @param {string} error
 * @param {Object} data
 */

module.exports = Downloader;
