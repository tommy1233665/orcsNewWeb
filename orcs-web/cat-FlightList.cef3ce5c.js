(window.webpackJsonp=window.webpackJsonp||[]).push([[5],{426:function(e,t,n){"use strict";(function(e){Object.defineProperty(t,"__esModule",{value:!0});function o(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}var a=n(20),i=n(25),r=n(22),s=n(21),l=c(n(31)),u=c(n(220));function c(e){return e&&e.__esModule?e:{default:e}}var f=(function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}(p,e.Component),function(e,t,n){t&&o(e.prototype,t),n&&o(e,n)}(p,[{key:"componentDidMount",value:function(){var e=this;this.columns=(0,i.riskCAirportColumns)({detailUrl:"/FlightRiskDetail/",onLook:function(t){e.setState({treeParams:{soflSeqNr:t.flightCode}}),e.modal.show()}});var t=(0,r.getSession)("flightList"),n=t?JSON.parse(t):{};this.getList({params:n})}},{key:"componentWillUnmount",value:function(){this.setState=function(e,t){}}},{key:"componentDidUpdate",value:function(){document.addEventListener("keydown",this.onkeydown)}},{key:"render",value:function(){var t=this,n=this.state.table,o={notCheck:!0,columns:this.columns,table:n,onChange:this.getList},a={options:{title:"风险值展示",footer:null,width:"60%"},onRef:function(e){t.modal=e}};return e.createElement(i.CardCommon,{className:"flight-list"},e.createElement("div",{className:"flight-list-title"},"航班详情列表"),e.createElement(i.CommonTable,{options:o}),e.createElement(i.CommonModal,a,e.createElement(u.default,{treeParams:this.state.treeParams,isHistory:!1,hasAction:!0})))}}]),p);function p(e){!function(e,t){if(!(e instanceof p))throw new TypeError("Cannot call a class as a function")}(this);var t=function(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}(this,(p.__proto__||Object.getPrototypeOf(p)).call(this,e));return t.onkeydown=function(e){13===e.keyCode&&t.submit()},t.getList=function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{},n=t.state.table;n.setPage(e);var o=(0,r.handleInParams)(n.getParmaData());(0,s.post)({url:"flitDetail/queryFlitDetailByParam",data:o,success:function(e){if(e&&e.pages){var o=e.pages;n.setPage({dataList:o.list,total:o.total,pageNum:o.pageNum,pageSize:o.pageSize}),t.setState({table:n})}}})},t.state={table:new l.default,treeParams:{}},t.columns,t.modal,t}t.default=(0,a.withRouter)(f)}).call(this,n(1))}}]);