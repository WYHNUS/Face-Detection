var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var multer = require('multer');
var cv = require('opencv');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/tmp/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
});
var upload = multer(
	{ storage: storage }
);

var port = 8088;
var app = express();
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/processImage', upload.single('camera-input'), function(req, res) {
	console.log(req.file);
	cv.readImage(req.file.path, function(err, img) {
		if (err) {
			console.log(err);
		} else {
			const width = img.width();
			const height = img.height();
			if (width < 1 || height < 1) {
				console.log('Image has no size');
			} else {
				img.detectObject(cv.FACE_CASCADE, {}, function(err, faces) {
					if (err) {
						console.log(err);
					} else {
						console.log(faces);
					}
				});
			}
		}
	});
});

app.use('/', function(req, res) {
	res.render('home', {
		scripts: ['javascripts/displayImage.js']
	});
});

http.createServer(app)
  .listen(port, function(server) {
    console.log('Listening on port %d', port);
  });