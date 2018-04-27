/**
 * Created by 王勇超 on 2018/4/12.
 */

var mongoose = require('mongoose');

var categorySchema = require('../schemas/categories');

module.exports = mongoose.model('Category' , categorySchema);