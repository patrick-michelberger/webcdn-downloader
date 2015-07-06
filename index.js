var fs = require('fs'),
    url = require('url'),
    path = require('path'),
    request = require('request'),
    mkdirp = require('mkdirp');


var download = function(uri, filename, callback) {
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

download('http://www.edited.de/assets/uploads/grid/small_00006914.jpg', 'google.png', function() {
    console.log('done');
});
