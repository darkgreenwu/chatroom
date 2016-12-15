/**
 * Created by wusicheng on 2016/11/11.
 *
 * 消息的类型：
 * 1xx: 系统消息
 *     100: 自己登录
 *     101: 用户登录
 *     102: 用户离开
 *     103: ...
 * 2xx: 用户聊天消息
 *     200: 自己的聊天内容
 *     201: 用户公开聊天内容
 *     202: 用户私聊内容
 *     203: ...
 *
 * 定义好消息的格式：
 * {
 *    type: "101",
 *    nickname: "张三",
 *    gender: "男",
 *    state: "忙碌",
 *    pic: "aa.jpg"
 * }
 * {
 *    type: "201",
 *    content: "早上好",
 *    ...
 * }
 *
 * 客户端和服务器之间的数据传送格式我们采用json
 * socket.io会自动将json转为js对象
 */
var http = require("http");
var path = require("path");
var express = require("express");

var app = express();

// 处理对静态资源的请求
var publicPath = path.resolve(__dirname,"public");
app.use(express.static(publicPath));  // 使用中间件

var httpServer = http.createServer(app);

// 引入socket.io模块
var socketIO = require("socket.io");
// 让socket.io监听web服务器，并返回socket.io服务器
var socketServer = socketIO.listen(httpServer);

httpServer.listen(3000,function(){
    console.log("服务器正运行在3000端口...");
});

// socket服务器会监听所有客户端的连接请求
// 当有客户端连接请求到达时，会触发一个"connect"事件
// 每一个客户端请求，服务器端都会创建一个新的socket对象，负责和对方通信
socketServer.on("connect",function(socket){
    console.log("有新的客户端连接:" + socket.id);

    // 向客户端发送消息:
    // 有两个方法：send-发送的是默认叫做"message"的消息,
    //             emit-发送自定义名称的消息
    // 以下方法的两个参数：参数1:消息名称;参数2:消息内容
    //socket.emit("hello","欢迎您，新朋友!");

    // 服务器socket监听客户端发过来的消息
    socket.on("message",function(data){
        // 提取收到的消息的类型
        var type = data.type;

        // 根据收到的消息类型，作用不同的处理
        switch(type){
            case "101": // 用户登录消息
                handleUserLogin(socket,data);
                break;
            case "201": // 用户公共聊天信息
                handleChatMsg(socket,data);
                break;
        }
    });

    // 监听客户端断开连接的消息 - disconnect
    socket.on("disconnect",function(){
        // 把用户离开的消息群发(包括该用户的昵称)
        var message = {
            type: "102",    // 用户离开聊天室
            nickname: socket.nickname,
            gender:socket.gender,
           pic:socket.pic
        };
        socket.broadcast.send(message);
    });
});
// 处理用户发过来的公共聊天信息
function handleChatMsg(socket,data){
    // 群发该消息:先构造消息的数据结构
    var message = {
        type: "201",    // 是聊天信息
        content: data.content,
        nickname: socket.nickname,   // 从scoket中取出登录时保存的昵称
        gender:socket.gender,
        pic:socket.pic
    };
    socket.broadcast.send(message);

    // 将消息发给自己
    message.type = "200";   // 表示是自己进入了聊天室
    socket.send(message);   // 谁登录，发给谁
}

// 处理用户登录的方法
function handleUserLogin(socket,data){
    // 保存用户的昵称到socket对象中
    socket.nickname = data.nickname;
    socket.gender=data.gender,
   socket.pic=data.pic

    // 构造一个群发的消息格式，
    var content = {
        type: "101",    // 有新用户进入聊天室
        nickname: data.nickname,
        gender:data.gender,
        pic:data.pic
    };

    // 将新用户登录的消息群发给聊天室内所有的用户
    // socket.broadcast.send会群发消息给所有的客户端socket，除了自己
    socket.broadcast.send(content);

    // 将消息发给自己
    content.type = "100";   // 表示是自己进入了聊天室
    socket.send(content);   // 谁登录，发给谁
}
