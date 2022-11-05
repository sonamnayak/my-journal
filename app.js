const express = require('express');
const bodyParser = require('body-parser')
const ejs = require('ejs');
const env = require('dotenv');
const mongoose = require('mongoose');
env.config();
const Post = require('./models/Post');
const User = require('./models/User');
const bcrypt = require('bcrypt')
const saltRounds = 12;

mongoose.connect(process.env.MONGO_URL)
        .then(() => console.log('DB connection successful'))
        .catch((err) => console.log(err));

let posts= [];

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get('/', function(req, res){
	res.render('register');
})

app.get('/register', function(req, res){
	res.render('register');
})

app.get('/login', function(req, res){
	res.render('login');
})

app.get('/home', async function(req, res){
	const allPosts = await Post.find()
    posts = [];
    allPosts.map((post) => posts.push(post))
    res.render('home', {posts: posts});

})

app.post('/register', async function(req, res){
	bcrypt.hash(req.body.password, saltRounds, function(err, hash){
		const newUser = new User({
			email: req.body.email,
			password: hash
		})
		newUser.save(function(err){
			if(err){
				console.log(err);
        res.redirect('/register')
			}
			else{
				res.redirect('/home');
			}
		})
	})
})

app.post('/login', function(req, res){
	const email = req.body.email;
	const password = req.body.password  ;
	User.findOne({email:email}, function(err, foundUser){
		if(err){
			console.log(err);
      res.redirect('/login')
		}
		else{
			if(foundUser){
				bcrypt.compare(password, foundUser.password, function(err, result){
					if(result == true){
						res.redirect('/home');
					}
				})
			}
		}
	})
})

app.get('/compose', function(req,res){
  res.render('compose');
});

app.post('/compose', async function(req,res){
  const post = new Post(
    {
      title: req.body.postTitle,
      body: req.body.postBody,
    }
  )
  try {
    await post.save()
  } catch (error) {
    console.log(error);
  }
  res.redirect("/");
});

app.get('/posts/:postName', function(req,res){
  const requestedTitle = _.lowerCase(req.params.postName);
  posts.forEach(function(post){
    const storedTitle= _.lowerCase(post.title);
    if(storedTitle === requestedTitle){
      res.render('post', {postTitle: post.title, postContent: post.body});
    }
  })
});



app.listen(2000, function() {
  console.log('Server started on port 2000');
});