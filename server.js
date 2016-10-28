var express = require("express")
var app = express()

app.get('*', function(req, res){
    
    res.end("Test")
})

app.listen(process.env.PORT || 8080)