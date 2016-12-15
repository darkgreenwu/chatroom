/**
 * Created by 火星时代 on 2016/11/10.
 */
//登录页，鼠标滑过微信图标。下面二维码显示
$(function () {
    var timer=null;
    $('#weixin_icon').on('mouseover',function(){
        $(this).next().show();
    });

    $('#weixin_icon').on('mouseout',function(){
        var $this=$(this)
        //$(this).next().show();
        timer=setTimeout(function(){
            $this.next().hide();
        },600);
    })

    $('#qrcode').on('mouseover',function(){
        clearTimeout(timer);
    });

    $('#qrcode').on('click',function(e){
        e.stopPropagation();//阻止冒泡
    })
    //点击document  弹出框消失
    $(document).on('click',function(){
        $('#qrcode').hide();
    })
});
