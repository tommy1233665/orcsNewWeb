(window.webpackJsonp=window.webpackJsonp||[]).push([[13],{432:function(e,t,n){"use strict";(function(e){Object.defineProperty(t,"__esModule",{value:!0});var a=m(n(28)),o=m(n(34));function i(e,t){for(var n=0;n<t.length;n++){var a=t[n];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}n(27),n(33);var r=n(20),s=n(24),l=n(25),u=n(22),c=n(21),d=m(n(31));function m(e){return e&&e.__esModule?e:{default:e}}var p=o.default.confirm,f="rmArptRiskParam.add",h="rmArptRiskParam.edit",g="rmArptRiskParam.del",y=(function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}(k,e.Component),function(e,t,n){t&&i(e.prototype,t),n&&i(e,n)}(k,[{key:"componentDidMount",value:function(){this.getList()}},{key:"componentWillUnmount",value:function(){this.setState=function(e,t){}}},{key:"getSearchFormOptions",value:function(){return[{type:"Input",label:"关键字搜索",name:"keyWordSearch",span:8,length:5,placeholder:"请输入编号、飞行阶段、风险因素搜索"}]}},{key:"getFormOptions",value:function(){var e="add"==this.state.currentAction?{}:this.state.currentData;return[{type:"Input",label:"编号",name:"itemNum",span:24,options:{initialValue:e.itemNum,rules:[{required:!0,message:"编号不可为空！"}]}},{type:"Input",label:"飞行阶段",name:"flyPhase",span:24,options:{initialValue:e.flyPhase,rules:[{required:!0,message:"飞行阶段不可为空！"}]}},{type:"Input",label:"风险因素",name:"riskItem",span:24,placeholder:"字数不能超80！",options:{initialValue:e.riskItem,rules:[{required:!0,message:"风险因素不可为空！"},{max:80,message:"字数不能超80！"}]}},{type:"Input",label:"风险值",name:"riskValue",span:24,options:{initialValue:e.riskValue,rules:[{required:!0,message:"风险值不可为空！"}]}},{type:"Select",label:"维护期限",name:"operPeriod",span:24,list:this.state.operPeriodList,isHasAllSelect:!1,options:{initialValue:e.operPeriod}}]}},{key:"render",value:function(){var t=this,n=this.state,a=n.table,o=n.modalOkBtnLoading,i=n.currentAction,r=n.selectedRowKeys,s=n.authorityList,u=this.getSearchFormOptions(),c={aligin:"left",span:6,list:[{text:"查询",options:"queryOpt",event:this.search}]},d={key:"itemNum",columns:this.columns,table:a,rowSelection:{selectedRowKeys:r,onChange:function(e,n){t.onChecked(e,n)}},onChange:this.getList},m={options:{title:"add"==i?"新增":"edit"==i?"修改":"",okButtonProps:{loading:o}},onRef:function(e){t.modal=e},ok:this.submit.bind(this)},p=this.getFormOptions();return e.createElement(l.CardCommon,null,s&&e.createElement(l.CommonForm,{options:u,btnOptions:c,wrappedComponentRef:function(e){e&&e.props&&e.props.form&&(t.searcForm=e.props.form)}}),e.createElement("div",{className:"buttons"},e.createElement(l.CommonBtns,{options:{shape:"round",size:"small"},btns:this.state.btns})),s&&e.createElement(l.CommonTable,{options:d,onChecked:this.onChecked}),!s&&e.createElement("div",{className:"no-authority-box"},"无权限查看"),e.createElement(l.CommonModal,m,e.createElement("div",{className:"mb30"},"机场风险因素:"),e.createElement("div",{className:"form-grid-5",style:{paddingLeft:"60px",paddingRight:"70px"}},e.createElement(l.CommonForm,{options:p,wrappedComponentRef:function(e){e&&e.props&&e.props.form&&(t.form=e.props.form)}}))))}}]),k);function k(e){!function(e,t){if(!(e instanceof k))throw new TypeError("Cannot call a class as a function")}(this);var t=function(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}(this,(k.__proto__||Object.getPrototypeOf(k)).call(this,e));return t.getList=function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{},n=t.state.table;n.setPage(e);var a=n.getParmaData();(0,c.post)({url:"rmArptRiskParam/queryRmArptRiskParamListByParam",data:a,success:function(e){if(e&&e.rows){var o=e.rows.map(function(e,t){return e.index=(a.pageNum-1)*a.pageSize+t+1,e});n.setPage({dataList:o,total:e.total,pageNum:a.pageNum,pageSize:a.pageSize}),t.setState({table:n,selectedRowKeys:[],selectedRows:[]})}}})},t.onChecked=function(e,n){t.setState({selectedRowKeys:e,selectedRows:n})},t.search=function(){t.searcForm.validateFields(function(e,n){e||(n=(0,u.handleInParams)(n),t.getList({params:n,pageNum:1}))})},t.add=function(e){e(),t.setState({currentAction:"add"}),t.modal.show()},t.edit=function(e){0==t.state.selectedRows.length?(e(),a.default.warning("必须选择一个选项才能编辑！")):1<t.state.selectedRows.length?(e(),a.default.warning("只能选择一个选项！")):(e(),t.setState({currentAction:"edit",currentData:t.state.selectedRows[0]}),t.modal.show())},t.submit=function(){t.setState({modalOkBtnLoading:!0}),t.form.validateFields(function(e,n){var o,i;e?t.setState({modalOkBtnLoading:!1}):(n=(0,u.handleInParams)(n),i="add"==t.state.currentAction?(o="rmArptRiskParam/addRmArptRiskParam","添加成功"):(o="rmArptRiskParam/updateRmArptRiskParam","修改成功"),(0,c.post)({url:o,data:n,btn:function(){return t.setState({modalOkBtnLoading:!1})},success:function(e){a.default.success(i),t.modal.hide(),t.getList({pageNum:1})}}))})},t.del=function(e){if(0==t.state.selectedRows.length)e(),a.default.warning("请至少选择一行数据");else{var n=t.state.selectedRows.map(function(e){return e.itemNum});p({title:"确认删除【"+n.join("、")+"】吗?",okType:"danger",onOk:function(){(0,c.post)({url:"rmArptRiskParam/deleteRmArptRiskParam",data:{ids:n},btn:e,success:function(e){a.default.success("删除成功"),t.getList({pageNum:1})}})},onCancel:e})}},t.state={table:new d.default,selectedRowKeys:[],selectedRows:[],btns:[{name:"新增",id:f,icon:"plus-circle",onClick:t.add},{name:"修改",id:h,icon:"edit",onClick:t.edit},{name:"删除",id:g,icon:"minus-circle",onClick:t.del}].filter(function(t){return(0,u.isAuthority)(t.id,e.authority)}),modalOkBtnLoading:!1,currentAction:"",operPeriodList:["暂无需求","一年","半年","三个月"],currentData:{},authorityList:(0,u.isAuthority)("rmArptRiskParam.list",e.authority)},t.columns=[{title:"序号",dataIndex:"index",width:50},{title:"编号",dataIndex:"itemNum",width:100},{title:"飞行阶段",dataIndex:"flyPhase",width:150,isTooltip:!0},{title:"风险因素",dataIndex:"riskItem",className:"text-left",isTooltip:!0},{title:"风险值",dataIndex:"riskValue",width:100},{title:"维护期限",dataIndex:"operPeriod",width:100}],t.modal,t.form,t}t.default=(0,s.connect)(function(e){return{authority:e.authority}})((0,r.withRouter)(y))}).call(this,n(1))}}]);