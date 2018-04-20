const db = require ('../../database/database.js');
const passport = require('../middleware/passport.js');

const post = {};
const get = {};

post.signup = (req, res) => {
  if (!db.saveUser(req.body)) {
    res.end('Username already exists')
  } else {
    res.end('User successfully created')
  }
};

post.login = (req, res, next) => {
  console.log('attempting login ')
  passport.authenticate('local', function (err, user, info) {
    if (err || !user) {
      res.status(422).send(info);
    } else {
      // Remove sensitive data before login
      user.password = undefined;
      user.salt = undefined;

      req.login(user, function (err) {
        if (err) {
          res.status(400).send(err);
        } else {
          console.log(user);
          res.json(user);
        }
      });
    }
  })(req, res, next);
};

get.logout = (req, res) => {
  req.logout();
  req.session.destroy();
  console.log('session destroyed');
  return res.redirect('/');
}

get.loggedInYet = (req, res) => {
  if (req.user) {
    console.log(req.user);
    res.json(req.user);
  } else {
    console.log('user not logged in');
  }
}

post.upload = function(req, res){
  console.log('uploading...');
  console.log(req.body);
  db.savePicture(req.body, function(err, data) {
    if (err) {
      res.sendStatus(500);
    } else {
      console.log('uploaded!');
      // console.log(data);
      res.sendStatus(200);
    }
  })
};

get.upload = function(req, res) {
  console.log('displaying...');
  db.selectAllPictures(function(err, data) {
    if(err) {
      res.sendStatus(500);
    } else {
      console.log(data);
      res.json(data);
    }
  });
};

get.userLikes = (req, res) => {
  if (req.user) {
    let userLikes = db.fetchUserPosts(req.user);
    console.log(userLikes);
    res.json(userLikes);
  } else {
    console.log('error in controller // get.userlikes');
  }
}

get.userPosts = (req, res) => {
  if (req.user) {
    let userPosts = db.fetchUserPosts(req.user);
    console.log(userPosts);
    res.json(userPosts);
  } else {
    console.log('error in controller // get.userPOSTS');
  }
}

module.exports.get = get;
module.exports.post = post;