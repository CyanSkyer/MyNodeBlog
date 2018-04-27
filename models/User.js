/**
 * Created by 王勇超 on 2018/4/12.
 */

var mongoose = require('mongoose');

var userSchema = require('../schemas/users');

module.exports = mongoose.model('User' , userSchema);