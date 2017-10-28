$(function(){
	$(".thumbUp").click(function(){
		let commentId = $(this).data("id");
		var self = this;
		$.ajax({
			type:"get",
			url:"http://localhost:3000/questions/thumbUp?commentId="+commentId,
			success:function(data){
				if(data.isThumb){
					$(self).removeClass("btn-default");
					$(self).addClass("btn-danger");
					let n = parseInt($(self).children("span").text())+1;
					$(self).children("span").text(n);
				}else{
					$(self).removeClass("btn-danger");
					$(self).addClass("btn-default");
					let n = parseInt($(self).children("span").text())-1;
					$(self).children("span").text(n);
				}
			}
		});
	});
	
});