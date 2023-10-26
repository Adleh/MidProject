const express = require('express');
const path = require ('path');
const mongoose = require('mongoose');
const session = require('express-session');
const {check, validationResult} = require('express-validator');
const { render } = require('ejs');
const { Console } = require('console');


const myApp = express();

myApp.use(express.urlencoded({extended:false}));

myApp.set('views', path.join(__dirname, 'views'));
myApp.use(express.static(__dirname+'/public'));
myApp.set('view engine', 'ejs');

myApp.use(express.urlencoded({extended:false}));
myApp.use(session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized: false
})); 

mongoose.connect("mongodb://localhost:27017/PROG8020Project",{
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const User = mongoose.model('User',{
    userName: String,
    password: String
});
const Blog = mongoose.model('Blog', {
    userName: String,
    title: String,
    text: String,
    modifiedAt: Date
});



// ----------------------------GET METHODS---------------------------- //
myApp.get('/', function(req, res){
    var userDt ={
        userName: '',
        loggedIn: false
    }
    if(req.session.loggedIn){
        userDt.userName = req.session.username;
        userDt.loggedIn = true;
    }
    res.render('pages/home', {userDt: userDt});
});
myApp.get('/login', function(req, res){
    var userDt ={
        userName: '',
        loggedIn: false
    }
    if(req.session.loggedIn){
        userDt.userName = req.session.username;
        userDt.loggedIn = true;
    }
    res.render('pages/login', {userDt: userDt});
});
myApp.get('/logout',function(req,res){
    var userDt ={
        userName: '',
        loggedIn: false
    }
    req.session.destroy();
    res.render('pages/home', {userDt: userDt});
});
myApp.get('/allBlogs', function(req, res){
    // Blog.find().then((result) => {
    //     res.send(result);
    // }).catch((err)=>{
    //     console.log(err);
    // });
    var userDt ={
        userName: '',
        loggedIn: false
    }
    if(req.session.loggedIn){
        userDt.userName = req.session.username;
        userDt.loggedIn = true;
    }

    // some database stuff here to show the grid with all the blogs--------
    Blog.find().then((result)=>{
        res.render('pages/allBlogs', {allBlogs: result, userDt: userDt})
    });
    
});
myApp.get('/blog/:id', function(req, res){
    const id = req.params.id;
    Blog.findById(id).then(result =>{
        res.render('pages/details',{blog: result})
    }).catch(err =>{
        console.log(err);
    });
})

// myApp.get('/delete', (req, res)=>{
//     var userDt ={
//         userName: '',
//         loggedIn: false
//     }
//     if(req.session.loggedIn){
//         userDt.userName = req.session.username;
//         userDt.loggedIn = true;
//     }
//     const id = req.params.id;
//     console.log(id);
//     Blog.findByIdAndDelete(id).then(result =>{
//         Blog.find().then((result)=>{
//             res.render('pages/allBlogs', {allBlogs: result, userDt: userDt})
//         });
//     }).catch(err =>{
//         console.log(err);
//     })
// });

// myApp.get('/delete',async(req,res)=>{
//     var userDt ={
//         userName: '',
//         loggedIn: false
//     }
//     if(req.session.loggedIn){
//         userDt.userName = req.session.username;
//         userDt.loggedIn = true;
//     }
    
//     const id = req.params.id;
//     console.log(id);
//     await Blog.findByIdAndDelete(id).then(()=>console.log("Blog has been Deleted"))
//     .catch(err =>{
//         console.log(err);
//     });
//     Blog.find().then((result)=>{
//         res.render('pages/allBlogs', {allBlogs: result, userDt: userDt})
//     });
// });
myApp.get('/delete/:id',async(req,res)=>{
    var userDt ={
        userName: '',
        loggedIn: false
    }
    if(req.session.loggedIn){
        userDt.userName = req.session.username;
        userDt.loggedIn = true;
    }

    const id = req.params.id;
    console.log(id);
    await Blog.findByIdAndDelete(id).then(()=>console.log("Blog has been Deleted"))
    .catch(err =>{
        console.log(err);
    });
    Blog.find().then((result)=>{
        res.render('pages/allBlogs', {allBlogs: result, userDt: userDt})
    });

});
myApp.get('/createBlog', function(req, res){
    var userDt ={
        userName: '',
        loggedIn: false
    }
    if(req.session.loggedIn){
        userDt.userName = req.session.username;
        userDt.loggedIn = true;
    }
    res.render('pages/createBlog', {userDt: userDt});
});
myApp.get('/updateBlog',
    [
        check('blogTitle',"Please enter a title").notEmpty(),
        check('textArea',"Please enter your blog text").notEmpty()
    ],
    function(req, res){
        var userDt ={
            userName: '',
            loggedIn: false
        }
        if(req.session.loggedIn){
            userDt.userName = req.session.username;
            userDt.loggedIn = true;
        }
        const error = validationResult(req);
        const id = req.params.id;
    
        if (!error.isEmpty()){
        res.render('pages/createBlog',{errors:error.array()});
    
        }else{
            const blog=  Blog.findOne(id);
            blog.title = req.body.blogTitle;
            blog.text = req.body.textArea;
            blog.save().then(()=>console.log("Blog has been Updated"));
            Blog.find().then((result)=>{
                res.render('pages/allBlogs', {allBlogs: result, userDt: userDt})
            });
        }
});

myApp.post('/updateBlog',
    [
        check('blogTitle',"Please enter a title").notEmpty(),
        check('textArea',"Please enter your blog text").notEmpty()
    ], async (req,res)=>{
            var userDt ={
                userName: '',
                loggedIn: false
            }
            if(req.session.loggedIn){
                userDt.userName = req.session.username;
                userDt.loggedIn = true;
            }
        
            const error = validationResult(req);
            const id = req.params.id;
        
            if (!error.isEmpty()){
            res.render('pages/createBlog',{errors:error.array()});
        
            }else{
                const blog= await Blog.findOne(id);
                blog.title = req.body.blogTitle;
                blog.text = req.body.textArea;
                blog.save().then(()=>console.log("Blog has been Updated"));
                Blog.find().then((result)=>{
                    res.render('pages/allBlogs', {allBlogs: result, userDt: userDt})
                });
            }

    });
// ----------------------------GET METHODS END---------------------------- //


myApp.post('/createBlog',
    [
        check('blogTitle',"Please enter a title").notEmpty(),
        check('textArea',"Please enter your blog text").notEmpty()
    ],function(req, res, next){
        const error = validationResult(req);
       
        if (!error.isEmpty()){
           res.render('pages/createBlog',{errors:error.array()});
    
        }else{

            
            var userDt ={
                userName: '',
                loggedIn: false
            }
            if(req.session.loggedIn){
                userDt.userName = req.session.username;
                userDt.loggedIn = true;
            }
            
            var newBlog = new Blog ({
                userName: req.session.username,
                title: req.body.blogTitle,
                text: req.body.textArea,
                modifiedAt: Date.now()
            })
            
            newBlog.save().then(()=>console.log("Data is Saved"));
            Blog.find().then((result)=>{
                res.render('pages/allBlogs', {allBlogs: result, userDt: userDt})
            });
    }
});

myApp.post('/login',
    [
    check('username',"Please enter a valid username").notEmpty(),
    check('password',"Please enter a valid Password").notEmpty()
    ],async(req,res)=>{
    
        const error = validationResult(req);       
        if (!error.isEmpty()){
           res.render('pages/login',{errors:error.array()});
    
        }else{
            const userData = await User.findOne({userName:req.body.username});
            console.log(userData);
            if(userData != null){
                if(req.body.password == userData.password){
                    req.session.loggedIn = true;
                    req.session.username = userData.userName;
                }
            }
            var userDt ={
                userName: '',
                loggedIn: false
            }
            if(req.session.loggedIn){
                userDt.userName = req.session.username;
                userDt.loggedIn = true;
                Blog.find().then((result)=>{
                res.render('pages/allBlogs', {allBlogs: result, userDt: userDt})
            });
            }
            else{
                var err ={
                    errorStr: "Please enter an existing username and password"
                }
                res.render('pages/login', err);
            }   
        }  
});









myApp.listen(8080);
console.log("It works");