let mongoose = require('../routes/db');
let userSchema = new mongoose.Schema({
	"username":String,				///用户名
	"password":String,				///密码
	"avatar":String						///用户头像
});

module.exports = mongoose.model("user",userSchema);