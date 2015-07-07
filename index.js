// Dependencies
var request = require('request');
var cheerio = require('cheerio');
var Downloader = require('./lib/downloader.js');
var fs = require('fs');

var downloader = new Downloader("webcdn2");

var x = 0;
var loadWebsites = function(websites) {
    var website = websites[x];
    request(website.url, function(error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            var i = 0;
            var loopImages = function(arr) {
                var url = arr[i].attribs['src'];
                downloader.load(url, website.name, function(err) {
                    i++;
                    if (err) {
                        console.log("Error: ", err);
                    } else {
                        console.log('S3 upload finished for: ', url);
                    }
                    if (i < arr.length) {
                        loopImages(arr);
                    } else {
                        x++;
                        if (x < websites.length) {
                            loadWebsites(websites);
                        }
                    }
                });
            };
            loopImages($('img'));
        } else {
            x++;
            if (x < websites.length) {
                loadWebsites(websites);
            }
        }
    });
};

// Main
var websites = JSON.parse(fs.readFileSync('./websites.json', 'utf8'));
loadWebsites(websites);
