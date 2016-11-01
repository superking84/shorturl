var express = require("express")
var mongodb = require("mongodb")
var MongoClient = mongodb.MongoClient
var ID_RANGE = 9000

// adjust below before putting into production

function getUnusedID(range, usedIDs){
    // return a random four-digit number not found in a provided
    // list of numbers
    var output
    do {
        output = Math.floor(Math.random() * range) + 1000
    } while (usedIDs.indexOf(output) !== -1)
    
    return output
}

function isValidURL(input){
    var urlRE = /^http:\/\/.+\...+.*/
    return urlRE.test(input)
}

var app = express()

// make sure to use res.end() after all paths, otherwise it will continue
// checking possible routes
app.get('/add/*', function(req, res){
    var hostURL = `http://${req.headers.host}`
    var url = req.params['0']
    var output
    if(!isValidURL(url)){
        var error = {
            error: 'This is not a valid URL.'
        }
        res.end(JSON.stringify(error))
    } else {
        MongoClient.connect(process.env.MONGOLAB_URI, function(err, db){
            if(err) throw err
            
            var urls = db.collection('urls')
            
            urls.find().toArray(function(err, docs){
                if(err) throw err
                var indexes = docs.map(function(doc){
                    return doc['shorturl']
                })
                var validUrl = docs.filter(function(doc){
                    return doc['fullurl'] === url
                })
                if (validUrl.length > 0){
                    var result = validUrl[0]
                    output = {
                        fullurl: result.fullurl,
                        shorturl: `${hostURL}/${result.shorturl}`
                    }
                    db.close()
                } else {
                    var index = getUnusedID(ID_RANGE, indexes)
                    output = {
                        fullurl: url,
                        shorturl: `${hostURL}/${index}`
                    }
                    
                    urls.insertOne({
                        fullurl: url,
                        shorturl: index
                    }, function(err, result){
                        if(err) throw err
                        
                        db.close()
                    })
                    
                }
                res.end(JSON.stringify(output))
            })
        })
    }
})

app.get('*', function(req, res){
    
    var url = req.url.slice(1)
    if (isNaN(url)){
        res.end(JSON.stringify({
            'error': 'This is not a valid shortened URL.'
        }))
    } else {
        url = parseInt(url)
        var output
        MongoClient.connect(process.env.MONGOLAB_URI, function (err, db) {
            if (err) throw err
          
            var urls = db.collection('urls');
            urls.find().toArray(function(err, docs){
                if(err) throw err
                var indexes = docs.map(function(doc){
                    return doc['shorturl']
                })

                if(indexes.indexOf(url) === -1){
                    var message = '<h1>Hey!</h1>'
                    message += "<p>Here's how to use this app:</p>"
                    message += "<p>https://fcc-api-projects-superking84.c9users.io/add/yourURL</p>"
                    message += "<p>This will shorten the URL provided (make sure to add http://)</p>"
                    message += "<p>Once you have your code, you can then use it like so: https://fcc-api-projects-superking84.c9users.io/CODE</p>"
                    message += "<p>And you will go to the website associated with that code!</p>"
                    
                    res.end(message)
                } else {
                    var fullurl = docs.filter(function(doc){
                        return doc['shorturl'] === url
                    })[0]['fullurl']
                    
                    res.redirect(fullurl)
                }
                db.close()
            })
        })
    }
    
})

app.listen(process.env.PORT || 8080)