const express = require('express'),
bodyParser  = require("body-parser"),
app = express(),
mongoose = require('mongoose'),
methodOverride = require('method-override'),
passport = require('passport'),
LocalStrategy = require('passport-local'),
passportLocalMongoose = require('passport-local-mongoose'),
port = process.env.PORT || 3000;
//mongodb database connection
mongoose.connect("mongodb://localhost/todo", {useFindAndModify: false,useUnifiedTopology: true,useNewUrlParser: true});

//app setup
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended:true}))
app.use(methodOverride('_method'))

//database schema creations
var todoSchema = new mongoose.Schema({
    title:String,
    status: String,
    created: {type: Date, default: Date.now},
    dueDate: Date
})

var Todo = mongoose.model('Todo', todoSchema);
//user schema
var UserSchema = new mongoose.Schema({
    username: String,
    password: String
})
UserSchema.plugin(passportLocalMongoose)
var User = mongoose.model('User', UserSchema)
// Todo.create({title: 'work from home'}, function(err, todo){
//     if(err){
//         console.log(err)
//     }else{
//         console.log(todo)
//     }
// })
//passport configuration
app.use(require('express-session')({
    secret: 'Once again pkmb',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


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
    Todo.create(req.body.todo, function(err, newTodo){
        if(err){
            res.redirect('/')
            console.log(err)
        }
        res.redirect('/')
    })
})

app.get('/archive', function(req, res){
    Todo.find({'status': 'archive'}, function(err, todo){
        if(err){
            console.log(err)
            res.redirect('/')
        }
        res.render('archive', {todo: todo})
    })
})

app.put('/:id', function(req, res){
    console.log(req.body)
    console.log(req.params.id)
    Todo.findByIdAndUpdate(req.params.id, req.body.todo, function(err, updatedTodo){
        if(err){
            console.log(err)
            res.redirect('/')
        }
        console.log(updatedTodo)
        res.redirect('back')
    })
})

app.listen(port, function(){
    console.log('list server is up and running')
})