/**
 * Created by 王勇超 on 2018/4/12.
 */


var express = require('express');
var router = express.Router();
//拉通数据库模型存储目录
var User = require('../models/User');

var Content = require('../models/Content');
//定义一个统一返回格式
var responseData = {
    code : 0,
    message : ''
};

//初始化处理
// router.use( function (req , res , next) {
//     responseData = {
//         code : 0,
//         message : ''
//     }
//     next();
// })


// router.get('/' ,function (req ,res ,next) {
//     res.send('这是首页')
// })

/*
* 用户注册
* 通过body-parser，就可以获取到req提交过来的数据
* 表现为req.body，是一个json
*
* 注册逻辑
* 1.用户名不能为空
* 2.密码不能为空
* 3.两次密码输入一致
*
* 数据库逻辑
* 1.用户是否已经被注册
*      查询数据库
*
*
 */
router.post('/user/register' , function (req , res , next) {
    //console.log(req.body);
    //用前端的name属性来定义body中的名称
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;

    //用户名判空
    if(username ==''){
        responseData.code = 1;
        responseData.message = '用户名为空';
        //向前端返回一个json格式的数据
        res.json(responseData);
        return;
    }else if (password == ''){ //密码判空
        responseData.code = 2;
        responseData.message = '密码为空';
        res.json(responseData);
        return;
    }else if(password != repassword){//密码判重
        responseData.code = 3;
        responseData.message = '两次输入的密码不一致';
        res.json(responseData);
        return;
    }

        //拉通数据库，判定数据库中用户名是否已经被注册了
        /*
        * findOne返回的是一个promise对象
         */
        User.findOne({
            username: username
        }).then(function (userInfo , reject ) {
            if (userInfo) {
                //表示数据库中有该记录
                responseData.code = 4;
                responseData.message = '用户名已经被注册';
                res.json(responseData);
                return;
            }else {
                //否则说明用户名没有被保存在数据库中
                //现在将其保存在数据库中
                var user = new User({
                    username: username,
                    password: password
                });

                user.save();
                //注册成功
                responseData.code = 0;
                responseData.message = '注册成功';
                res.json(responseData);
            }
      })
})

/*登陆
*
 */
router.post('/user/login',function (req , res , next) {
    var username = req.body.username;
    var password = req.body.password;

    if(username == '' || password == ''){
        responseData.code = 1 ;
        responseData.message = '用户名或密码不能为空';
        res.json(responseData);
        return;
    }

    //验证用户名和密码与数据库中是否匹配
    User.findOne({
        username:username,
        password:password
    }).then(function (data) {
        if(!data){
            //登陆失败
            responseData.code = 5;
            responseData.message = '用户名或密码不正确';
            res.json(responseData);
            return;
        }

        //登陆成功
        responseData.code = 0;
        responseData.message = '登陆成功';
        responseData.userInfo = {
            _id : data._id,
            username : data.username
        };
        //此处为原版
        // req.cookies.set('userInfo' , JSON.stringify({
        //         //     _id : data._id,
        //         //     username : data.username
        //         // }));
        //此处为了cookie-parser实验
        res.cookie('userInfo' , JSON.stringify({
            _id : data._id,
            username : data.username
        }));

        res.json(responseData);
        return;

    })

})
router.get('/user/logout' , function (req ,res) {
    res.clearCookie('userInfo');
    res.json(responseData);
})

/*
* 获取指定文章的所有评论
 */
router.get('/comment',function (req ,res) {
    var contentId = req.query.contentId ;

    Content.findOne({
        _id : contentId
    }).then(function (content) {

        responseData.data = content.comments;
        res.json(responseData);
    })
})

/*
* 评论提交处理
 */
router.post('/comment/post',function (req , res) {
    //本文章的id
    var contentId = req.body.contentId;
    var postData = {
        username : req.userInfo.username,
        postTime : new Date(),
        content : req.body.content, //评论的内容
    }
    //查询当前文章的信息
    Content.findOne({
        _id : contentId
    }).then(function (content) {
        content.comments.push(postData);
        return content.save();
    }).then(function (newContent) {
        responseData.message = '评论成功'
        responseData.newContent = newContent;
        res.json(responseData);
    })
})

module.exports = router;