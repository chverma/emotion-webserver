var express = require('express')
var router = express.Router()
var fs = require('fs')
var PythonShell = require('python-shell')

/* GET home page. */
router.get('/', function (req, res, next) {
  // res.render('index', { title: 'Express'});
  res.redirect('/captureImage')
})

router.get('/captureImage', function (req, res, next) {
  res.render('captureImage', { title: 'Capture Image and upload' })
})

router.post('/captureImage', function (req, res, next) {
  // console.log("FormData "+ req.body.base64);
  // var ip = req.body.ip
  // console.log("Image received captureImage from: "+ip);
  var emotion = req.body.emotion
  var base64Data = req.body.base64.replace(/^data:image\/png;base64,/, '')
  var timestamp = new Date().getTime()

  fs.writeFile('uploads/' + emotion + '/web' + timestamp + '.png', base64Data, 'base64', function (err) {
    if (err) {
      console.log('error writing file: ' + err)
    } else {
      res.send(JSON.stringify({'status': 1, 'msg': 'Image Uploaded'}))
    }
  })
})

router.get('/svm', function (req, res, next) {
  // res.render('index', { title: 'Express'});
  res.render('svm', {title: 'SVM'})
})

router.post('/svm', function (req, res, next) {
  // console.log("FormData "+ req.body.base64);
  var emotion = req.body.emotion
  var base64Data = req.body.base64.replace(/^data:image\/png;base64,/, '')
  var timestamp = new Date().getTime()
  var filename = emotion + '/web' + timestamp + '.png'
  fs.writeFile('public/uploads/' + filename, base64Data, 'base64', function (err) {
    if (err) {
      console.log('error writing file: ' + err)
    } else {
      var options = {
        mode: 'text',
        pythonPath: '/usr/bin/python',
        pythonOptions: ['-u'],
        scriptPath: '/home/chverma/UPV/TFG/pythonDlibLendmark',
        args: [filename]
      }
      PythonShell.run('predictOneImage.py', options, function (err, results) {
        if (err) {
          console.log('predictOneImage-> Error')
          throw err
        }
        // results is an array consisting of messages collected during execution
        console.log('results: %j', results.toString())
        var emotionMsg = 'La teua emoció és: ' + results.toString()
        console.log(emotionMsg)
        res.send(JSON.stringify({'status': 1, 'msg': emotionMsg.toString()}))
      })
    }
  })
})

function getFilePath (emotion) {
  var filesPath = 'uploads/' + emotion + '/'
  var filesAdminPath = './public/' + filesPath
  var allFiles = fs.readdirSync(filesAdminPath, function (err, files) {
    if (err) {
      throw err
    }
    return files
  })
  var file = ''
  for (var i = 0; i < allFiles.length; i++) {
    if (allFiles[i].substring(allFiles[i].length - 3, allFiles[i].length) === 'png') {
      file = allFiles[i]
      return filesPath + file
    }
  }
}

router.get('/revisor', function (req, res, next) {
  var emotions = ['fear', 'surprised', 'disgust', 'happy', 'neutral', 'sad']
  var file = ''
  for (var i = 0; i < emotions.length; i++) {
    file = getFilePath(emotions[i])
    if (file) {
      break
    }
  }
  res.render('revisor', {title: 'Revisor', imgPath: file})
})

router.post('/revisor', function (req, res, next) {
  var emotion = req.body.emotion
  var filePath = req.body.filePath
  console.log(emotion)
  console.log(filePath)
})

module.exports = router
