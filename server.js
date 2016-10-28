var express = require("express")
var mongodb = require("mongodb")
var MongoClient = mongodb.MongoClient

var app = express()

app.get('*', function(req, res){
    var url = req.url.slice(1)
    
    MongoClient.connect(process.env.MONGOLAB_URI, function (err, db) {
      var urls = db.collection('urls');
      
      if (err) {
        console.log(process.env.MONGOLAB_URI)
        console.log('Unable to connect to the mongoDB server. Error:', err)
      } else {
        urls.insert({
            url: url
        })
        console.log('Connection established to', process.env.MONGOLAB_URI)
    
        // do some work here with the database.
    
        //Close connection
        db.close()
      }
    })
    
    res.end("Test")
})

app.listen(process.env.PORT || 8080)