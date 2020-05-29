const express = require('express'),
app = express(),
mongoose = require('mongoose')
port = process.env.PORT || 3000;

app.set('view engine', 'ejs')

app.get('/', function(req, res){
    res.render('home')
});

app.listen(port, function(){
    console.log('list server is up and running')
})