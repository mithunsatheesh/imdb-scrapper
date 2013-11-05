module.exports = function () {
	
	var operations = {};
		
	return {
		reg : function(str) {
			operations[str] = { start:new Date() };
		},
		stop : function(str) {
			operations[str]["end"] = new Date();
			operations[str]["took"] = new Date()- operations[str]["start"];
			console.log(str,operations[str]["took"]);
		},
		all : function() {
			var tasks = Object.keys(operations);
			for(var i=0;i<tasks.length;i++) {
				var task = tasks[i];
				console.log("task : ",task);
				console.log("took : ",operations[task].took);				
				console.log("start : ",operations[task].start.getTime(),"-","end : ",operations[task].end.getTime());								
			}
		}
	};	
	
};
