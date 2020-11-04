(window.webpackJsonp=window.webpackJsonp||[]).push([[20],{444:function(e,t,n){"use strict";(function(e){Object.defineProperty(t,"__esModule",{value:!0});var s=f(n(447)),o=f(n(28)),a=f(n(34)),r=function(e,t,n){return t&&i(e.prototype,t),n&&i(e,n),e};function i(e,t){for(var n=0;n<t.length;n++){var s=t[n];s.enumerable=s.enumerable||!1,s.configurable=!0,"value"in s&&(s.writable=!0),Object.defineProperty(e,s.key,s)}}n(445),n(27),n(33);var l=n(20),u=n(24),c=n(25),d=n(22),p=n(21),m=f(n(31));function f(e){return e&&e.__esModule?e:{default:e}}function h(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function g(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function y(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}var b=a.default.confirm,k="user.add",v="user.edit",S="user.del",w=(y(R,e.Component),r(R,[{key:"componentDidMount",value:function(){var e=this;this.getBranchList(function(){e.getList()})}},{key:"componentWillUnmount",value:function(){this.setState=function(e,t){}}},{key:"getBranchList",value:function(e){var t=this;(0,p.post)({url:"sysUser/queryBranchofficeInfoList",success:function(n){var s=n.map(function(e){return e.chnDescShort});t.setState({branchList:s}),e&&"function"==typeof e&&e()}})}},{key:"getRolesDetail",value:function(e,t){(0,p.post)({url:"sysUser/getRolesDetailByUserId",data:{userId:e},success:function(e){t&&"function"==typeof t&&t(e)}})}},{key:"getSearchFormOptions",value:function(){return[{type:"Select",label:"所属公司",name:"chnDescShort",span:6,list:this.state.branchList},{type:"Input",label:"用户工号",name:"userCode",span:6}]}},{key:"getAddFormOptions",value:function(){return[{type:"Input",label:"用户工号",name:"userCode",span:22,options:{rules:[{required:!0,message:"用户工号不可为空！"}]}},{type:"Input",label:"用户姓名",name:"userName",span:22,options:{rules:[{required:!0,message:"用户姓名不可为空！"}]}},{type:"Select",label:"所属公司",name:"chnDescShort",span:22,list:this.state.branchList,isHasAllSelect:!1,options:{rules:[{required:!0,message:"所属公司不可为空！"}]}},{type:"Select",label:"用户状态",name:"locked",span:22,list:this.state.statusList,isHasAllSelect:!1,options:{rules:[{required:!0,message:"用户状态不可为空！"}]}}]}},{key:"getFormOptions",value:function(){var e=this.state.currentUser,t=[{type:"Input",label:"用户工号",name:"userCode",span:6,length:5,disabled:!0,options:{initialValue:e.userCode,rules:[{required:!0,message:"用户工号不可为空！"}]}},{type:"Input",label:"用户姓名",name:"userName",span:6,length:5,options:{initialValue:e.userName,rules:[{required:!0,message:"用户姓名不可为空！"}]}},{type:"Select",label:"所属公司",name:"chnDescShort",span:6,length:5,list:this.state.branchList,isHasAllSelect:!1,options:{initialValue:e.chnDescShort,rules:[{required:!0,message:"所属公司不可为空！"}]}},{type:"Select",label:"用户状态",name:"locked",span:6,length:5,list:this.state.statusList,isHasAllSelect:!1,options:{initialValue:e.locked,rules:[{required:!0,message:"用户状态不可为空！"}]}}];return"detail"==this.state.currentAction&&(t=t.map(function(e){return e.disabled=!0,e})),t}},{key:"render",value:function(){var t=this,n=this.getSearchFormOptions(),s={aligin:"left",span:6,list:[{text:"查询",options:"queryOpt",event:this.search}]},o=this.state,a=o.table,r=o.selectedRowKeys,i=o.authorityList,l=o.editUserHasRole,u=o.detailUserHasRole,d=o.currentAction,p={table:a,onChange:this.getList,columns:this.columns,rowSelection:{selectedRowKeys:r,onChange:function(e,n){t.onChecked(e,n)}}},m={options:{title:"新增用户",okButtonProps:{loading:this.state.modalOkBtnLoading}},onRef:function(e){t.addModal=e},ok:this.addSubmit.bind(this)},f=this.getAddFormOptions(),h={options:{title:"edit"==d?"修改用户角色信息":"查看用户角色信息",width:"800px",okButtonProps:{loading:this.state.modalOkBtnLoading}},onRef:function(e){t.modal=e},ok:this.submit.bind(this)};"detail"==d&&(h.options.footer=null);var g=this.getFormOptions();return e.createElement(c.CardCommon,null,i&&e.createElement(c.CommonForm,{options:n,btnOptions:s,wrappedComponentRef:function(e){e&&e.props&&e.props.form&&(t.searcForm=e.props.form)}}),e.createElement("div",{className:"buttons"},e.createElement(c.CommonBtns,{options:{shape:"round",size:"small"},btns:this.state.btns})),i&&e.createElement(c.CommonTable,{options:p,onChecked:this.onChecked}),!i&&e.createElement("div",{className:"no-authority-box"},"无权限查看"),e.createElement(c.CommonModal,m,e.createElement("div",{className:"form-grid-6"},e.createElement(c.CommonForm,{options:f,wrappedComponentRef:function(e){e&&e.props&&e.props.form&&(t.addForm=e.props.form)}}))),e.createElement(c.CommonModal,h,e.createElement("div",null,e.createElement(c.CommonForm,{options:g,wrappedComponentRef:function(e){e&&e.props&&e.props.form&&(t.form=e.props.form)}}),l&&"edit"==d&&e.createElement(C,{datas:this.state.roles,currentAction:d,onRef:function(e){return t.transferCustom=e}}),u&&"detail"==d&&e.createElement(C,{datas:this.state.roles,currentAction:d,onRef:function(e){return t.transferCustom=e}}))))}}]),R);function R(t){h(this,R);var n=g(this,(R.__proto__||Object.getPrototypeOf(R)).call(this,t));return n.getList=function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{},t=n.state.table;t.setPage(e);var s=t.getParmaData();(0,p.post)({url:"sysUser/querySysUserListByParam",data:s,success:function(e){if(e&&e.rows){var o=e.rows.map(function(e,t){return e.index=(s.pageNum-1)*s.pageSize+t+1,e});t.setPage({dataList:o,total:e.total,pageNum:s.pageNum,pageSize:s.pageSize}),n.setState({table:t,selectedRowKeys:[],selectedRows:[]})}}})},n.onChecked=function(e,t){n.setState({selectedRowKeys:e,selectedRows:t})},n.search=function(){n.searcForm.validateFields(function(e,t){e||(t=(0,d.handleInParams)(t),n.getList({params:t,pageNum:1}))})},n.add=function(e){e(),n.addModal.show()},n.addSubmit=function(){n.setState({modalOkBtnLoading:!0}),n.addForm.validateFields(function(e,t){e?n.setState({modalOkBtnLoading:!1}):(t=(0,d.handleInParams)(t),(0,p.post)({url:"sysUser/insert",data:t,btn:function(){return n.setState({modalOkBtnLoading:!1})},success:function(e){o.default.success("添加用户成功！"),n.addModal.hide(),n.getList({pageNum:1})}}))})},n.edit=function(e){0==n.state.selectedRows.length?(e(),o.default.warning("必须选择一个选项才能编辑！")):1<n.state.selectedRows.length?(e(),o.default.warning("只能选择一个选项！")):(e(),n.getRolesDetail(n.state.selectedRows[0].id,function(e){n.setState({currentAction:"edit",currentUser:n.state.selectedRows[0],roles:e.roles}),n.modal.show()}))},n.detail=function(e){n.getRolesDetail(e.id,function(t){n.setState({currentAction:"detail",currentUser:e,roles:t.roles}),n.modal.show()})},n.submit=function(){n.setState({modalOkBtnLoading:!0}),n.form.validateFields(function(e,t){e?n.setState({modalOkBtnLoading:!1}):((t=(0,d.handleInParams)(t)).userId=n.state.currentUser.id,n.state.editUserHasRole&&(t.authorizedRoleIds=n.transferCustom.state.targetKeys),(0,p.post)({url:"sysUser/updateSysUserRole",data:t,btn:function(){return n.setState({modalOkBtnLoading:!1})},success:function(e){o.default.success("修改成功"),n.modal.hide(),n.getList({pageNum:1})}}))})},n.del=function(e){if(0==n.state.selectedRows.length)e(),o.default.warning("请至少选择一行数据");else{var t=n.state.selectedRows.map(function(e){return e.userCode}),s=n.state.selectedRows.map(function(e){return e.userName});b({title:"确认删除【"+s.join("、")+"】吗?",okType:"danger",onOk:function(){(0,p.post)({url:"sysUser/delete",data:{userCodes:t},btn:e,success:function(e){o.default.success("删除成功"),n.getList({pageNum:1})}})},onCancel:e})}},n.state={branchList:[],table:new m.default,selectedRowKeys:[],selectedRows:[],btns:[{name:"新增",id:k,icon:"plus-circle",onClick:n.add},{name:"修改",id:v,icon:"edit",onClick:n.edit},{name:"删除",id:S,icon:"minus-circle",onClick:n.del}].filter(function(e){return(0,d.isAuthority)(e.id,t.authority)}),modalOkBtnLoading:!1,currentAction:"",statusList:[{key:"0",text:"启用"},{key:"1",text:"禁用"}],currentUser:{},roles:{authorizedRoles:[],unauthorizedRoles:[]},authorityList:(0,d.isAuthority)("user.list",t.authority),editUserHasRole:(0,d.isAuthority)("user.editUserHasRole",t.authority),detailUserHasRole:(0,d.isAuthority)("user.detailUserHasRole",t.authority)},n.columns=[{title:"编号",dataIndex:"index"},{title:"用户工号",dataIndex:"userCode"},{title:"用户姓名",dataIndex:"userName"},{title:"所属公司",dataIndex:"chnDescShort"},{title:"用户状态",dataIndex:"locked",render:function(e){return"0"==e?"启用":"禁用"}},{title:"操作",key:"action",render:function(t){return e.createElement("a",{onClick:function(){return n.detail(t)}},"查看")}}],n.searcForm,n.addModal,n.addForm,n.modal,n.form,n.transferCustom,n}var C=(y(L,e.Component),r(L,[{key:"componentDidMount",value:function(){this.props.onRef&&this.props.onRef(this);var e=this.props.datas,t=e.authorizedRoles,n=e.unauthorizedRoles,s=t.concat(n).map(function(e,t){return{key:e.id,title:e.name}}),o=t.map(function(e){return e.id}),a="detail"==this.props.currentAction;this.setState({dataSource:s,targetKeys:o,disabled:a})}},{key:"componentWillUnmount",value:function(){this.setState=function(e,t){}}},{key:"render",value:function(){var t=this.state,n=t.dataSource,o=t.targetKeys,a=t.disabled;return e.createElement("div",{style:{paddingTop:"10px",paddingBottom:"10px"}},e.createElement("div",null,"角色分配："),e.createElement(s.default,{className:"user-edit-transfer",titles:["未授权角色","已授权角色"],dataSource:n,targetKeys:o,disabled:a,onChange:this.handleChange,render:function(e){return e.title}}))}}]),L);function L(e){h(this,L);var t=g(this,(L.__proto__||Object.getPrototypeOf(L)).call(this,e));return t.handleChange=function(e){t.setState({targetKeys:e})},t.state={dataSource:[],targetKeys:[],disabled:!1},t}t.default=(0,u.connect)(function(e){return{authority:e.authority}})((0,l.withRouter)(w))}).call(this,n(1))}}]);