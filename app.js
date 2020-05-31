const express = require('express'),
bodyParser  = require("body-parser"),
app = express(),
mongoose = require('mongoose'),
port = process.env.PORT || 3000;
//mongodb database connection
mongoose.connect("mongodb://localhost/todo", {useFindAndModify: false,useUnifiedTopology: true,useNewUrlParser: true});

//app setup
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended:true}))

//database schema creations
var todoSchema = new mongoose.Schema({
    title:String,
    label: String,
    created: {type: Date, default: Date.now},
    dueDate: Date
})

var Todo = mongoose.model('Todo', todoSchema);

// Todo.create({title: 'work from home'}, function(err, todo){
//     if(err){
//         console.log(err)
//     }else{
//         console.log(todo)
//     }
// })


//routes
app.get('/', function(req, res){
    Todo.find({}, function(err, todo){
        if(err){
            console.log(err)
        }else{
            res.render('home', {todo: todo})
        }
    })
});

app.post('/', function(req, res){
    console.log(req)
    Todo.create(req.body.todo, function(err, newTodo){
        if(err){
            res.redirect('/')
            console.log(err)
        }
        res.redirect('/')
    })
})

app.listen(port, function(){
    console.log('list server is up and running')
})