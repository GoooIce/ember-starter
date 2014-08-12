var express = require('express');
var router = express.Router();

var Post = require('../model/').Post;

/**
  Ember Router Config
  App.Router.map(function() {
    this.resource('about');

    this.resource('posts', function () {
      this.route('view', {path : ':post_id'});  // 查看
      this.route('new');                          // 新增
    });
  });

   Action	HTTP Verb	URL API
   Find	GET	/posts/:id this.store.find('post', id);
   Find All	GET	/posts this.store.find('post');
   Update	PUT	/posts/:id this.model.save();
   Create	POST	/posts this.model.save();
   Delete	DELETE	/posts/:id   this.model.destroyRecord();
*/



router.get('/posts', function (req, res) {
  Post.find(function (err, posts) {
    if (err) return res.status(500).send(err.message);

    res.status(200).json({
      posts: posts,
      meta  : {
        'total': posts.length
      }
    });
  });
});

router.get('/posts/:id', function (req, res) {
  Post.findById(req.params.id, function (err, post) {
    if (err) return res.status(500).send(err.message);

    res.status(200).json({
      post: post
    });
  });
});

router.put('/posts/:id', function (req, res) {
  Post.findByIdAndUpdate(req.params.id, req.body.post,function (err, post) {
    if (err) return res.status(500).send(err.message);

    res.status(200).end();
  });
});

router.delete('/posts/:id', function (req, res) {
  Post.findByIdAndRemove(req.params.id, function (err, post) {
    if (err) return res.status(500).send(err.message);

    res.status(200).end();
  });
});

router.post('/posts', function (req, res) {
  var post = new Post({
    title: req.body.post.title || '就是没名字',
    author: req.body.post.author || 'GoooIce',
    intro : req.body.post.intro || '就是没简介',
    extended: req.body.post.extended || '神马都木有'
  });
  post.save(function(err) {
    if (err) return res.status(500).send(err.message);

    res.status(200).send({ post: post });
  })
});

module.exports = router;
