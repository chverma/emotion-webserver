var express = require('express');
var router = express.Router();
var util = require("util"); 
var fs = require("fs");
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
		//res.render('index', { title: 'Express'});
		res.redirect("/captureImage");
});
router.get('/captureImage', function(req, res, next) {
	res.render('captureImage', { title: 'Capture Image and upload' });
});

router.post('/captureImage', function(req, res, next) {
	//console.log("FormData "+ req.body.base64);
	console.log("hola");
	var emotion = req.body.emotion;
	var base64Data = req.body.base64.replace(/^data:image\/png;base64,/, "");
    var timestamp = new Date().getTime();
    
	fs.writeFile("uploads/"+emotion+"/web"+ timestamp +".png", base64Data, 'base64', function(err) {
		if(err){
		    
			console.log("error writing file: "+err);
		}else{
			res.send(JSON.stringify({'status': 1, 'msg': 'Image Uploaded'}));
		}
	});
});


module.exports = router;
