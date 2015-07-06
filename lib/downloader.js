var fs = require('fs');
var url = require('url');
var path = require('path');
var request = require('request');
var mkdirp = require('mkdirp');
var AWS = require('aws-sdk');

AWS.config.loadFromPath('./config.json');
var s3 = new AWS.S3();

function Downloader() {};

Downloader.load = function(uri, callback) {
    var parsed_uri = url.parse(uri);
    var parsed_path = parsed_uri.path;
    var filename = path.basename(parsed_path);
    var dirname = path.dirname(parsed_path);
    var base_path = "data/ " + parsed_uri.host + dirname;
    var full_path = base_path + '/' + filename;

    request.head(uri, function(err, res, body) {
        mkdirp(base_path, function(err) {
            if (err) console.error(err)
            request(uri).pipe(fs.createWriteStream(full_path)).on('close', callback);
        });
    });
};

var uploadToS3Bucket = function(name) {
    s3.createBucket({
        Bucket: 'myBucket'
    }, function() {
        var params = {
            Bucket: 'myBucket',
            Key: 'myKey',
            Body: 'Hello!'
        };
        s3.putObject(params, function(err, data) {

            if (err)

                console.log(err)

            else console.log("Successfully uploaded data to myBucket/myKey");

        });
    });
};

module.exports = Downloader;