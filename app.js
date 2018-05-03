/**
 * Created by 王勇超 on 2018/4/10.
 * 应用程序入口
 */

//加载express模块
var express = require('express');
//创建app应用，类似Node.js中的  http.createServer()
var app = express();
//加载模板处理模块
var swig = require('swig');
//加载body-parser，用来处理post提交过来的数据
var bodyParser = require('body-parser');
//引入ueditor模块
var ueditor = require("ueditor");
//加载数据库模块
var mongoose = require('mongoose');
//加载coodies模块保证长期稳定登陆
// var cookies = require('cookies');
//cookie用不了，我试试cookie-parser
var cookieparser = require('cookie-parser');
//引入module模块
var User = require('./models/User');
//引入path模块对于路径的处理
var path = require('path');


//设置静态文件托管
//当用户访问的url以/public开始的时候，那么直接返回对应__dirname + '/public'下的文件
app.use('/public' , express.static(__dirname + '/public'));


//配置应用模板
/*定义当前应用所使用的模板引擎
* 第一个参数：模板引擎的名称（html），同时也是模板文件的后缀，
* 第二个参数：用于解析模板内容的方法
*/
app.engine('html' , swig.renderFile);
//设置模板内容存放的目录，第一个参数必须是views，第二个参数是模板引擎存放的目录
app.set('views' , './views');
//注册所使用的模板引擎，第一个参数必须是view engine，第二个参数和上面的引擎名称一样
app.set('view engine' , 'html');
//在开发过程中，需要取消模板缓存
swig.setDefaults({cache : false});

//配置body-parser
app.use( bodyParser.urlencoded({extended:true}));
app.use( bodyParser.json())


//配置cookies
// app.use(function (req , res , next) {
//     req.cookies = new cookies(req , res);
//     next();
// })
//此处为原版

//配置cookie-parser
app.use(cookieparser());

app.use(function (req ,res , next) {
    //解析登陆用户的cookies
    //console.log(req.cookies);
    if(req.cookies.userInfo){
        req.userInfo = JSON.parse(req.cookies.userInfo);
        // console.log(req.userInfo)
        // console.log(typeof req.userInfo);

        //录入管理员信息
        User.findById(req.userInfo._id).then(function (userInfo) {
            req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
            next();
        })
    }else{
        //这个else是必要的，删掉的结果就是跳过了上面的新增查询isAdmin
        next();
    }
})


//进行模块化开发，前端模块，后端模块，API分开，用app.use分离
app.use('/admin' , require('./routers/admin'));
app.use('/admin_user',require('./routers/admin_user'));
app.use('/api' , require('./routers/api'));
app.use('/' , require('./routers/main'));

//ue编辑器的载入
app.use("/public/ueditor/ue", ueditor(path.join(__dirname, 'public'), function (req, res, next) {
    //客户端上传文件设置
    var imgDir = '/images/ueditor/'
    var ActionType = req.query.action;
    if (ActionType === 'uploadimage' || ActionType === 'uploadfile' || ActionType === 'uploadvideo') {
        var file_url = imgDir;//默认图片上传地址
        /*其他上传格式的地址*/
        if (ActionType === 'uploadfile') {
            file_url = '/file/ueditor/'; //附件
        }
        if (ActionType === 'uploadvideo') {
            file_url = '/video/ueditor/'; //视频
        }
        res.ue_up(file_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
        res.setHeader('Content-Type', 'text/html');
    }
    //  客户端发起图片列表请求
    else if (req.query.action === 'listimage') {
        var dir_url = imgDir;
        res.ue_list(dir_url); // 客户端会列出 dir_url 目录下的所有图片
    }
    // 客户端发起其它请求
    else {
        // console.log('config.json')
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/public/ueditor/nodejs/config.json');
    }
}));
//注明：app.use里面的第二个参数既可以是函数也可以是对象，但app.get()只能是函数
//另：现在不用app.get()了，还是都用app.use吧。
/*
* req参数：接受请求
* res参数：回馈响应
* next参数：用于执行下一个和路径匹配的函数
 */
//通过app.use()可以把url和一个或N个函数或对象绑定
// app.use('/' , function (req , res , next) {
//     //res.send(String) 发送内容至客户端
//     //res.send('<h1>欢迎光临我的博客</h1>')
//
//     //注册好模板后就不用send了，直接render
//   /*
//   * res.render()用以呈现模板代码
//   * 第一个参数：表示模板的文件，相对于 views目录， views/index_1.html
//   * 第二个参数：传递给模板使用的数据
//    */
//     res.render('index');
// })

//数据库连接
mongoose.connect('mongodb://localhost:27017/Blog' , function (err) {
    if(err){
        console.log('数据库连接失败');
    }else {
        console.log('数据库连接成功');
        app.listen(8484);
    }
})

module.exports = app;



/**
 * 用户发送http请求 -> url ->解析路由 ->找到匹配的规则 ->执行制定的绑定函数，返回对应内容至用户
 * 如果是 /public ->静态 ->直接读取指定目录下的文件 ->返回给用户
 * 如果是 动态网页请求 ->处理业务逻辑 ->加载模板，解析模板 ->返回数据给用户
 */
