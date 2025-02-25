var express = require('express');
var app = express();

var port = 3001;
var path = __dirname;
app.use(express.static(path));
app.get('/new/:id', function(req, res) {
    res.sendFile(path + '/newJourney.html');
});
app.get("/:id/*", function(req, res) {
    res.sendFile(path + '/prevJourney.html');
});
app.listen(port);