let md5 = require('md5');
let config = require('./config');
module.exports = {
	encryption : (password) =>{
		return md5(md5(password + config.SALT));
	},
	errorMessage : (message) =>{
		return '<div class="alert alert-danger" role="alert">'+message+'</div>'
	}
}
