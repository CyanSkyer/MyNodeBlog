/**
 * Created by 王勇超 on 2018/4/12.
 */
//首页路由

var express = require('express');
var router = express.Router();
var Category = require('../models/Category');
var Content = require('../models/Content')

var data = {};
/*
* 通用信息整合
 */
router.use(function (req,res,next) {
    data = {
        userInfo : req.userInfo,
        categories:[],
        latestcommentsarr:[],
    }
    //读取所有的分类信息，并展现在导航栏
    Category.find().then(function (categories) {
         data.categories = categories

    })

    //最热文章
    Content.find({title:{$ne:"留言板"}}).sort({views:-1}).limit(5).populate(['category' , 'user']).then(function (hotcontents) {
        data.hotcontents = hotcontents;
    })

    //最新评论
    var tmparr = new Array();
    Content.findOne({
        title:'留言板'
    }).populate(['category','user']).then(function (content) {
        // data.latestcomments = content.comments;
        tmparr = content.comments;
        for(var i=0;i<3;i++){
            data.latestcommentsarr[i] = tmparr[i];
        }
        next();
    })
})
/*
* 首页显示
 */
router.get('/' ,function (req ,res ,next) {

        data.category = req.query.category || '';
        data.content = {};
        data.page = Number(req.query.page || 1);
        data.totalpages = 0 ;//总页数
        data.coutn = 0;//数据总数
        data.limit =5;
        data.pagearr =[];

        //添加年份归档
        data.year = req.query.year || "";


    //where用做find的判定条件
    var where = {};
    if(data.category){
        where.category = data.category;
    }

    //归档年份的逻辑，另外gte是>=，lte是<=
    var startyear = new Date(2017,0,1);
    var endyear = new Date();
    if(data.year){
        //判定按年份查找
        startyear = new Date(data.year,0,1);
        endyear = new Date(data.year,11,31);
    }





    Content.where(where).where("addTime").gte(startyear).lte(endyear).count().then(function (count) {
        data.count = count;
        //计算总页数
        data.totalpages = Math.ceil(data.count/data.limit);
        //取值不能超过总页数
        data.page = Math.min(data.page , data.totalpages);
        //取值不能小于1
        data.page = Math.max(data.page,1);

        var skip = (data.page - 1 )*data.limit;

        //循环记录页数的数组
        for(var i=1;i<=data.totalpages;i++){
            data.pagearr.push(i);
        }

        return Content.where(where).where("addTime").gte(startyear).lte(endyear).find().sort({addTime : -1}).limit(data.limit).skip(skip).populate(['category' , 'user']);
    }).then(function (contents) {
        data.contents = contents;
        res.render('main/index' , data);
    })
})


//阅读全文管理
router.get('/view' , function (req,res,next) {
    var contentId = req.query.contentId ;
    Content.findOne({
        _id:contentId
    }).populate(['category','user']).then(function (content) {
        data.content = content;
        //处理阅读数
        content.views++;
        content.save();
        res.render('main/view',data)
    })
})

//留言板处理
router.get('/messboard',function (req ,res ,next) {
    var contentname = 'messboard';
    Content.findOne({
        title:'留言板'
    }).populate(['category','user']).then(function (content) {
        data.content = content;
        res.render('main/messboard',data)
    })
})

//使用手册与更新处理
router.get("/explanation",function (req,res,next) {
    Content.findOne({
        title:'使用手册与更新'
    }).populate(['category','user']).then(function (content) {
        data.content = content;
        res.render('main/explanation',data)
    })
})


module.exports = router;