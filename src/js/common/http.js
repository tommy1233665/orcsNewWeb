import 'whatwg-fetch';
import 'url-search-params-polyfill';
import { message } from 'antd';
import { getSession } from 'common/commonFn';

/**
 * 将对象转成 a=1&b=2 的形式
 */
function getParams(params) {
	let arr = [], index = 0;
	for (let key in params) {
		arr[index++] = [key, params[key]];
	}
	return new URLSearchParams(arr).toString();
}

/**
 * 错误统一处理
 */
function errorHandle(res, error) {
	(error && typeof error == "function") ? error(res) : message.error(res.message);
}

/**
 * 请求
 * @param URL 地址前缀
 * @param url 请求地址【必填】
 * @param method 请求方式
 * @param data 请求参数
 * @param success 请求成功回调函数【必填】
 * @param error 请求失败回调函数
 * @param timeout 请求超时时间
 * @param btn 点击通用按钮组件的按钮，有反应后恢复状态的方法
 */
function fetchHttp({
	URL = g_url,
	method = 'GET',
	url,
	data,
	success,
	error,
	timeout = 30,
	btn,
	isUpload
}) {
	const params = typeof data === "string" || isUpload ? data : getParams(data);
	// 设置请求头
	const option = {
		method,
		mode: "cors",
		credentials: 'include',
		headers: {
			'Accept': 'application/json',
			'token': getSession("token")
		},
	};
	//转换请求数据格式
	if (method == 'GET') {
		option.headers['Content-Type'] = 'application/json';
		url += '?' + params;
	} else {
		//option.headers['Content-Type'] = isUpload ? "multipart/form-data" : "application/x-www-form-urlencoded";  //application/x-www-form-urlencoded
		if(!isUpload) option.headers['Content-Type'] = "application/x-www-form-urlencoded";
		option.body = params;
	}
	//每次请求前显示loading
	return Promise.race([
		fetch(URL + url, option),
		//增加请求超时
		new Promise((resolve, reject) => {
			setTimeout(() => {
				reject('请求超时');
			}, timeout * 1000);
		})
	]).then((response) => {
		btn && typeof btn == "function" && btn(); // 恢复按钮状态
		if (response && response.status === 200) {
			if( response.headers.get('Content-Type').indexOf("application/octet-stream") > -1 ){
				response.blob().then(blob => {
					if( blob && blob.size ){
						success && typeof success == "function" && success(blob);
					}else {
						errorHandle({message: "出错!"}, error);
					}
			    });
			}else{
				response.json().then((res) => {
					if (res && res.code == -1) {
						message.destroy();
						message.error(res.message);
						window.location.href = window.w_url;
					} else if (res && res.code == 200) {
						success && typeof success == "function" && success(res.data);
					} else {
						errorHandle(res, error);
					}
				});
			}
		} else {
			message.error(response.statusText);
		}
	}).catch((e) => {
		btn && typeof btn == "function" && btn(); // 恢复按钮状态
		message.error(e);
	});
}

function post({
	url,
	data,
	success,
	error,
	timeout,
	btn,
	isUpload
}) {
	fetchHttp({
		URL: g_url,
		method: 'POST',
		url,
		data,
		success,
		error,
		timeout,
		btn,
		isUpload
	});
}

function get({
	url,
	data,
	success,
	error,
	timeout,
	btn
}) {
	fetchHttp({
		URL: "",
		method: 'GET',
		url,
		data,
		success,
		error,
		timeout,
		btn
	});
}

export { post, get };