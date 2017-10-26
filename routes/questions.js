var express = require('express');
var router = express.Router();
let Question = require('../models/question');
let common = require('./common');

var detail_id;   ////用于记录当前提问的id
var isUp = false;   ////////////用于标记当前用户是否已经顶提问
var isDown = false;  ///////////用于标记当前用户是否已经踩提问
var isThumb = [];  ////////////用于标记当前用户是否已经点赞的评论
	
//////////////请求新增提问页面
router.get('/add',(req,res) =>{
	res.render('question/add');
});

/////////////////请求提问详情页面
router.get('/detail',(req,res) =>{
	let _id = req.query._id;
	let username = req.session.username;
	detail_id = _id;
	Question.findOne({_id},(err,doc) =>{
		if(err){
			throw err
		}
		isUp = fun_isUp(req,doc.up);
		isDown = fun_isDown(req,doc.down);
		res.render('question/detail',{result:doc,isUp,isDown,username});
	});
});

///////////////////////请求新增评论页面
router.get('/comment',(req,res) =>{
	res.render('question/comment');
});

///////////////////////新增提问
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
	let username = req.session.username;
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
			isUp = fun_isUp(req,docs.up);
			isDown = fun_isDown(req,docs.down);
			res.render('question/detail',{result:docs,isUp,isDown,username});
		});
	});
});

//////////////////////////顶问题
router.get('/up',(req,res) =>{
	let _id = detail_id;
	let username = req.session.username;
	
	///////////////////查询用户是否已经顶提问
	Question.findOne({_id},(err,doc) =>{
		if(err){
			throw err
		}
		isUp = fun_isUp(req,doc.up);
		isDown = fun_isDown(req,doc.down);
		////////////如果用户已经踩了提问，则不响应
		if(isDown){
			res.render('question/detail',{result:doc,isUp,isDown,username});
		}
		////////////如果用户已经顶了提问，则取消顶
		if(isUp){
			Question.update({_id},{$pull:{"up":username}},(err,doc) =>{
				if(err){
					throw err;
				}
				Question.findOne({_id},(err,docs) =>{
					if(err){
						throw err
					}
					isUp = fun_isUp(req,docs.up);
					isDown = fun_isDown(req,docs.down);
					res.render('question/detail',{result:docs,isUp,isDown,username});
				});
			});
		}
		///////////否则，该用户顶该提问
		if(!isDown && !isUp){
			Question.update({_id},{$push:{"up":username}},(err,doc) =>{
				if(err){
					throw err;
				}
				Question.findOne({_id},(err,docs) =>{
					if(err){
						throw err
					}
					isUp = fun_isUp(req,docs.up);
					isDown = fun_isDown(req,docs.down);
					res.render('question/detail',{result:docs,isUp,isDown,username});
				});
			});
		}
	});
});


//////////////////////////踩问题
router.get('/down',(req,res) =>{
	let _id = detail_id;
	let username = req.session.username;
	
	///////////////////查询用户是否已经踩提问
	Question.findOne({_id},(err,doc) =>{
		if(err){
			throw err
		}
		isUp = fun_isUp(req,doc.up);
		isDown = fun_isDown(req,doc.down);
		////////////如果用户已经顶了提问，则不响应
		if(isUp){
			res.render('question/detail',{result:doc,isUp,isDown,username});
		}
		////////////如果用户已经踩了提问，则取消踩
		if(isDown){
			Question.update({_id},{$pull:{"down":username}},(err,doc) =>{
				if(err){
					throw err;
				}
				Question.findOne({_id},(err,docs) =>{
					if(err){
						throw err
					}
					isUp = fun_isUp(req,docs.up);
					isDown = fun_isDown(req,docs.down);
					res.render('question/detail',{result:docs,isUp,isDown,username});
				});
			});
		}
		///////////否则，该用户踩该提问
		if(!isDown && !isUp){
			Question.update({_id},{$push:{"down":username}},(err,doc) =>{
				if(err){
					throw err;
				}
				Question.findOne({_id},(err,docs) =>{
					if(err){
						throw err
					}
					isUp = fun_isUp(req,docs.up);
					isDown = fun_isDown(req,docs.down);
					res.render('question/detail',{result:docs,isUp,isDown,username});
				});
			});
		}
	});
});

////////////////////////////给评论点赞
router.get('/thumbUp',(req,res) =>{
	let _id = detail_id;
	let commentId = req.query.commentId;
	let username = req.session.username;
	let m;  ///标记当前评论下标
	
	////////////////查询用户是否已经给该评论点赞
	Question.findOne({"comments._id":commentId},(err,doc) =>{
		////////////////////////////得到目标评论下标
		for(let i=0; i<doc.comments.length; i++){
			if(doc.comments[i]._id == commentId){
				m = i;
				break;
			}
		}
		
		///////////////////////////遍历是否该用户是否已经点过赞
		let isThumb = false;
		for(let i of doc.comments[m].thumbUp){
			if(i == username){
				isThumb = true;
				break;
			}
		}
		let newComment;
		
		if(isThumb){
			newComment = doc.comments;
			newComment[m].thumbUp.remove(username);
			Question.update({"comments._id":commentId},{$set:{"comments":newComment}},(err,docs) =>{
				if(err){
					throw err
				}
				isUp = fun_isUp(req,doc.up);
				isDown = fun_isDown(req,doc.down);
				res.render('question/detail',{result:doc,isUp,isDown,username});
			});
		}else{
			newComment = doc.comments;
			newComment[m].thumbUp.push(username);
			Question.update({"comments._id":commentId},{$set:{"comments":newComment}},(err,docs) =>{
				if(err){
					throw err
				}
				isUp = fun_isUp(req,doc.up);
				isDown = fun_isDown(req,doc.down);
				res.render('question/detail',{result:doc,isUp,isDown,username});
			});
		}
	});
});


module.exports = router;



///////////////////判断当前用户是否顶提问
function fun_isUp(req,upUser){
	let username = req.session.username;
	for(let i of upUser){
		if(i == username){
			return true;
		}
	}
	return false;
}

///////////////////判断当前用户是否踩提问
function fun_isDown(req,downUser){
	let username = req.session.username;
	for(let i of downUser){
		if(i == username){
			return true;
		}
	}
	return false;
}
