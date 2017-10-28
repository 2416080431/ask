var express = require('express');
var fs = require('fs');
var util = require('util');
var formidable = require('formidable');
var router = express.Router();
var path = require('path');
var sd = require('silly-datetime');
let User = require('../models/user');
let common = require('./common');

///请求注册页面
router.get('/register',(req,res) =>{
	res.render('user/register');
});

////请求上传头像页面
router.get('/upload',(req,res) =>{
	let username = req.session.username;
	User.findOne({username},(err,doc) =>{
		if(err){
			throw err
		}
		res.render('user/upload',{result:doc});
	})
});

////////////////////////注册接口
router.post('/register',(req,res,next) =>{
	let {username,password} = req.body;  //解构赋值,等号两边结构一致
	password = common.encryption(password);  //给密码加密
	
	//查询数据库是否已经存在该用户名
	User.findOne({username},(err,doc) =>{
		if(err){
			res.locals.message = common.errorMessage("数据库查询异常");
			return res.render('user/register');
		}
		//1.如果用户名存在
		if(doc){
			res.locals.message = common.errorMessage("该用户名已经存在");
			return res.render('user/register');
		}
		
		//2.用户名不存在，则写入数据库
		User.create({"username":username,"password":password,"avatar":"/images/default.png"}, (err,doc) =>{
			if(err){
				res.locals.message = common.errorMessage("数据库插入异常");
				return res.render('user/register');
			}
			if(doc){
				res.locals.message = "注册成功";
				return res.render('user/register');
			}
			res.locals.message = common.errorMessage("注册失败");
			return res.render('user/register');
		});
	});
});

//请求登录页面
router.get('/login',(req,res) =>{
	res.render('user/login');
});

//////////////////////////////////登录接口
router.post('/login',(req,res,next) =>{
	let {username,password} = req.body;
	
	//查找用户是否存在
	User.findOne({username},(err,doc) =>{
		if(err){
			res.locals.message = common.errorMessage('数据库查询异常');
			return res.render('user/login');
		}
		if(!doc){
			res.locals.message = common.errorMessage('用户名错误');
			return res.render('user/login');
		}
		if(doc.password !== common.encryption(password)){
			res.locals.message = common.errorMessage('密码错误');
			return res.render('user/login');
		}
		////登录成功
		req.session.username = username;
		res.locals.username = username;  //本地全局变量
		res.locals.message = '登录成功';
		return res.redirect('/');
	});
});

////////////////////////退出接口
router.get('/logout',(req,res) =>{
	req.session.username = '';
	res.locals.username = '';
	return res.redirect('/');
});


////////////////////上传头像
router.post('/upload',(req,res) =>{
	var form = new formidable.IncomingForm();
	form.uploadDir = './public/images';
	form.keepExtensions = true;
	form.parse(req,(err,fileds,files) =>{
		if(err){
          throw err;
      }
		var time = sd.format(new Date(), 'YYYYMMDDHHmmss');
		var ran = parseInt(Math.random() * 89999 + 10000);
		var extname = path.extname(files.pic.name);
		var picPath = __dirname.substr(0,__dirname.length-7);
		var oldpath = picPath + '/' + files.pic.path;
		var newpath = picPath + "/public/images/" + time + ran + extname;
		
		fs.rename(oldpath,newpath,(err) =>{
			if(err){
				throw err;
			}
			let dbPicPath = newpath.substr(30);
			console.log(dbPicPath);
			let username = req.session.username;
			User.update({username},{$set:{"avatar":dbPicPath}},(err,docs) =>{
				if(err){
					throw err;
				}
				User.findOne({username},(err,doc) =>{
					if(err){
						throw err
					}
					res.render('user/upload',{result:doc});
				});
			})
			
		});
	});
});


module.exports = router;