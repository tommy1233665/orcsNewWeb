import { withRouter, Link } from "react-router-dom";
import { Modal, message, Tabs } from 'antd';
import moment from 'moment';
import { connect } from 'react-redux';
import { updateCurrentMenu } from 'reduxs/action';
import { CardCommon, CommonTable, CommonForm, riskCAirportColumns, ChartsTip, CommonBtns, CommonModal } from "common/component";
import { handleInParams, href, getCurrentMenu, isAuthority } from "common/commonFn";
import { post } from "common/http";
import PageModel from 'model/pageModel';
import RiskValueTree from 'common/custom/riskValueTree';
import React, { Component } from 'react';
import { Menu, Icon,Switch } from 'antd';
const SubMenu = Menu.SubMenu;

const { confirm } = Modal;
const { TabPane } = Tabs;

const LIST = "flightRiskShow.list"; // 查询航班风险
const LISTHISTORY = "flightRiskShow.listHistory"; // 航班历史风险查询
const COUNTFLIGHTRISKVALUE = "flightRiskShow.countFlightRiskValue"; // 计算航班风险值 

// 目前航班风险页面和历史航班风险页面用的是相同的，以后若需不同，直接改下面对应的值就行
const CURRENTTREE = "flightRiskShow.currentTree"; // 航班风险树信息--航班风险页面
const HISTORYTREE = "flightRiskShow.historyTree"; // 航班历史风险树信息--航班风险页面
const HISTORYDEATIL = "flightRiskShow.historyDetail"; // 航班历史风险明细查询--航班风险页面(风险详情)
const HISTORYTLIST = "flightRiskShow.historyList"; // 航班历史风险总值明细--航班风险页面(历史风险list)

const CURRENTTREEHISTORY = "flightRiskShow.currentTree"; // 航班风险树信息--历史航班风险页面
const HISTORYTREEHISTORY = "flightRiskShow.historyTree"; // 航班历史风险树信息--历史航班风险页面
const HISTORYDEATILHISTORY = "flightRiskShow.historyDetail"; // 航班历史风险明细查询--历史航班风险页面(风险详情)
const HISTORYTLISTHISTORY = "flightRiskShow.historyListHistory"; // 航班历史风险总值明细--历史航班风险页面(历史风险list)

class FlightRisk extends React.Component {

    constructor(props) {
        super(props);
        var isHistory = props.match.path.indexOf("History") == -1 ? false : true;
        var authorityListString = isHistory ? LISTHISTORY : LIST;
        this.state = {
            isHistory: isHistory,
            table: new PageModel(),
            selectedRowKeys: [],
            selectedRows: [], // table里被选中的行
            treeParams:{}, // 请求树时使用                         
            form: {
                performanceTypeList: [], // 性能机型数据
                branchInfoList: [], // 公司下拉数据
                userBelongsToCompany: "", //登录员工属于的公司的三字码  
     //           riskParamsMapList:[],//风险参数数据             
            },
            historyTable: new PageModel({pageSize: 5}),
            fltNr: "",        
            authorityList: isAuthority(authorityListString, props.authority),
            authorityCountFlightRiskValue: isAuthority(COUNTFLIGHTRISKVALUE, props.authority),
            authorityCurrentTree: isAuthority(CURRENTTREE, props.authority),
            authorityCurrentTreeHistory: isAuthority(CURRENTTREEHISTORY, props.authority),
            authorityHistoryList: isAuthority(HISTORYTLIST, props.authority),
            authorityHistoryListHistory: isAuthority(HISTORYTLISTHISTORY, props.authority),
            authorityHistoryTree: isAuthority(HISTORYTREE, props.authority),
            authorityHistoryTreeHistory: isAuthority(HISTORYTREEHISTORY, props.authority),
            authorityHistoryDetail: isAuthority(HISTORYDEATIL, props.authority),
            authorityHistoryDetailHistory: isAuthority(HISTORYDEATILHISTORY, props.authority)
        };
        this.columns;
        this.historyColumns;
        this.form;
        this.modal1;
        this.modal2;
        this.detailUrl = this.state.isHistory ? "/HistoryFlightRiskDetail/" : "/FlightRiskDetail/"; 
        this.timer;
    }

    componentDidMount(){
        this.getData();
        this.columns = riskCAirportColumns({
            detailUrl: this.detailUrl, 
            onLook: (data) => {
                this.setState({
                    treeParams: {soflSeqNr: data.flightCode},
                    fltNr: data.fltNr
                });
                this.modal1.show();
                this.getHisTotaleRiskValue({params: {soflSeqNr: data.flightCode}});
            }
        });
        this.historyColumns = [
            { title: "风险计算时间", dataIndex: "analysisTime"},
            { title: "起飞阶段风险值", dataIndex: "flyingRiskValue" },
            { title: "巡航阶段风险值", dataIndex: "cruiseRiskValue" },
            { title: "着陆阶段风险值", dataIndex: "landRiskValue" },
            { 
                title: "风险明细", 
                key: "action1", 
                render: (text, record) => {
                    return <a onClick={() => this.onLook2(record)}>查看</a>;
                }
            },
            { 
                title: "风险详情", 
                key: "action2", 
                render: (text, record) => {
                    const { isHistory, authorityHistoryDetail, authorityHistoryDetailHistory } = this.state;
                    if( (isHistory && authorityHistoryDetailHistory) || (!isHistory && authorityHistoryDetail) ){
                        return <Link to={`${this.detailUrl}${record.flightCode}/${record.batchNum}`} target="_blank">查看</Link>
                    }else{
                        return <a onClick={() => {message.info("没有权限查看")}}>查看</a>
                    }
                }
            }
        ];

        //获得风险参数列表
       // this.getAllRiskTabs();
       
     //   this.getAllRiskParams();
        // 是否是历史航班风险
        const { isHistory } = this.state;
        if( !isHistory ){
            this.timer = setInterval( () => {
                this.refresh();
            }, 30000);
        }
    }

    /*getAllRiskTabs(callback){
        post({
            url: "airLineRisk/getAllRiskTabs",
            success: data => {
                this.setState({
                    riskParamsMapList: data
                });
            }
        });
    }*/

    componentWillUnmount(){
        if( !this.state.isHistory ){
            clearInterval(this.timer);
        }
        this.setState = (state, callback) => {
            return;
        };
    }
    
    componentDidUpdate(){
		document.addEventListener('keydown',this.onkeydown);
    }
    
    onkeydown = (e)=>{
		if (e.keyCode === 13) {
			this.submit()
		}
	}
    onLook2(data){
        const { isHistory, authorityHistoryTree, authorityHistoryTreeHistory } = this.state;
        if( (isHistory && authorityHistoryTreeHistory) || (!isHistory && authorityHistoryTree)){
            this.setState({
                treeParams: {soflSeqNr: data.flightCode, batchNum: data.batchNum}
            });
            this.modal2.show();
        }else{
            message.info("没有查看权限");
        }
    }

    /**
     * 定时任务，定时刷新页面，根据查询条件
     */
    refresh(){
        post({
            url: "airLineRisk/queryRedisKeys",
            success: (data) => {
                if( data.success == "1" ){
                    this.getList();
                }
            }
        });
    }

    /**
     * 查询公司、机型
     */ 
    getData() {
        let url = this.state.isHistory ? "airLineRisk/queryHisRiskFlightAll" : "airLineRisk/queryRiskFlightAll";
        post({
            url: url,
            success: data => {
                this.setState({form: data});
                this.getList();
            }
        });
    }

    /**
     * 计算
     * callback:通用按钮的按钮状态恢复
     */
    calculate(callback){
        let selectedRows = this.state.selectedRows;
        if( selectedRows.length == 0 ) {
            Modal.info({ content: "请选择需要计算的航班！!" });
            callback();
            return;
        }
        const msgFun = message.loading('后台正在计算，耐心等候', 0);
        let arr = selectedRows.map((item) => {
            return "flitSoflSeqNrs=" + item.soflSeqNr;
        });
        let This = this;
        post({
            url: "droolsEngine/math",
            data: arr.join("&"),
            timeout: 1200, // 20分钟
            btn: () => {
                callback();
                msgFun && typeof msgFun == "function" && msgFun();
            },
            success: data => {
                if( data.success ){
                    confirm({
                        title: "计算风险完毕！是否需要刷新页面？",
                        onOk() {
                            This.getList({
                                params: {filtSoflSeqNrs: selectedRows.map((item) => item.soflSeqNr)}, 
                                pageNum: 1
                            });
                        }
                    });
                }else{
                    message.error("网络出错，计算风险值失败！");
                }
            }
        });
    }

    /**
     * 告警列表
     */
    warnList(callback){
        callback(); // 按钮状态恢复
        const url = "/index/flightRisk/RiskWarnList";
        var currentMenus = getCurrentMenu(this.props, url);
        this.props.updateCurrentMenu({
            currentMenus: currentMenus
        });
        href(this, url);
    }
    
    /**
     * 勾选选择
     */
    onChecked = (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys, selectedRows });
    }

    /**
     * 请求list接口
     * 特殊处理查询参数中的全部
     */
    getList = ( obj = {} ) => {
        var values = this.form ? this.handleSearchParams(this.form.getFieldsValue()) : {};
        obj.params = Object.assign({}, values, obj.params);
        const table = this.state.table;
        table.setPage(obj);
        let params = table.getParmaData();
        // 校验
        if( !(params.fltNr || ( params.latestDepArpChineseName && params.latestArvArpChineseName ) ) ){
            const date = moment(params.start, "YYYY-MM-DD");
            const date2 = moment(params.end, "YYYY-MM-DD");
            const diffTime = date2.diff(date, "minute"); //计算相差的分钟数
           // const nowDate =moment().format("YYYY-MM-DD");
           // const diffNowTme = date1.diff(nowDate,"days");
           // const diffNowTme2 = date2.diff(nowDate,"days");
            if( diffTime >= 2*24*60 ){
                Modal.info({content: "未指定航班或航线，只能查询1天范围数据！"});
                return;
            }
            /*if(diffNowTme>0 || diffNowTme2>0){
                Modal.info({content: "历史航班风险查询中无大于当前时间范围的数据！"});
                return;
            }*/

        }
        
        let url = this.state.isHistory ? "airLineRisk/queryHisRiskFlightByParam" : "airLineRisk/queryAirLineRiskByParam";
        post({
            url: url,
            data: params,
            success: (res) => {
                if( res && res.pages ){
                    let result = res.pages;
                    table.setPage({ dataList: result.list, total: result.total, pageNum: result.pageNum, pageSize: result.pageSize });
                    this.setState({ table, selectedRowKeys: [], selectedRows: [] });
                }
            }
        });
    }

    /**
     * 请求历史风险
     */
    getHisTotaleRiskValue = ( obj = {} ) => {
        const table = this.state.historyTable;
        table.setPage(obj);
        let params = table.getParmaData();
        let url = this.state.isHistory ? "airLineRisk/queryTotalRiskValueForHis" : "airLineRisk/queryHisTotaleRiskValue";
        post({
            url: url,
            data: params,
            success: (res) => {
                let result = res.rmRiskpages;
                table.setPage({ dataList: result.list, total: result.total, pageNum: result.pageNum, pageSize: result.pageSize });
                this.setState({ historyTable: table });
            }
        });
    }
    

    //接收子组件传过来的数据
    /*recieveRiskTabsData(data){
        this.setState({
            riskParamsMapList :data
        })
    }*/
    /**
     * 处理查询参数（航班日期范围的特殊处理）
     * 处理参数中要处理“全部”这种特殊情况
     */
    handleSearchParams(values){
        const params = handleInParams(values);
        for(let key in params){
            if( key == "date" && params[key].length == 2 ){
                params["start"] = moment(params[key][0]).format("YYYY-MM-DD");
                params["end"] = moment(params[key][1]).format("YYYY-MM-DD");
                delete params[key];
            }
            if( key == "latestEqpCds" ){
                if( !Array.isArray(params[key]) && params[key].value ){
                    params[key] = params[key].value;
                }
            }
            if(key == "riskTabs"){
                if(params[key] != ""){
                 //   params[key] = params[key].riskParamsMapList;
                  params[key] = params[key].value;
                }
                              
            }       
            if(key == "riskValue"){
                if(params[key] != ""){
                 //   params[key] = params[key].riskParamsMapList;
                  params[key] = params[key].value;
                }
                              
            }                
        }
        return params;
    }

    /**
     * 查询
     */
    submit = (callback) => {
        callback && typeof callback == "function" && callback();
        event.preventDefault();
        this.form.validateFields((err, values) => {
            if( !err ){
                values = this.handleSearchParams(values);
                this.getList({params: values, pageNum: 1});
            }
        });
    }

    /**
     * 重置
     */
    reset = (callback) => {
        callback && typeof callback == "function" && callback();
        this.form.resetFields();
        this.submit();
    }

    /**
     * 获取form表的配置
     */
    getFormOptions(){
        const { isHistory,riskParamsMapList } = this.state;
        { /*滤掉重庆选项*/ }
        const branchInfoList = this.state.form.branchInfoList.filter( item => item.branchCd != 'CKG').map((item, index) => {
            return {key: item.branchCd, text: item.branchCd + item.chnDescShort};
        });
        const performanceTypeList = this.state.form.performanceTypeList.map((item) => {
            return { label: item.performanceType, value: item.performanceType }
        });
    //    const riskParamsMapList = this.state.form.riskParamsMapList;
           
        var date = isHistory ? moment().subtract(3, 'days') : moment(); // 获取7天前的日期 
    //    var date2 =isHistory ? moment().subtract(1,'days') : moment();
        var comp = isHistory ? this.state.form.userBelongsToCompany : "";
        var datas = { 
            date: [date, date], 
            comp: comp, 
         //   condition: "conditionBranchCode",
            latestEqpCds: performanceTypeList.map(item => item.value),
            flightStatus: "",
            riskValue: "",  
            riskTabs:"",        
            sorder: "update_time"
        };
        return [
            {
                type: "RangePicker",
                label: "航班日期",
                name: "date",
                span: 8,
                options: {
                    initialValue: datas.date
                }
            },
            {
                type: "Input",
                label: "出发机场",
                name: "latestDepArpChineseName",
                span: 6,
                placeholder: "出发机场，如：广州,CAN,ZGGG",
                options: {
                    initialValue: datas.latestDepArpChineseName
                }
            },
            {
                type: "Input",
                label: "航班号",
                name: "fltNr",
                span: 6,
                length: 3,
                placeholder: "航班号，如：3027",
                options: {
                    initialValue: datas.fltNr
                },
            },
            {
                type: "Select",
                label: "阶段",
                name: "flightStatus",
                span: 4,
                length: 3,
                list: [
                    {key: "flying", text: "起飞阶段"},
                    {key: "cruise", text: "巡航阶段"},
                    {key: "landed", text: "着陆阶段"},
                ],
                options: {
                    initialValue: datas.flightStatus
                }
            },
            {
                type: "Select",
                label: "公司",
                name: "comp",
                span: () => {
                    return (this.form && this.form.getFieldValue("comp") == "") ? 8 : 8;
                },
                list: branchInfoList,
                options: {
                    initialValue: datas.comp
                }
            },
          /*  {
                type: "Select",
                name: "condition",
                span: 3,
                list: [
                    {key: "conditionTailNr", text: "按飞机"},
                    {key: "conditionBranchCode", text: "按航班"},
                    {key: "crew", text: "按机组"},
                ],
                options: {
                    initialValue: datas.condition
                },
                isHasAllSelect: false,
                hide: () => {
                    return this.form && this.form.getFieldValue("comp") == "" ? true : false;
                }
            },*/
            {
                type: "Input",
                label: "到达机场",
                name: "latestArvArpChineseName",
                span: 6,
                placeholder: "到达机场，如：南京,NKG,ZSNJ",
                options: {
                    initialValue: datas.latestArvArpChineseName
                }
            },
            {
                type: "Input",
                label: "机尾号",
                name: "latestTailNr",
                span: 6,
                length: 3,
                placeholder: "机尾号，如：B6378",
                options: {
                    initialValue: datas.latestTailNr
                },
            },
            {
                type: "Select",
                label: "排序",
                name: "order",
                span: 4,
                length: 3,
                list: [
                    {key: "update_time", text: "按更新时间"} ,
                    {key: "latest_dep_dt", text: "按滑出时间"},
                    {key: "latest_arv_dt", text: "按滑入时间"},
                    {key: "total_value", text: "按风险值"}
                ],
                options: {
                    initialValue: datas.sorder
                }
            },
            {
                type: "CheckboxCustom",
                label: "机型组",
                name: "latestEqpCds",
                span: 16,
                list: performanceTypeList,
                options: { initialValue: datas.latestEqpCds },
            },
          {
              //  type: "RiskTabsCustom", 
                type: "RiskTabsTreeSelect", 
                label: "风险项",
                name: "riskTabs",
                span: 4,
                length: 3,               
                list: riskParamsMapList,
                options: {
                    initialValue: datas.riskTabs
                }
            },
            {
                type: "MultipleSelect",
                label: "风险值",
                name: "riskValue",
                span: 4,
                length: 3,
                list: [
                    {key: "H", text: "高"},
                    {key: "M", text: "中"},
                    {key: "L", text: "低"},
                ],
                options: {
                    initialValue: datas.riskValue
                }
            },
            
        ];
    }

    render() {
        // 表单参数
        const formOptions = this.getFormOptions();
        
        const { isHistory, treeParams, table, historyTable, selectedRowKeys, 
            authorityList, authorityCountFlightRiskValue, 
            authorityCurrentTree, authorityCurrentTreeHistory, 
            authorityHistoryList, authorityHistoryListHistory } = this.state;
        // 航班风险表格参数
        const tableOptions = {
            table: table,
            columns: this.columns,
            rowSelection: {
                selectedRowKeys,
                onChange: (selectedRowKeys, selectedRows) => { // 选中项发生变化时的回调
                    this.onChecked(selectedRowKeys, selectedRows);
                },
            },
            onChange: this.getList
        }
        // 历史风险表格参数
        const historyTableOptions = {
            notCheck: true,
            table: historyTable,
            columns: this.historyColumns,
            onChange: this.getHisTotaleRiskValue,
        }
        // 按钮组
        const btns = authorityList ? [
            { name: "查询", id: authorityList, type: "primary", icon: "search", onClick: this.submit.bind(this) },
            { name: "重置", id: authorityList, icon: "reload", onClick: this.reset.bind(this)},
        ] : [];
        if( !isHistory ) {
            if( authorityCountFlightRiskValue ) btns.push({ name: "计算", icon: "calculator", type: "primary", onClick: this.calculate.bind(this) });
            btns.push({ name: "告警列表", icon: "unordered-list", onClick: this.warnList.bind(this) });
        }

        // 模态框参数
        const modalOptions1 = {
            options: {
                title: "风险节点信息",
                footer: null,
                width: "60%",
            },
            onRef: (ref) => {this.modal1 = ref}
        };
        const modalOptions2 = {
            options: {
                title: "历史风险值展示",
                footer: null,
                bodyStyle: {
                    height: "443px",
                    overflow: "auto"
                }
            },
            onRef: (ref) => {this.modal2 = ref}
        };
        return (
            <CardCommon className="flight-risk">
                { authorityList && <CommonForm options={formOptions} wrappedComponentRef={(form) => { if(form && form.props && form.props.form) this.form = form.props.form;}}></CommonForm>}
                <div className="buttons clearfix">
                    <CommonBtns btns={btns} />
                    <div className="fr">
                        <ChartsTip low="1.0-4.0" middle="4.1-7.0" height="7.1-10.0"></ChartsTip>
                        <div className="text-danger text-right">*以北京时间显示</div>
                    </div>
                </div>
                { authorityList && <CommonTable options={tableOptions} onChecked={this.onChecked}></CommonTable>}
                { !authorityList && <div className="no-authority-box">无权限查看</div> }
                <CommonModal {...modalOptions1}>
                    <Tabs className="flight-risk-tab" defaultActiveKey="1" size="small">
                        <TabPane tab="当前风险" key="1">
                            { authorityCurrentTree && !isHistory && <RiskValueTree treeParams={treeParams} isHistory={isHistory} hasAction={isHistory?false:true} />}
                            { !authorityCurrentTree && !isHistory && <div className="no-authority-box">无权限查看</div> }
                            { authorityCurrentTreeHistory && isHistory && <RiskValueTree treeParams={treeParams} isHistory={isHistory} hasAction={isHistory?false:true} />}
                            { !authorityCurrentTreeHistory && isHistory && <div className="no-authority-box">无权限查看</div> }
                        </TabPane>
                        <TabPane tab="历史风险" key="2">
                            { authorityHistoryList && !isHistory && <CommonTable options={historyTableOptions}></CommonTable> }
                            { !authorityHistoryList && !isHistory && <div className="no-authority-box">无权限查看</div> }
                            { authorityHistoryListHistory && isHistory && <CommonTable options={historyTableOptions}></CommonTable> }
                            { !authorityHistoryListHistory && isHistory && <div className="no-authority-box">无权限查看</div> }
                            <CommonModal {...modalOptions2}>
                                <RiskValueTree treeParams={treeParams} isHistory={isHistory} />
                            </CommonModal>
                        </TabPane>
                    </Tabs>
                </CommonModal>
            </CardCommon>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        permission: state.permission,
        currentMenu: state.currentMenu,
        authority: state.authority
    };
}

const mapDispatchToProps = (dispatch) => {
    return {
        updateCurrentMenu: (currentMenu) => dispatch(updateCurrentMenu(currentMenu))
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(FlightRisk));