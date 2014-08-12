var mongoose = require('mongoose'),
Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

mongoose.connect(require('../config.js').dbUrl);

mongoose.set('debug', true);

//title: attr('string'),
//  author: attr('string'),
//  intro: attr('string'),
//  extended: attr('string'),
//  publishedAt: attr('date')

var PostSchema = new Schema({
  title: String,
  author: String,
  intro : String,
  extended: String,
  publishedAt : {type:Date ,default:Date.now()}
});

exports.Post = mongoose.model('Post', PostSchema);