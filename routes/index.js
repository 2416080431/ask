var express = require('express');
var router = express.Router();
let Question = require('../models/question');

//////////查询话题列表
router.get('/',(req, res) =>{
	Question.find( (err,doc) =>{
		if(err){
			throw err;
		}
		res.render('index', { result: doc});
	});
});

/////////////////根据时间先后查询话题列表
router.get('/sortByTime',(req,res) =>{
	Question.find().sort({'date':-1}).exec((err,doc) =>{
		if(err){
			throw err;
		}
		res.render('index', { result: doc});
	})
});

/////////////////根据好评数查询话题列表
router.get('/sortByUp',(req,res) =>{
	Question.find().sort({'up':-1}).exec((err,doc) =>{
		if(err){
			throw err;
		}
		res.render('index', { result: doc});
	})
});

/////////////////我的话题
router.get('/myQuestion',(req,res) =>{
	let username = req.session.username;
	Question.find({username},(err,doc) =>{
		if(err){
			throw err
		}
		res.render('user/myQuestion',{result:doc});
	});
});

//////////////我的话题根据时间排序
router.get('/myQuestion_sortByTime',(req,res) =>{
	let username = req.session.username;
	Question.find({username}).sort({'date':-1}).exec((err,doc) =>{
		if(err){
			throw err;
		}
		res.render('user/myQuestion', { result: doc});
	})
});

//////////////我的话题根据好评数排序
router.get('/myQuestion_sortByUp',(req,res) =>{
	let username = req.session.username;
	Question.find({username}).sort({'up':-1}).exec((err,doc) =>{
		if(err){
			throw err;
		}
		res.render('user/myQuestion', { result: doc});
	})
});


module.exports = router;
