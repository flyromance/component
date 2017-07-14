const glob = require('glob');
const crud = require('./crud');

/**
  *	@desp	获取src目录中所有组件的入口文件
*/
let getComponentEntries = function(){
    let files = glob.sync('./src/*/*.js');
      let newEntries = {};
      files.forEach(function(f){ 
        let name = /.*\/src\/(.*?\/.*?)\.js/.exec(f)[1]; 
        newEntries["feb/" + name.toLowerCase()] = f;
    });
    return newEntries;
};


let setComponentEntries = function(){
	let entries = getComponentEntries(), arr = [];
	for(pro in entries){
		arr.push({name : pro, src : entries[pro]});
	}
	return crud.update(arr);
};



module.exports = {
	getComponentEntries : getComponentEntries,
	setComponentEntries : setComponentEntries
}