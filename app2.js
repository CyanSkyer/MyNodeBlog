/**
 * Created by 王勇超 on 2018/4/26.
 */
//引入express
var express=require('express');
//初始化APP
var app=express();
//监听端口
app.listen(3333,function () {
    console.log('服务启动');
});
//引入path模块
var path=require('path');
//引入body-parser处理前台post请求
var bodyParser=require('body-parser');
//设置body-parser中间件
app.use(bodyParser.urlencoded({extended:true}));
//解析body-parser
app.use(bodyParser.json());
//设置静态目录
app.use(express.static(path.join(__dirname,'/public')));
/*针对ueditor的处理*/
//引入ueditor模块
var ueditor=require('ueditor');
//设置中间件处理ueditor的后台请求
app.use("/ueditor/getImg", ueditor(path.join(__dirname, 'public'), function (req, res, next) {
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
        res.redirect('/ueditor/nodejs/config.json');
    }
}));



//设置入口页面
app.get('/',function (req,res) {
    res.render('ueditor');
});