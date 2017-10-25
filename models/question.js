let mongoose = require('../routes/db');
let questionSchema = new mongoose.Schema({
	"username":String,						///该问题关联的用户名
	"title":String,							///问题标题
	"content":String,						///问题内容
	"date":String,							///提问时间
	"up":[],								///顶提问的用户
	"down":[],							///踩提问的用户
	"comments":[
		{								///评论
		"username":String,					///该评论关联的用户名
		"thumbUp":[],					///点赞改评论的用户
		"content":String					///评论内容
		}
	]
});

module.exports = mongoose.model("question",questionSchema);
