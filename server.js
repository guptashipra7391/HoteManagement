/**
 * Created by ajayguptapnp on 13-06-2017.
 */
// set up ========================
var express = require('express');
var app = express();                               // create our app w/ express
var mongoose = require('mongoose');                     // mongoose for mongodb
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)

// configuration =================
mongoose.connect('mongodb://127.0.0.1:27017', function (err, db) {
    console.log(db)
});     // connect to mongoDB database on modulus.io


//
app.use(express.static(__dirname + '/app'));                 // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended': 'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({type: 'application/vnd.api+json'})); // parse application/vnd.api+json as json
app.use(methodOverride());

// listen (start app with node server.js) ======================================
app.listen(8080);
console.log("App listening on port 8080");
var HotelData = mongoose.model("HotelTable", {
    'name': String,
    'location': {
        'addressLine1': String,
        'city': String,
        'state': String,
        'postalCode': String,
        'country': String,
        'coordinates': [
            Number,
            Number
        ]

    },
    description: String
})


// create todo and send back all todos after creation
app.post('/api/createHotel', function (req, res) {

    // create a todo, information comes from AJAX request from Angular

    console.log(req.body)
    req.body.address = JSON.parse(req.body.address)
    var cordinates = []
    cordinates[0] = req.body.address.latitude;
    cordinates[1] = req.body.address.longitude;
    HotelData.create({
        'name': req.body.name,
        'location': {
            'addressLine1': req.body.address.addressLine1,
            'city': req.body.address.city,
            'state': req.body.address.state,
            'postalCode': req.body.address.postalCode,
            'country': req.body.address.country,
            'coordinates': cordinates
        },
        description: req.body.description
    }, function (err, todo) {
        if (err)
            res.send(err);

        // get and return all the todos after you create another
        HotelData.find(function (err, todos) {
            if (err)
                res.send(err)
            res.json(todos);
        });
    });

});
// get all todos
app.get('/api/searchHotels', function (req, res) {

        // use mongoose to get all todos in the database
        var searchKey = req.query.key
        console.log(searchKey)
        var condition = {};
        if (searchKey) {
            searchKey = escapeRegExp(searchKey);
            var searchExp = new RegExp(searchKey.toLowerCase(), "i")
            condition = {
                '$or': [
                    {name: searchExp},
                    {description: searchExp},
                    {'location.addressLine1': searchExp}
                ]
            }


            console.log(condition)
        }
        ;
// for escaping regular expressions
        function escapeRegExp(str) {
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        }

        HotelData.find(condition, null, {limit: 3}, function (err, hotels) {
            console.log(hotels)
            //{ $text: { $search: req.query.param} },
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(hotels); // return all todos in JSON format
        });
    }
);
app.get('/api/getHotelById', function (req, res) {

        // use mongoose to get all todos in the database

        HotelData.findOne({_id:req.query.key}, function (err, hotel) {
            console.log(hotel)
            //{ $text: { $search: req.query.param} },
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(hotel); // return all todos in JSON format
        });
    }
);
