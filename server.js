var express = require('express'),
    stylus = require('stylus'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose');

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var app = express();

function compile(str, path) {
    return stylus(str).set('filename', path);
}

app.set('views', __dirname + '/server/views');
app.set('view engine', 'jade');
app.use(logger('dev'));
//app.use(bodyParser()); // deprecated;  see http://stackoverflow.com/questions/24330014/bodyparser-is-deprecated-express-4
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(stylus.middleware(
    {
        src: __dirname + '/public',
        compile: compile
    }
));
app.use(express.static(__dirname + '/public'));

var dbConnection = 'mongodb://';
if(env === 'development') {
    dbConnection += 'localhost/mv1';
} else {
    dbConnection += 'acox:mv2@ds027741.mongolab.com:27741/mv2';
}
mongoose.connect(dbConnection)
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error...'));
db.once('open', function callback() {
    console.log('database connected');
});
var messageSchema = mongoose.Schema({message: String});
var Message = mongoose.model('Message', messageSchema);
var mongoMessage;
Message.findOne().exec(function(err, messageDoc) {
    if(err) {
        console.log('error');
    }
    if(messageDoc==null) {
        console.log('no data');
    } else {
        mongoMessage = messageDoc.message;
        console.log('message: ' + mongoMessage);
    }
});
//mongoMessage = new Message({message: 'message2'});
//mongoMessage.save(function(err, mongoMessage) {
//    if (err) return console.log('save error: ' + err);
//    console.log('save successful: ' + mongoMessage.message)
//});
//console.log('message: ' + mongoMessage.message);

app.get('/partials/:partialPath', function(req, res) {
    res.render('partials/' + req.params.partialPath);
});

app.get('*', function(req, res) {
    res.render('index', {
        mongoMessage: mongoMessage
    });
});

var port = process.env.PORT || 3030;
app.listen(port);
console.log('Listening on port ' + port + '...');