const CryptoJS = require('crypto-js');  //引用AES源码js
import { authorityMap } from 'common/datas';

/**
 * @param {*} _this 当前组件this对象 [必需]
 * @param {*} url 跳转路径 [必需]
 */
function href(_this, url) {
    if (_this && _this.props.history) {
        _this.props.history.push(url);
    } else {
        console.error("请对组件使用react-router-dom的withRouter！");
    }
}

/**
 * @param {*} menus permission [必需]
 * @param {*} url 跳转路径 [必需]
 */
function getMenuByUrl(menus, url){
    var result = null;
    var getMenu = function(menus, url){
        for(var i = 0; i < menus.length; i++){
            if( menus[i].children.length > 0 ){
                getMenu(menus[i].children, url)
            }else if( menus[i].url == url ){
                result = menus[i];
            }else{
                var index = menus[i].url.indexOf(":");
                if(index > -1){
                    var prev = menus[i].url.slice(0, index);
                    if( url.indexOf(prev) > -1 ){
                        result = menus[i];
                    }
                }
            }
        }
    }
    getMenu(menus, url);
    return result;
}

/**
 * name 可空
 */
function getCurrentMenu(props, url, name){
    const { currentMenu, permission } = props;
    const { currentMenus } = currentMenu;
    var result = getMenuByUrl(permission, url);
    if(result){
        if(name) result.name = name;
        if(currentMenus.indexOf(result) == -1) currentMenus.push(result);
    }
    return currentMenus;
}

/**
 * 处理入参 过滤掉unerfined、null
 */
function handleInParams(obj){
    const newObj = {};
    for(let key in obj){
        const value = obj[key];
        if( typeof value !== "undefined" && value != null ){
            newObj[key] = value;
        }
    }
    return newObj;
}

function copyObj(data) {
    return JSON.parse(JSON.stringify(data));
}

//表单数据加密
function encrypt(data) {
    var key = CryptoJS.enc.Latin1.parse('0123456789abcdef');
    var iv = CryptoJS.enc.Latin1.parse('0123456789abcdef');
    return CryptoJS.AES.encrypt(data, key, {iv:iv,mode:CryptoJS.mode.CBC,padding:CryptoJS.pad.ZeroPadding}).toString();
}

// 保存数据到sessionStorage
function setSession(key, value){
    sessionStorage.setItem(key, value);
}

// 从sessionStorage里获取数据
function getSession(key){
    return sessionStorage.getItem(key);
}

// 下载文件、导出表单
function downloadFile(data, name){
    var fileName = name + new Date().getTime() + ".xls";
    if (window.navigator && window.navigator.msSaveBlob) {
        window.navigator.msSaveBlob(data, fileName);
    }else{
        const url = window.URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
    }
}

// 导出相关
function onSelect(record, selected, selectedRows, nativeEvent){
    var selectedExport = this.state.selectedExport;
    if( selected ){
        var flag = false;
        selectedExport.forEach((item, i) => {
            if( item.id == record.id ){
                flag = true;
                return;
            }
        });
        if( !flag ) selectedExport.push(record);
    }else{
        selectedExport.forEach((item, i) => {
            if( item.id == record.id ){
                selectedExport.splice(i, 1);
                return;
            }
        });
    }
    this.setState({selectedExport});
}

function onSelectAll(selected, selectedRows, changeRows){
    var selectedExport = this.state.selectedExport;
    if( selected ){
        changeRows.forEach(item => {
            var flag = false;
            selectedExport.forEach((item2, i) => {
                if(item2.id == item.id){
                    flag = true;
                    return;
                }
            });
            if( !flag ) selectedExport.push( item );
        });
    }else{
        changeRows.forEach(item => {
            selectedExport.forEach((item2, i) => {
                if(item2.id == item.id){
                    selectedExport.splice(i, 1);
                    return;
                }
            });
        });
    }
    this.setState({selectedExport});
}

function isAuthority(name, list){
    var arr = name.split(".");
    var id = authorityMap;
    for(var i = 0; i < arr.length; i++){
        id = id[arr[i]];
    }
    var flag = false;
    for(var i = 0; i < list.length; i++){
        if( list[i].id == id ){
            flag = true;
        }
    }
    return flag;
}

export { href, getCurrentMenu, handleInParams, copyObj, encrypt, setSession, getSession, downloadFile, onSelect, onSelectAll, isAuthority };