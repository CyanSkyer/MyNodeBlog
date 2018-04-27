/**
 * Created by 王勇超 on 2018/4/21.
 */


var limit = 2 ;//一次显示4条评论
var page =1; //当前第几页
var totalpages=0 ;//总的页数

var myComments = [];

//提交评论
$('#messageBtn').on('click',function () {
    $.ajax({
        type : 'POST',
        url : '/api/comment/post',
        data : {
            contentId : $('#contentId').val(),
            content :$('#messageContent').val()
        },
        success:function (responseData) {
            $('#messageContent').val('');
            myComments = responseData.newContent.comments.reverse();
            renderComment();
        }
    })
})


//事件委托，来处理点击按钮
$('.pager').delegate('a','click',function () {
    //满足previous的话
    if($(this).parent().hasClass('previous')){
        page--;
    }else{
        page++;
    }
    renderComment();
})


//每次页面重载，获取文章的所有评论
$.ajax({
    type : "GET",
    url : '/api/comment',
    data : {
        contentId : $('#contentId').val(),
    },
    success:function (responseData) {
        $('#messageContent').val('');
        myComments = responseData.data.reverse();

        renderComment();
    }
})




//专门用来处理评论的返回值
function renderComment() {
    //评论总数
    $('#messageCount').html(myComments.length);

    //评论分页
    totalpages = Math.max(1,Math.ceil(myComments.length/limit));
    var $lis = $('.pager li');
    $lis.eq(1).html(page+'/'+totalpages);//eq是替换固定数组的内容

    if(page<=1){
        page = 1;
        $lis.eq(0).html('<span>没有上一页了</span>');
    }else{
        $lis.eq(0).html('<a href="javascript:;">上一页</a>');
    }

    if(page>=totalpages){
        page = totalpages;
        $lis.eq(2).html('<span>没有下一页了</span>');
    }else{
        $lis.eq(2).html('<a href="javascript:;">下一页</a>');
    }


    var start = (page-1)*limit;//循环开始的地方
    var end = start+limit;//循环结束的地方

    if(start<0){
        start = 0;
    }
    if(end > myComments.length){
        end = myComments.length;
    }
    //评论内容
    var html='';
    for(var i =start;i<end;i++){
        html+='<div class="messageBox">'+
            '<p class="name clear"><span class="fl">'+myComments[i].username+'</span><span class="fr">' +
            formData(myComments[i].postTime)+'</span></p><p>' + myComments[i].content+'</p></div>'
    }



    if(myComments.length==0){
        $('.messageList').html(' <div class="messageList"><p>还没有留言</p></div>');
    }else {
        $('.messageList').html(html);
    }
}


//对于时间的处理
function formData(time) {
    var date = new Date(time);
    return date.getFullYear()+'年'+date.getMonth()+'月'+date.getDay()+'日'+date.getHours()+':'+date.getMinutes()+';'+date.getSeconds();
}