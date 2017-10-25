var express = require('express');
var router = express.Router();
let User = require('../models/user');
let common = require('./common');

///请求注册页面
router.get('/register',(req,res) =>{
	res.render('register');
});

////////////////////////注册接口
router.post('/register',(req,res,next) =>{
	let {username,password} = req.body;  //解构赋值,等号两边结构一致
	password = common.encryption(password);  //给密码加密
	
	//查询数据库是否已经存在该用户名
	User.findOne({username},(err,doc) =>{
		if(err){
			res.locals.message = common.errorMessage("数据库查询异常");
			return res.render('register');
		}
		//1.如果用户名存在
		if(doc){
			res.locals.message = common.errorMessage("该用户名已经存在");
			return res.render('register');
		}
		
		//2.用户名不存在，则写入数据库
		User.create({"username":username,"password":password,"avatar":"null"}, (err,doc) =>{
			if(err){
				res.locals.message = common.errorMessage("数据库插入异常");
				return res.render('register');
			}
			if(doc){
				res.locals.message = "注册成功";
				return res.render('register');
			}
			res.locals.message = common.errorMessage("注册失败");
			return res.render('register');
		});
	});
});

//请求登录页面
router.get('/login',(req,res) =>{
	res.render('login');
});

//////////////////////////////////登录接口
router.post('/login',(req,res,next) =>{
	let {username,password} = req.body;
	
	//查找用户是否存在
	User.findOne({username},(err,doc) =>{
		if(err){
			res.locals.message = common.errorMessage('数据库查询异常');
			return res.render('login');
		}
		if(!doc){
			res.locals.message = common.errorMessage('用户名错误');
			return res.render('login');
		}
		if(doc.password !== common.encryption(password)){
			res.locals.message = common.errorMessage('密码错误');
			return res.render('login');
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

module.exports = router;