var express = require('express');
var router = express.Router();
let Question = require('../models/question');

////查询问题列表
router.get('/',(req, res) =>{
	Question.find( (err,doc) =>{
		if(err){
			throw err;
		}
		res.render('index', { result: doc});
	});
  
});

module.exports = router;
