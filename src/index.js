var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var tress = require('tress');

var helpers = require('./helpers');

var airportsPageLink = 'https://en.wikipedia.org/wiki/List_of_international_airports_by_country';
var airportsData = [];

var queue = tress(function (airportRequestJob, callback) {
    console.log('Parsed ', queue.finished.length, ' airport links');
    var link = 'https://en.wikipedia.org' + airportRequestJob.link;

    request(link, function (error, response, body) {
        if(error){
            console.log(link);
            console.log(error);
        }

        if(body){
            var loadeadAirportPage = cheerio.load(body);
            var geoCoords = loadeadAirportPage('.geo-dms').first();
    
            var airportData = airportRequestJob.airportData;
    
            var decimalLatitude = helpers.convertDmsToDecimalDegrees(
                geoCoords.find('.latitude').text()
            );
            var decimalLongitude = helpers.convertDmsToDecimalDegrees(
                geoCoords.find('.longitude').text()
            );

            airportData.latitude = decimalLatitude;
            airportData.longitude = decimalLongitude;

            airportsData.push(airportData);
    
            callback();
        }        
    });
});

request(airportsPageLink, function (error, response, body) {
    if (error) {
        console.log('Error: ', error);
        return;
    }

    var $ = cheerio.load(body);
    var airportRows = $('.wikitable tr:not(:nth-child(1))');

    airportRows.each(function (i, element) {
        var cells = $(this).find('td');
        var airportData = {
            location: cells.eq(0).text().trim(),
            name: cells.eq(1).text().trim(),
            code: cells.eq(2).text().trim(),
            latitude: null,
            longitude: null,
        };

        var airportLink = cells.eq(1).find('a').first().attr('href');
        if(airportLink){
            var airportRequestJob = {
                airportData: airportData,
                link: airportLink
            };
    
            queue.push(airportRequestJob);
        }        
    });

    queue.drain = function () {
        fs.writeFileSync('./airports-data.json', JSON.stringify(airportsData, null, 4));
    };

    queue.error = function(job) {
        console.log('error', job);
    }    
});