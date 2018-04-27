/**
 * Created by 王勇超 on 2018/4/13.
 */

$(function () {
    var $loginBox = $('#loginBox');
    var $registerBox = $('#registerBox');
    var $userInfo = $('#userInfo');

    //当被点击的时候，切换到注册面板
    $loginBox.find('a.colMint').on('click' , function () {
        $registerBox.show();
        $loginBox.hide();
    })

    //当被点击的时候，切换到登陆面板
    $registerBox.find('a.colMint').on('click' , function () {
        $loginBox.show();
        $registerBox.hide();
    })

    //点击注册按钮
    $registerBox.find('button').on('click' , function () {
        $.ajax({
            type : 'post',
            url : '/api/user/register',
            dataType : 'json',

            data : {
                username : $registerBox.find('[name = "username"]').val(),
                password : $registerBox.find('[name = "password"]').val(),
                repassword : $registerBox.find('[name = "repassword"]').val(),
            },
            success : function (result) {
                $registerBox.find('.colWarning').html(result.message);
                if(result.code == 0){
                    //注册成功
                    setTimeout(function () {
                        $loginBox.show();
                        $registerBox.hide();
                    },1000)
                }
            }
        })
    })

    //点击登陆按钮
    $loginBox.find('button').on('click' , function () {
        //通过ajax进行显示
        $.ajax({
            type: 'post',
            dataType:'json',
            url: '/api/user/login',
            data:{
                username : $loginBox.find('[name = "username"]').val(),
                password : $loginBox.find('[name = "password"]').val()

            },
            success: function (result) {

                $loginBox.find('.colWarning').html(result.message);

                if(result.code == 0){
                                //
                                //     //用户信息显示到前端
                                //     setTimeout(function () {
                                //         $loginBox.hide();
                                //         $userInfo.show();
                                //
                                //         $userInfo.find('.username').html(result.userInfo.username);
                                //         $userInfo.find('.info').html('欢迎光临我的博客');
                                //     },1000)}

                  //写好了cookies就不用这么麻烦了，直接重载页面
                    window.location.reload();
                }
            }
        })
    })

    //绑定事件“退出”
    $('#logout').on('click' , function () {
        $.ajax({
            url:'/api/user/logout',
            success: function (result) {
                window.location.reload();
            }
        })
    })


//事件委托，处理点击"新建"的按钮
//事件委托，来处理点击按钮
    $('#create').on('click',function (){
        var username = $("#username").val();
        if(!username){
            alert('请先登陆')
        }else if (username == 'admin'){
            window.location.href = '/admin/content/add'
        }else{
            window.location.href = '/admin_user/content/add'
        }
    })
})


