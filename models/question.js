let mongoose = require("../routes/db");
let questionSchema = new mongoose.Schema({
	"questionId":String,				///问题ID
	"userId":String,						///该问题关联的用户ID
	"title":String,							///问题标题
	"content":String,						///问题内容
	"up":Number,								///问题顶数量
	"down":Number,							///问题踩数量
	"commemt":{									///评论
		"thumbUp",								///评论点赞数
		"userId"									///该评论关联的用户ID
	}
});

module.exports = mongoose.model("question",questionSchema);
