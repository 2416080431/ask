var express = require('express');
var router = express.Router();
let Question = require('../models/question');
let common = require('./common');

var detail_id;   ////用于记录评论的提问的id值

//////////////请求新增提问页面
router.get('/add',(req,res) =>{
	res.render('question/add');
});

/////////////////请求提问详情页面
router.get('/detail',(req,res) =>{
	let _id = req.query._id;
	detail_id = _id;
	Question.findOne({_id},(err,doc) =>{
		if(err){
			throw err
		}
		res.render('question/detail',{result:doc});
	});
});

///////////////////////请求新增评论页面
router.get('/comment',(req,res) =>{
	res.render('question/comment');
});

/////////////////新增提问
router.post('/add',(req,res) =>{
	let {title,content} = req.body;
	let username = req.session.username;
	let date = new Date().toLocaleDateString();
	
	Question.create({title,username,content,date},(err,doc) =>{
		if(err){
			res.locals.message = common.errorMessage('提问异常');
			return res.render('question/add');
		}
		if(!doc){
			res.locals.message = common.errorMessage('提问失败');
			return res.render('question/add');
		}
		res.locals.message = '提问成功';
		return res.redirect('/');
	});
});


///////////////////////////新增评论
router.post('/comment',(req,res) =>{
	let content = req.body.content;
	let _id = detail_id;
	let newOne = {
		"username":req.session.username,
		"content":content,
		"thumbUp":[]
	};
	Question.update({_id},{$push:{"comments":newOne}},(err,doc) =>{
		if(err){
			throw err;
		}
		Question.findOne({_id},(err,docs) =>{
			if(err){
				throw err
			}
			res.render('question/detail',{result:docs});
		});
	});
});


module.exports = router;