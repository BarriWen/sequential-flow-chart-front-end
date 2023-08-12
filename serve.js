var express = require('express');
var app = express();

var port = 3005;
var path = __dirname;
app.use(express.static(path));
app.get('', function(req, res) {
    res.sendFile(path + '/newJourney.html');
});
app.get('/*', function(req, res) {
    res.sendFile(path + '/prevJourney.html');
});
app.listen(port);