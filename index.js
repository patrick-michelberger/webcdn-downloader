var fs = require('fs'),
    url = require('url'),
    path = require('path'),
    request = require('request'),
    mkdirp = require('mkdirp');


var download = function(uri, filename, callback) {
    var parsed_uri = url.parse(uri);
    var parsed_path = parsed_uri.path;

    console.log("parsed_uri: ", parsed_uri);

    /*
    if (parsed_path.charAt(0) === '/')
        parsed_path = parsed_path.slice(1);
	*/

    request.head(uri, function(err, res, body) {
        var filename = path.basename(parsed_path),
            dirname = path.dirname(parsed_path);
        var dir = parsed_uri.host + dirname;
        mkdirp(dir, function(err) {
            if (err) console.error(err)
            console.log("write file: ", dir + '/' + filename);
            request(uri).pipe(fs.createWriteStream(dir + '/' + filename)).on('close', callback);
        });
    });

};

download('http://www.edited.de/assets/uploads/grid/small_00006914.jpg', 'google.png', function() {
    console.log('done');
});
