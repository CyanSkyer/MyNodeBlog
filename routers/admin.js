/**
 * Created by 王勇超 on 2018/4/12.
 */

var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Category = require('../models/Category');
var Content = require('../models/Content')

router.use(function (req , res , next) {
    if(!req.userInfo.isAdmin){
        res.send('对不起，只有管理员能进入');
        return ;
    }
    next();
})

//首页路由
router.get('/' , function (req , res , next) {
    res.render('admin/index',{
        userInfo : req.userInfo
    })
})

//用户管理路由
router.get('/user',function (req,res,next) {

    //通过mongoose查询所有的用户信息
    /*
    * find()查询用户的所有信息
    * limit(NUMBER) :限制获取的数据条数
    * skip(NUMBER) :忽略数据的条数
    * count()：查询数据总条数
    *
    * 每页显示两条
    * limit = 2
    * 1 ：1-2 skip 0 ->(当前页-1)*limit
    * 2 : 3-4 skip 2 -> (2-1)*2
     */

    //req.query : 获取前端url中'?'之后传递过来的相关数字
    var page = Number(req.query.page || 1);
    var limit = 5;


    var totalpages = 0;//总页数
    User.count().then(function (count) {
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

        User.find().limit(limit).skip(skip).then(function (users) {
            req.users = users;

            res.render('admin/user_index',{
                userInfo : req.userInfo,
                users : req.users,
                page : Number(req.query.page || 1),
                pagearr : pagearr,
                count :count,
                limit :limit,
            })
            // console.log(users);
        })

    })
})

/*
* 用户管理的删除
 */
router.get('/user/delete',function (req ,res ,next) {
    var id = req.query.id ||'';

    User.remove({
        _id :id
    }).then(function () {
        res.render('admin/success',{
            userInfo : req.userInfo,
            errmessage : '删除成功',
            url : '/admin/user',
        })
    })
})

/*
* 分类首页
 */
router.get('/category' , function (req ,res ,next) {

    var page = Number(req.query.page || 1);
    var limit = 5;
    var totalpages = 0;//总页数
    Category.count().then(function (count) {
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
        * sort({_id})：按照参数来进行排序，同时有两个选择参数
        * 1 ：升序
        * -1：降序
         */

        Category.find().sort({_id : -1}).limit(limit).skip(skip).then(function (names) {
            req.names = names;

            res.render('admin/category_index',{
                userInfo : req.userInfo,
                names : req.names,
                page : Number(req.query.page || 1),
                pagearr : pagearr,
                count :count,
                limit :limit,
            })
            // console.log(users);
        })

    })

})

/*
* 添加分类界面
 */
router.get('/category/add' , function (req,res,next) {
    res.render('admin/category_add',{
        userInfo : req.userInfo,
    })
})

/*
* 分类的添加
 */
router.post('/category/add' , function (req,res,next) {
    //用前端的name属性来定义body中的名称
    var name = req.body.name || '';

    if(!name){
        res.render('admin/err',{
            userInfo : req.userInfo,
            errmessage : '添加的不能为空'
        })
        return;
    }

    Category.findOne({
        name :name
    }).then(function (value) {
        if(value){
            res.render('admin/err',{
                userInfo : req.userInfo,
                errmessage : '添加的分类重复',
                url : '',
            })
            return ;
        }else{
            var category = new Category({
                name:name,
            })
            category.save();
            res.render('admin/success',{
                userInfo : req.userInfo,
                errmessage : '分类保存成功',
                url : '/admin/category',
            })
            return ;
        }
    })
})

/*
* 分类的修改信息
 */
router.get('/category/edit',function (req , res ,next) {
    var id = req.query.id;

    //获取要修改的分类的信息
    Category.findOne({
        _id : id
    }).then(function (category) {
        if(!category){
            res.render('admin/err',{
                userInfo : req.userInfo,
                errmessage : '错误的修改要求'
            })
            return;
        }else{
            res.render('admin/category_edit',{
                userInfo :req.userInfo,
                category :category
            })
        }
    })
})

/*
* 分类的修改保存
 */
router.post('/category/edit' , function (req, res ,next) {
    //获取从get提交过来的内容  根据url中的名称
    var id = req.query.id;
    //获取从post提交过来的内容  根据post写的name
    var name = req.body.name || '';

    //获取要修改的分类的信息
    Category.findOne({
        _id : id
    }).then(function (category) {
        if(!category){
            res.render('admin/err',{
                userInfo : req.userInfo,
                errmessage : '分类信息不存在'
            })
            return Promise.reject();
        }else{
            //当用户没有做任何修改提交的时候
            if(name == category.name){
                res.render('admin/err',{
                    userInfo :req.userInfo,
                    errmessage : '没有做任何修改',

                })
                return Promise.reject();
            }else{
                //要修改的数据的名称是否已经在数据库中存在
                //即 id不一样，名称相同
                return Category.findOne({
                    //$ne的意思是不等于
                    _id:{$ne:id},
                    name:name
                })
                
            }
        }
    }).then(function (sameCategory) {

    if(sameCategory){
        res.render('admin/err',{
            userInfo : req.userInfo,
            errmessage : '已经有相同id的分类存在'
        })
        return Promise.reject();
    } else{
            //不存在就可以调用保存了
            /*
            * 调用相关的mongoose方法：
            * Catgory.update({a=a},{b=b})，第一个参数是条件，第二个是修改
             */
            return Category.update({
                _id :id
            },{
                name :name
            })
        }
    }).then(function () {
        res.render('admin/success',{
            userInfo : req.userInfo,
            errmessage : '修改成功',
            url : '/admin/category',
        })
    }).catch(function (err) {

    })
})

/*
* 分类的删除
 */
router.get('/category/delete',function (req,res,next){
    var id = req.query.id || '';

    /*
    * mongoose的remove方法，参数只有一个，条件。
     */
    Category.remove({
        _id :id
    }).then(function () {
        res.render('admin/success',{
            userInfo : req.userInfo,
            errmessage : '删除成功',
            url : '/admin/category',
        })
    })
})

/*
* 内容首页
 */
router.get('/content',function (req ,res ,next) {

    var page = Number(req.query.page || 1);
    var limit = 5;
    var totalpages = 0;
    Content.count().then(function (count) {
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

        Content.find().sort({addTime : -1}).limit(limit).skip(skip).populate(['category' , 'user']).then(function (contents) {

            res.render('admin/content_index',{
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
* 内容添加
 */
router.get('/content/add',function (req,res,next) {
    //先读取所有分类信息
    Category.find().sort({_id:-1}).then(function (categories) {
        res.render('admin/content_add',{
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
    }else {
        //保存内容到数据库
        Content.findOne({
            title: title
        }).then(function (value) {
            if (value) {
                res.render('admin/err', {
                    userInfo: req.userInfo,
                    errmessage: '添加的内容标题重复',
                })
                return;
            } else {
                var contents = new Content({
                    category: category,
                    title: title,
                    user: req.userInfo._id,
                    addTime: new Date(),
                    description: description,
                    content: content
                })
                contents.save().then(function () {
                    res.render('admin/success', {
                        userInfo: req.userInfo,
                        errmessage: '内容保存成功',
                        url: '/admin/content',
                    })
                });
            }
        })
    }

})

/*
* 内容修改
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
            res.render('admin/err',{
                userInfo : req.userInfo,
                errmessage : '内容不存在',
            })
            return Promise.reject();
        }else{
            res.render('admin/content_edit',{
                userInfo:req.userInfo,
                categories:categories,
                content : content,
            })
        }
    })
})

/*
* 内容修改保存
 */
router.post('/content/edit',function (req,res,next) {
    var id = req.query.id || '';
    var category = req.body.category;
    var title = req.body.title;
    var description = req.body.description;
    var content = req.body.content;

    if(!title){
        res.render('admin/err',{
            userInfo : req.userInfo,
            errmessage : '标题为空'
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
            res.render('admin/err',{
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
        res.render('admin/success',{
            userInfo : req.userInfo,
            errmessage : '修改成功',
            url : '/admin/content',
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
        res.render('admin/success',{
            userInfo : req.userInfo,
            errmessage : '删除成功',
            url : '/admin/content',
        })
    })
})




module.exports = router;