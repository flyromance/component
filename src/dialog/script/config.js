const render = require('../template/index.art');

module.exports = {

	// 是否是fixed定位，默认是absolute定位
	fixed: false,

	// 弹窗效果
	animate: 'translate', 

	// 蒙层颜色
	modalBackgroundColor: '#000',

	modalOpacity: 0.6,

	title: '',

	content: '<span class="dialog-loading">Loading..</span>',

	okValue: 'ok',

	cancelValue: 'cancel',

	w: '',

	h: '',

	// 内容与边界的距离
	padding: '',

	// 点击非弹窗区域，关闭弹窗
	quickClose: false,

	template: render
}