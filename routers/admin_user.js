/**
 * Created by 王勇超 on 2018/4/25.
 */
var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Category = require('../models/Category');
var Content = require('../models/Content')

//用户管理首页
router.get('/' , function (req , res , next) {
    res.render('admin_user/index',{
        userInfo : req.userInfo
    })
})

//用户内容首页
router.get('/content',function (req ,res ,next) {

    var page = Number(req.query.page || 1);
    var limit = 4;
    var totalpages = 0;
    Content.count({user:req.userInfo._id}).then(function (count) {
        //计算总页数
        totalpages = Math.ceil(count/limit);
        //取值不能超过总页数
        page = Math.min(page , totalpages);
        //取值不能小于1
        page = Math.max(page,1);

        var skip = (page - 1 )*limit;

        //循环记录页数的数组
        var pagearr = [];
        for(var i=1;i<=totalpages;i++){
            pagearr.push(i);
        }

        /*
         * populate('属性'):
         * 根据参数，把本表中的参数，根据schema定义的，从外表中读取相关内容
         */

        Content.find({user:req.userInfo._id}).sort({addTime : -1}).limit(limit).skip(skip).populate(['category' , 'user']).then(function (contents) {

            res.render('admin_user/content_index',{
                userInfo : req.userInfo,
                contents : contents,
                user : req.userInfo,
                page : page,
                pagearr : pagearr,
                count :count,
                limit :limit,
            })
            // console.log(users);
        })

    })
})


/*
* 用户内容添加
 */
router.get('/content/add',function (req,res,next) {
    //先读取所有分类信息
    Category.find().sort({_id:-1}).then(function (categories) {
        res.render('admin_user/content_add',{
            userInfo:req.userInfo,
            categories:categories
        })
    })
})

/*
* 内容添加后的保存
 */
router.post('/content/add',function (req ,res ,next) {

    var category = req.body.category;
    var title = req.body.title;
    var description = req.body.description;
    var content = req.body.content;

    if(!title){
        res.render('admin/err',{
            userInfo : req.userInfo,
            errmessage : '标题为空'
        })
    }
    if (!description){
        res.render('admin/err',{
            userInfo : req.userInfo,
            errmessage : '简介为空'
        })
    }
    if (!content){
        res.render('admin/err',{
            userInfo : req.userInfo,
            errmessage : '内容为空'
        })
    }

    //保存内容到数据库
    Content.findOne({
        title :title
    }).then(function (value) {
        if(value){
            res.render('admin_user/err',{
                userInfo : req.userInfo,
                errmessage : '添加的内容标题重复',
            })
            return ;
        }else{
            var contents = new Content({
                category:category,
                title :title,
                user : req.userInfo._id,
                addTime : new Date(),
                description:description,
                content:content
            })
            contents.save().then(function () {
                res.render('admin_user/success',{
                    userInfo : req.userInfo,
                    errmessage : '内容保存成功',
                    url : '/admin_user/content',
                })
            });
        }
    })
})

/*
* 用户内容修改
 */
router.get('/content/edit',function (req,res,next) {
    var id = req.query.id || '';
    var categories = [];
    Category.find().sort({_id:-1}).then(function (cate) {
        categories = cate;
        return Content.findOne({
            _id : id
        }).populate('category')
    }).then(function (content) {
        if(!content){
            res.render('admin_user/err',{
                userInfo : req.userInfo,
                errmessage : '内容不存在',
            })
            return Promise.reject();
        }else{
            res.render('admin_user/content_edit',{
                userInfo:req.userInfo,
                categories:categories,
                content : content,
            })
        }
    })
})
/*
* 修改后保存
 */
router.post('/content/edit',function (req,res,next) {
    var id = req.query.id || '';
    var category = req.body.category;
    var title = req.body.title;
    var description = req.body.description;
    var content = req.body.content;

    if(!title){
        res.render('admin_user/err',{
            userInfo : req.userInfo,
            errmessage : '标题为空'
        })
        return ;
    }else
    if (!description){
        res.render('admin_user/err',{
            userInfo : req.userInfo,
            errmessage : '简介为空'
        })
        return ;
    }else
    if (!content){
        res.render('admin_user/err',{
            userInfo : req.userInfo,
            errmessage : '内容为空'
        })
        return ;
    }

    //获取要修改的分类的信息
    Content.findOne({
        //$ne的意思是不等于
        _id:{$ne:id},
        title:title,
    }).then(function (sameTitle) {
        if(sameTitle){
            res.render('admin_user/err',{
                userInfo : req.userInfo,
                errmessage : '已经有相同标题存在'
            })
            return Promise.reject();
        } else{
            //不存在就可以调用保存了
            /*
            * 调用相关的mongoose方法：
            * Catgory.update({a=a},{b=b})，第一个参数是条件，第二个是修改
             */
            return Content.update({
                _id :id
            },{
                category : category,
                title : title,
                description : description,
                content : content,
            })
        }
    }).then(function () {
        res.render('admin_user/success',{
            userInfo : req.userInfo,
            errmessage : '修改成功',
            url : '/admin_user/content',
        })
    }).catch(function (err) {
    })
})
/*
* 内容的删除
 */
router.get('/content/delete',function (req ,res ,next) {
    var id = req.query.id ||'';

    Content.remove({
        _id :id
    }).then(function () {
        res.render('admin_user/success',{
            userInfo : req.userInfo,
            errmessage : '删除成功',
            url : '/admin_user/content',
        })
    })
})

module.exports = router;