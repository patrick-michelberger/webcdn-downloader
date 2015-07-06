var Downloader = require('./lib/downloader.js');


Downloader.load('http://www.edited.de/assets/uploads/grid/small_00006914.jpg', function() {
    console.log('done');
});