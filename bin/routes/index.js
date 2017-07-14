const express = require('express');
const router = express.Router();
const glob = require('glob');
const list = require('./list');


router.use(function(req, res, next){
	res.locals.Navs = [
		{ name : "index", title : "首页", url : "/index.html" },
		{ name : "list", title : "组件", url : "/list.html" },
		{ name : "docs", title : "文档", url : "/docs", target : "_blank" },
		{ name : "slide", title : "幻灯片", url : "/slide/default.html", target : "_blank" },
		{ name : "test", title : "测试页面", url : "/test/index.html", target : "_blank" },
		{ name : "infoflow", title : "信息流广告", url : "/seed/infoflow.html", target : "_blank" },
		{ name : "phenix", title : "模版模块", url : "/phenix/index.html", target : "_blank" }
	];
	next();
});


router.all(/\/list.*/, list);




router.post("/info.html", function(req, res) {
	var abc = "";
	for(pro in req.body){
		abc += pro + ":" + req.body[pro] +"\n";
	}
	res.send("aaaaaa" + abc);
});


router.get(/\/.*\.html/, function(req, res) {
	var name = req.path.replace(/\.html.*/, "").replace('/', '');
	if( name.indexOf('/') !== -1 ) {res.locals.layout = "";}
	res.render(name, {section:name});
});







router.get("/", function(req, res) {
	res.redirect("/index.html");
});



/**
  *	@desp	获取src目录中所有组件的入口文件
*/
let getComponentObjects = () => {
	let files = glob.sync('./src/*/*.js');
      let list = [];
      files.forEach(function(f){ 
        let name = /.*\/src\/(.*?\/.*?)\.js/.exec(f)[1]; 
        list.push({
        	name : "feb/" + name.toLowerCase(),
        	path : f,
        	url : "/" + name.toLowerCase() + ".html"
        });

    });
    return list;
};


let DataCollectioins = {
	"index" : function(){
		return {
			"entries" : getComponentObjects()
		}
	}
};


let getData = function(pageName){
	if(typeof(DataCollectioins[pageName]) === "function"){
		return DataCollectioins[pageName]();
	}
	return {};
};


module.exports = router;
