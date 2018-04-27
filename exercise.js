/**
 * Created by 王勇超 on 2018/4/11.
 */


//用作练习，温故知新


var express = require('express');
var swig = require('swig');

var app = express();

app.engine('html' , swig.renderFile);
app.set('views' , './views');
app.set('view engine' , 'html');
swig.setDefaults({cache:false});

app.use('/public' , express.static(__dirname + '/public/'))



app.use('/a' ,function (req , res , next) {
    res.render('index');
})

app.listen(8484);