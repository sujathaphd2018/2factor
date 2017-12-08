var express = require('express');
const { imgDiff } = require('img-diff-js');
const multer = require("multer");
const path = require("path");

var exec = require('child_process').exec;
var fetch = require('node-fetch');
var request = require('request');


var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/upload');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

var upload = multer({
  storage: storage,
  fileFilter: function(req, file, cb) {
    if (path.extname(file.originalname) !== ".png") {
      return cb(new Error("Only png file images are allowed"));
    }
    cb(null, true);
  }
}).single("terms");


var storage1 = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/upload/temp');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

var upload1 = multer({
  storage: storage1,
  fileFilter: function(req, file, cb) {
    if (path.extname(file.originalname) !== ".png") {
      return cb(new Error("Only png file images are allowed"));
    }
    cb(null, true);
  }
}).single("terms");

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/compare-user-auth-image', function(req, res, next) {
//C:\Users\sannelson\Documents\js\2factor\public\upload\temp\1512669063185.png C:\Users\sannelson\Documents\js\2factor\public\upload\1512668140074.png
imgDiff({
  actualFilename: 'public/upload/temp/1512669063185.png',
  expectedFilename: 'public/upload/1512668140074.png',
  diffFilename: 'example/diff.png',
}).then(function(response){
	 console.log(response,err)
   console.log(err)
	  res.send(response);
});


  
});

router.post('/verifyImage', function(req, res, next) {
  var id = req.query.id;
  var oldFile = req.query.image;
  console.log("hit :" + id)
  upload1(req, res, function(err) {
    if(!req.file) {
     res.json({ msg: "File uploaded failed", status: false });
     return;
    }
     var file = req.file;
     console.log(file)
     function puts(error, stdout, stderr) { sys.puts(stdout) }
        var p = path.join(__dirname, '../public/upload/temp/');
        var newImage = p+file.filename
        var oldImage = path.join(__dirname, '../public/upload/') + oldFile;
        
        var cmd ="xor-file "+oldImage+" --seed 40 --output "+p+'compare.png'
        //console.log(cmd);  
        console.log(newImage, oldImage);
        exec(cmd, function(error, stdout, stderr) {
          if (!error) {
            // things worked!
            console.log(stdout)
            imgDiff({
              actualFilename: 'public/upload/temp/compare.png',
              expectedFilename: 'public/upload/temp/'+file.filename,
              diffFilename: 'example/diff.png',
            }).then(function(response){
                res.json(response);
            });

          } else {
            console.log(stderr)
            res.json({msg:"failed"});
          }
        });

    
  });
});



router.post('/upload', function(req, res, next) {
  var id = req.query.id;
  console.log("hit :" + id)
  upload(req, res, function(err) {
    if(!req.file) {
     res.json({ msg: "File uploaded failed", status: false });
     return;
    }
     var file = req.file;
     console.log(file)
     function puts(error, stdout, stderr) { sys.puts(stdout) }
        var p = path.join(__dirname, '../public/upload/');
        var cmd ="xor-file "+p+file.filename+" --seed 40 --output "+p+file.filename
        console.log(cmd);  
        exec(cmd, function(error, stdout, stderr) {
          if (!error) {
            // things worked!
            console.log(stdout)
            var _user= {
                "imageName" : file.filename,
                "imagePath" : p+file.filename
              }

            var options = {
                method: 'POST',
                url: "http://localhost:8080/update-user/"+id,
                headers: {
                    'content-type': 'application/json'
                },
                json: _user
            };
            console.log("===============")

            console.log(options)
            request(options, function (error, response, body) {
              //console.log(response)
               console.log("===============")
               console.log(body)
               console.log("===============")
            });
          } else {
            console.log(stderr)
            // things failed :(
          }
        });


     res.json({ msg: "File uploaded", status: true });
  });
});



module.exports = router;
