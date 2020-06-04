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
    Label:String,
    created: {type: Date, default: Date.now},
    dueDate: Date,
    author:{
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
})

var Todo = mongoose.model('Todo', todoSchema);
//user schema
var UserSchema = new mongoose.Schema({
    name: String,
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
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});

//routes
//home page
app.get('/', function(req, res){
    if(req.isAuthenticated()){
        res.redirect('/todo')
    }else{
        res.redirect('/login')
    }
})

//show todos
app.get('/todo', isLoggedIn, function(req, res){
    
    var label=req.query.Label;
    var date=req.query.dueDate;
    if(label=="noval" || !label)
    {
        label="\/*"
    }
    if(!date)
    {
        Todo.find({Label: { $regex: label, $options: 'i'}},function(err,found){
            if(err)
            {
                console.log(err)
            }
            else{
               return res.render('todo',{todo:found})
            }
        })
        
    }
    else{
    console.log(date)
    Todo.find({Label: { $regex: label, $options: 'i'},dueDate: { $gte: new Date(new Date(date).setHours(00, 00, 00)), $lte:   new Date(new Date(date).setHours(23,59,59))}},function(err,found){
        if(err)
        {
            console.log(err)
        }
        else{
            res.render('todo',{todo:found})
        }
    })
    }
});
//add new todo logic handeler
app.post('/todo', isLoggedIn, function(req, res){
    var title= req.body.title;
    var dueDate = req.body.dueDate
    var author= {
        id: req.user._id,
        username: req.user.username
    }
    var label= req.body.Label
    var newTodo={title: title,Label : label, dueDate: dueDate, author: author}
    Todo.create(newTodo, function(err, newTodo){
        if(err){
            res.redirect('/')
            console.log(err)
        }
        res.redirect('/')
    })
})
//archived todos
app.get('/archive', isLoggedIn, function(req, res){
    Todo.find({'status': 'archive'}, function(err, todo){
        if(err){
            console.log(err)
            res.redirect('/')
        }
        res.render('archive', {todo: todo})
    })
})
//make todos archive or active logic handeler
app.put('/todo/:id', isLoggedIn, function(req, res){
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


//filter feature
app.get("/filter",isLoggedIn,function(req,res){
    res.render('filter')
})






//auth routes
//user registration routes
app.get('/register', function(req, res){
    res.render('register')
})
//user register handeling
app.post('/register', function(req, res){
    var newUser = new User({username: req.body.username})
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err)
            res.redirect('/register')
        }
        passport.authenticate('local')(req, res, function(){
            console.log(user.name)
            res.redirect('/')
        })
    })
})

//show login form
app.get('/login', function(req, res){
    res.render('login')
})

//handling login logic
app.post('/login', passport.authenticate('local',
{
    successRedirect: '/',
    failureRedirect: '/login'
}), function(req, res){})

//logout
app.get('/logout', function(req, res){
    req.logOut()
    res.redirect('/')
})

//middlewares
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
      return next();
    }
    res.redirect("/login");
}



app.listen(8000, function(){
    console.log('list server is up and running')
})