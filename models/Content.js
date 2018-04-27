/**
 * Created by 王勇超 on 2018/4/12.
 */

var mongoose = require('mongoose');

var contentsSchema = require('../schemas/contents');

module.exports = mongoose.model('Content' , contentsSchema);