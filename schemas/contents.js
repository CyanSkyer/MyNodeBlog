/**
 * Created by 王勇超 on 2018/4/12.
 */

var mongoose = require('mongoose');

//内容的表结构
module.exports = new mongoose.Schema({
    //内容分类的id - 关联字段
    category:{
        type : mongoose.Schema.Types.ObjectId,
        //引用
        ref : 'Category',
    },

    //内容标题
    title : String,

    //用户的id - 关联字段
    user:{
        type : mongoose.Schema.Types.ObjectId,
        //引用
        ref : 'User',
    },

    //添加时间
    addTime:{
        type: Date,
        default:new Date(),
    },

    //点击量,阅读量
    views:{
        type:Number,
        default:0
    },


    //简介
    description : String,

    //内容
    content : String,

    //评论
    comments :{
        type : Array,
        default:[]
    }
})