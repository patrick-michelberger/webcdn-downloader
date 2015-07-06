var Downloader = require('./lib/downloader.js');

Downloader.load('https://secure-i1.ztat.net//camp/68/ae/b05db993d41d33bb22401f68a0c0.jpg', function(err) {
	if (err) {
		console.log("Error: ", err);
	} else {
	    console.log('S3 upload finished!');
	}
});