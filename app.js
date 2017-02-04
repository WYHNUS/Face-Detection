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

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// entry page
app.get('/', function(req, res) {
	res.render('home', {
		scripts: ['javascripts/displayImage.js']
	});
});

// display processed image
app.post('/', upload.single('camera-input'), function(req, res) {
	cv.readImage(req.file.path, function(err, img) {
		if (err) {
			resError(res, err);
		} else if (img.width() < 1 || img.height() < 1) {
			resError(res, new Error('Image has no size'));
		} else {
			img.detectObject(cv.FACE_CASCADE, {}, function(err, faces) {
				if (err) {
					resError(res, err);
				} else {
					for (var i in faces) {
						var face = faces[i];
  						img.ellipse(face.x + face.width/2, face.y + face.height/2, 
  									face.width/2, face.height/2);
					}
					var imgUrl = '/tmp/uploads/' + req.file.filename.replace('input', 'output') + '.jpg';
					img.save('public' + imgUrl);
					res.render('result', {
						detectedFaces: faces.length,
						imageUrl: imgUrl
					});
				}
			});
		}
	});
});

function resError(res, err) {
    return res.status(500).json({
        message: err.message
    });
}

http.createServer(app)
	.listen(port, function(server) {
		console.log('Listening on port %d', port);
	});