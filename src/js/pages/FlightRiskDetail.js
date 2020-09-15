import { withRouter, Link } from "react-router-dom";
import { connect } from 'react-redux';
import { Button, message } from "antd";
import moment from 'moment';
import { CardCommon, FourBorder, CommonDrawer, CommonTable, riskValueFilter, commonBtnOpt, ChartsTip, CommonModal } from "common/component";
import { isAuthority } from "common/commonFn";
import { post } from "common/http";
import PageModel from 'model/pageModel';

const NOTICE = "flightRiskShow.notice"; // 查看重要通告
const QARROUTE = "flightRiskShow.qarRoute";//QAR航线入口
const QAR = "flightRiskShow.qar"; // 查看QAR监控事件
const NEWCALRESULT = "flightRiskShow.newCalculationResults";

class FlightRiskDetail extends React.Component {

    constructor(props) {
        super(props);
        var btns = [
            {name: "QAR监控事件", id: QAR, className: "sort-btn", options: commonBtnOpt.envitOpt, key: "depArpCd", event: this.onEvent },
            {name: "QAR监控事件", id: QAR, className: "sort-btn", options: commonBtnOpt.envitOpt, key: "latestArvArpCd", event: this.onEvent },
            {name: "重要数据通告", id: NOTICE, className: "sort-btn", options: commonBtnOpt.envitOpt, event: this.onEvent },         
            {name: "QAR航线视图入口", id: QARROUTE, className: "sort-btn", options: commonBtnOpt.envitOpt, key:"qarRoute",event: this.onEvent},                 
        ];
        
        this.state = {
            table: new PageModel(),
            isHistory: props.match.path.indexOf("History") == -1 ? false : true,
            flightCode: props.match.params.flightCode,
            batchNum: props.match.params.batchNum,
            // 目前若是分享链接是可以点击所有按钮的，若想修改成不可以点击，则将现在用的注释掉，原来注释的放开。
            btns: props.authority.length > 0 ? btns.filter(item => isAuthority(item.id, props.authority)) : btns,
            // btns: btns.filter(item => isAuthority(item.id, props.authority)),
            currentBtn: {},
            dataSource: [],
            dataSource2: [],
            flyRmArptRiskList: [],
            landRmArptRiskList: [],
            flitInfo: {},
            flyAssoRiskList: [],
            cruiseAssoRiskList: [],
            landAssoRiskList: [],
            flyFlitRiskDetailList: [],
            cruiseFlitRiskDetailList: [],
            landFlitRiskDetailList: [],
            riskValue: {}
        };
        this.drawer;
        this.detailUrl = "/#/QarOilAnalysis/";    
        this.newResultUrl = "/NewFlightRiskDetail/" 
    }

    componentDidMount() {

        let url;
        if( this.state.isHistory ){
            url = this.state.batchNum ? "relieveMeasure/queryAllFlightHisInformation" : "relieveMeasure/queryAllFlightInformationForHis";
        }else{
            url = this.state.batchNum ? "relieveMeasure/queryHisAllFlightInformations" : "relieveMeasure/queryAllFlightInformation";
        }
        let params = { flightCode: this.state.flightCode };
        if( this.state.batchNum )  params.batchNum = this.state.batchNum;
        post({
            url: url,
            data: params,
            success: (data) => {
                let { btns } = this.state;
                btns.forEach(item => {
                    if( item.key == "depArpCd" ){
                        item.name = data.flitInfo.depArpCdChineseName + "QAR监控事件";
                    }else if(item.key == "latestArvArpCd"){
                        item.name = data.flitInfo.latestArvArpCdChineseName + "QAR监控事件";
                    }
                });
                this.setState({
                    btns: btns,
                    flitInfo: data.flitInfo,
                    flyAssoRiskList: data.flyAssoRiskList,
                    cruiseAssoRiskList: data.cruiseAssoRiskList,
                    landAssoRiskList: data.landAssoRiskList,
                    flyFlitRiskDetailList: data.flyFlitRiskDetailList,
                    cruiseFlitRiskDetailList: data.cruiseFlitRiskDetailList,
                    landFlitRiskDetailList: data.landFlitRiskDetailList,
                    flyAssoRiskNum: data.flyAssoRiskNum,
                    cruiseAssoRiskNum: data.cruiseAssoRiskNum, 
                    landAssoRiskNum: data.landAssoRiskNum, 
                    riskValue: data.riskValue,
                    flyRmArptRiskList: data.flyRmArptRiskList,
                    landRmArptRiskList: data.landRmArptRiskList,
                    steps: [data.flyAssoRiskList.length + data.flyFlitRiskDetailList.length, data.cruiseAssoRiskList.length + data.cruiseFlitRiskDetailList.length, data.landAssoRiskList.length + data.landFlitRiskDetailList.length],
                });
            }
        });          
    }

    componentWillUnmount(){
        this.setState = (state, callback) => {
            return;
        };
    }

    getArpQar(obj = {}, btn){
        obj.params = Object.assign({}, {queryArpQar: btn ? this.state.flitInfo[btn.key] : this.state.table.getParmaData().queryArpQar}, obj.params);
        const table = this.state.table;
        table.setPage(obj);
        let params = table.getParmaData();
        post({
            url: "relieveMeasure/queryArpQar",
            data: params,
            success: data => {
                if( btn ) this.setState({ currentBtn: btn });
                if( data && data.rows ){
                    var dataList = data.rows.map( (item, i) => {
                        item.index = ( obj.pageNum - 1 ) * obj.pageSize + i + 1;
                        return item;
                    });
                    table.setPage({ dataList, total: data.total, pageNum: params.pageNum, pageSize: params.pageSize });
                    this.setState({ 
                        table 
                    });
                    this.drawer.show();
                }
            }
        });
    }

    /*getQarOilInfo(obj = {},btn){ 
        obj.params = Object.assign({}, {queryFltOilContrast: btn ? this.state.flitInfo[btn.key] : this.state.table.getParmaData().queryFltOilContrast}, obj.params);
        const table = this.state.table;
        table.setPage(obj);
        let params = table.getParmaData();
        post({
            url: "relieveMeasure/queryFltOilContrast",
            data: params,
            success: data => {
                if( btn ) this.setState({ currentBtn: btn });
                if( data && data.rows ){
                    var dataList = data.rows.map( (item, i) => {
                        item.index = ( obj.pageNum - 1 ) * obj.pageSize + i + 1;
                        return item;
                    });
                    table.setPage({ dataList, total: data.total, pageNum: params.pageNum, pageSize: params.pageSize });
                    this.setState({ 
                        table 
                    });
                    this.drawer.show();
                }
            }
        });
    }*/

    /**
     * QAR监控事件
     */
    onEvent = (btn) => {
        if( btn.key ){ // QAR监控事件
            if(btn.key == "qarRoute"){
            
              const w=window.open('about:blank');
              w.location.href=this.detailUrl+this.state.flightCode;
              
            }else{
                this.getArpQar({}, btn);
            }     
                        
        }else{ // 重要数据通告
            const msgFun = message.loading('正在获取重要数据通告，耐心等候', 0);
            post({
                url: "relieveMeasure/queryArpImportantNotams",
                data: {
                    queryArpImNotamDep: this.state.flitInfo.depArpCd,
                    queryArpImNotamArv: this.state.flitInfo.latestArvArpCd,
                    soflseqNr: this.state.flitInfo.soflSeqNr
                },
                success: (data) => {
                    msgFun && typeof msgFun == "function" && msgFun();
                    var arr = [];
                    for(let key in data.notamMap){
                        arr.push({ type: key, content: data.notamMap[key] });
                    }
                    this.setState({
                        currentBtn: btn,
                        dataSource2: arr
                    });
                    this.drawer.show();
                }
            });
        }
    }

    render() {
        const { btns, currentBtn, flitInfo = {}, dataSource, dataSource2, flyRmArptRiskList, landRmArptRiskList,
            flyAssoRiskList, cruiseAssoRiskList, landAssoRiskList, flyFlitRiskDetailList, cruiseFlitRiskDetailList, landFlitRiskDetailList,
            riskValue, table } = this.state;
        const list = [
            { text: "起飞机场", value: flitInfo.depArpCdChineseName },
            { text: "着陆机场", value: flitInfo.latestArvArpCdChineseName },
            { text: "起飞备降机场", value: flitInfo.tkofAltnCdChineseName },
            { text: "目的地备降机场", value: flitInfo.altnCdChineseName },
            { text: "计划出发", value: moment(flitInfo.schDepDt).format("DD HH:MM") },
            { text: "计划到达", value: moment(flitInfo.schArvDt).format("DD HH:MM") },
        ];
        const columns1 = [
            { title: "事件代码", dataIndex: "evtNum", width: 170 },
            { title: "事件名称", dataIndex: "evtName" },
            { title: "事件数", dataIndex: "count", width: 70 },
        ];
        const columns2 = [
            { title: "通告类型", dataIndex: "type" , width: 130 },
            { title: "通告内容", dataIndex: "content", render: (text) => <div dangerouslySetInnerHTML={{ __html: text }} />},
        ];

        // 列表表格参数
        let tableOptions = {  
            notCheck: true,
            bordered: false,
            scroll: { y: 594 },
            columns: columns1,
            table: table,
            onChange: this.getArpQar.bind(this),                                                                        
        };
        let tableOptions2 = {  
            notCheck: true,
            bordered: false,
            scroll: { y: 594 },
            columns: columns2,
            table: {dataList: dataSource2, loading: false},
            needPage: false                                                                        
        };
        const columns3 = [
            { title: "编号", dataIndex: "itemNum", width: 100 },
            { title: "风险因素", dataIndex: "riskItem", width: 250, className: "text-left", isTooltip: true },
            { title: "飞行阶段", dataIndex: "flyPhase", width: 150 },
            { title: "风险值", dataIndex: "riskValue", width: 100 },
            { title: "风险详细描述", dataIndex: "riskDetail", width: 250, className: "text-left", isTooltip: true }
        ];
        let tableOptions3 = {  
            notCheck: true,
            bordered: false,
            scroll: { x: 1000, y: 350 },
            columns: columns3,
            table: {dataList: flyRmArptRiskList, loading: false},
            needPage: false                                                                    
        };
        let tableOptions4 = {  
            notCheck: true,
            bordered: false,
            scroll: { x: 1000, y: 350 },
            columns: columns3,
            table: {dataList: landRmArptRiskList, loading: false},
            needPage: false                                                                         
        };
        const drawerOptions = {
            options: {
                title: currentBtn.name,
            },
            onRef: (ref) => {this.drawer = ref}
        }
        return (
            <div className="flight-risk-detail">
                <div className="flight-risk-detail-title">
                    <FourBorder></FourBorder>
                    <div>{flitInfo.fltNr}</div>
                </div>
                <CardCommon title="航班信息">
                    <div className="info">   
                        {
                            list.map((item, index) => {
                                return (
                                    <div className="small-card-img" key={index}>
                                        <div>
                                            <div className="text">{item.text}</div>
                                            <div className="value">{item.value?item.value:"无"}</div>
                                        </div>
                                    </div>
                                )
                            })
                        }
                        {
                            !this.state.batchNum && <div className="airport-button">
                                {
                                    btns.map( (btn, i) => {
                                        return <Button key={i} className={btn.className} onClick={() => {btn.event && btn.event(btn)}} {...btn.options}>{btn.name}</Button>
                                    })                                 
                                }
                                <Link to={`${this.newResultUrl}${this.state.flightCode}`} target="_blank">新模型计算结果</Link>                                                             
                                <CommonDrawer {...drawerOptions}>
                                    {currentBtn.key && <CommonTable options={tableOptions}></CommonTable>}
                                    {currentBtn.key && <div className="flight-risk-detail-tip">统计时间范围：过去的六个月</div>}
                                    {!currentBtn.key && <CommonTable options={tableOptions2}></CommonTable>}
                                </CommonDrawer>
                            </div>
                        }
                    </div>
                </CardCommon>
                <CardCommon title="风险展示">
                    <ChartsTip height="7.1-10.0" middle="4.1-7.0" low="1.0-4.0"></ChartsTip>
                    <RiskTable 
                        title="起飞阶段" 
                        value={riskValue.flyingValue}
                        environmentValue={riskValue.flyingEnvironmentValue} 
                        machineValue={riskValue.flyingMachineValue} 
                        persionValue={riskValue.flyingPersionValue}
                        riskList={flyAssoRiskList}
                        riskDetailList={flyFlitRiskDetailList} 
                    />
                    <RiskTable 
                        title="巡航阶段" 
                        value={riskValue.cruiseValue} 
                        environmentValue={riskValue.cruiseEnvironmentValue} 
                        machineValue={riskValue.cruiseMachineValue} 
                        persionValue={riskValue.cruisePersionValue}
                        riskList={cruiseAssoRiskList}
                        riskDetailList={cruiseFlitRiskDetailList}
                    />
                    <RiskTable
                        title="着陆阶段" 
                        value={riskValue.landedValue} 
                        environmentValue={riskValue.landedEnvironmentValue} 
                        machineValue={riskValue.landedMachineValue} 
                        persionValue={riskValue.landedPersionValue}
                        riskList={landAssoRiskList}
                        riskDetailList={landFlitRiskDetailList}
                    />
                </CardCommon>
                <CardCommon title="机场运行风险数据">
                    <div className="table-title">{flitInfo.depArpCdChineseName}机场风险明细</div>
                    <CommonTable options={tableOptions3}></CommonTable>
                    <div className="table-title mt15">{flitInfo.latestArvArpCdChineseName}机场风险明细</div>
                    <CommonTable options={tableOptions4}></CommonTable>
                </CardCommon>
            </div >
        );
    }
}

class RiskTable extends React.Component {
    constructor(props){
        super(props);
        this.loading = true;
    }

    componentDidMount(){
        this.loading = false;
    }

    getRiskValueDom(value){
        var className = "num ";
        if (value >= 1 && value <= 4) {
            className += "text-success";
        }else if (value > 4 && value <= 7) {
            className += "text-warning";
        }else if (value > 7 && value <= 10) {
            className += "text-danger";
        }
        return <span className={className}>{value}</span>;
    }

    handleList(list){
        return list.map( item => {
            return (
                <div className="step-content">
                    <div>关联风险{item.rmItemRuleIds}：{item.associateNames} {this.getRiskValueDom(item.riskValues)}</div>
                    {item.riskDisc && <div><TextHtml data={item.riskDisc} /></div>}
                    <div>建议措施：<TextHtml data={item.relieveMeasure} /></div>
                </div>
            )
        });
    }

    handleDetailList(list){
        return list.map( item => {
            return (
                <div className="step-content">
                    <div>{item.code}：{item.riskName} {this.getRiskValueDom(item.riskValue)}</div>
                    {item.informationDescription && <div><TextHtml data={item.informationDescription} /></div> }
                    <div>建议措施：<TextHtml data={item.mitigatingMeasures} /></div> 
                </div>
            )
        });
    }

    render(){
        const { title, value, environmentValue, machineValue, persionValue, riskList, riskDetailList } = this.props;
        var arr = this.handleList(riskList).concat( this.handleDetailList(riskDetailList) );
        var dataList = arr.map((item, i) => {
            return { num: i+1, content: item }
        });
        let tableOptions = {  
            notCheck: true,
            columns: [
                { title: "序号", dataIndex: "num", width: 100 },
                { title: "内容", dataIndex: "content", className: "text-left" }
            ],
            table: {dataList: dataList, loading: this.loading},
            needPage: false,
            scroll: { y: 240 },                                                               
        };
        return (
            <React.Fragment>
                <div className="step-title">
                    {title} &nbsp;&nbsp; {riskValueFilter(value)} &nbsp;&nbsp;
                    <span className="step-explain">（环：{environmentValue}，机：{machineValue}，人：{persionValue}）</span>
                </div>
                {!this.loading && <CommonTable options={tableOptions}></CommonTable>}
            </React.Fragment>
        )
    }
}

class TextHtml extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            data: [],
            mel: "",
            saspReportId: "",
            fcftReportId: "",
            weatherTempoForecastId: ""

        };
        this.modal1;
        this.modal2;
    }

    componentDidMount(){
        this.setState({
            data: this.handleHtml(this.props.data)
        });
    }

    componentWillUnmount(){
        this.setState = (state, callback) => {
            return;
        };
    }

    handleHtml(str){
        var arr = [];
        if( str ){
            if( str.indexOf("onclick") > -1 ){
                var list = str.split("<a ");
                for(var i = 0; i < list.length; i++){
                    if( list[i] && list[i].indexOf("onclick") > -1 ){
                        var arr1 = list[i].split("</a>");
                        list.splice(i, 1, arr1[0], arr1[1]);
                    }
                }
                arr = list.map(item => {
                    if( item && item.indexOf("onclick") > -1 ){
                        var content = item.slice(item.indexOf(">")+1);
                        var paramsStr = item.slice( item.indexOf("(")+1, item.indexOf(")") );
                        var paramsArr = paramsStr.split(",").map(item => item.replace(/"|'/g, ""));
                        if( item.indexOf("showMEL") > -1 ){
                            return {
                                type: "mel",
                                content: content,
                                params: paramsArr
                            };
                        }else if( item.indexOf("showWeatherValid") > -1 ){
                            return {
                                type: "weatherValid",
                                content: content,
                                params: paramsArr
                            };
                        }else if( item.indexOf("showWeatherAll") > -1 ){
                            return {
                                type: "weatherAll",
                                content: content,
                                params: paramsArr
                            };
                        }else if( item.indexOf("showWeather") > -1 ){
                            return {
                                type: "weather",
                                content: content,
                                params: paramsArr
                            };
                        }else if( item.indexOf("reviewFiles") > -1 ){
                            return {
                                type: "reviewFiles",
                                content: content,
                                params: paramsArr
                            };
                        }else if( item.indexOf("showTempWeatherValid") >-1){
                            return{
                                type:"tempWeatherValid",
                                content: content,
                                params: paramsArr
                            }
                        }
                    }else{
                        return {
                            type: "text",
                            content: item
                        };
                    }
                }); 
            }else{
                arr = [{
                    type: "text",
                    content: str
                }];
            }
        }
        return arr;
    }

    showMEL(params){
        var This = this;
        post({
            url: "relieveMeasure/queryMel",
            data: {flightCode: params[0], melInfoId: params[1]},
            success: data => {
                if( data && data.deferralLongdesc ){
                    This.setState({mel: data.deferralLongdesc});
                    This.modal1.show();
                }else{
                    message.error("暂无MEL信息");
                }
            }
        });
    }

    showWeatherValid(params){
        var This = this;
        post({
            url: "relieveMeasure/queryWeatherValid",
            data: {saspReportId: params[0], fcftReportId: params[1], effectReportId: params[2]},
            success: data => {
                This.setState({
                    saspReportId: data.saspReport ? data.saspReport : "没有相关实况报文！",
                    fcftReportId: data.fcftReport ? data.fcftReport : "没有相关预报报文！"
                });
                This.modal2.show();
            }
        });
    }

    showWeatherAll(params){
        var This = this;
        post({
            url: "relieveMeasure/queryWeatherReportNew",
            data: {saspReportId: params[0], fcftReportId: params[1], arpCd: params[2], effectReportId: params[3]},
            success: data => {
                This.setState({
                    saspReportId: data.saspReport ? data.saspReport : "没有相关实况报文！",
                    fcftReportId: data.fcftReport ? data.fcftReport : "没有相关预报报文！"
                });
                This.modal2.show();
            }
        });
    }

    showWeather(params){
        var This = this;
        post({
            url: "relieveMeasure/queryWeatherReportByid",
            data: {saspReportId: params[0], fcftReportId: params[1]},
            success: data => {
                This.setState({
                    saspReportId: data.saspReportId ? data.saspReportId : "没有相关实况报文！",
                    fcftReportId: data.fcftReportId ? data.fcftReportId : "没有相关预报报文！"
                });
                This.modal2.show();
            }
        });
    }

    reviewFiles(params){
        if(params && params.length == 1){
            var fileName = params[0];
            const a = document.createElement('a');
            a.href = window.g_url + "js/pdfjs/web/viewer.html?file=" + encodeURIComponent(window.g_url + "dailyAssociateRisk/pdfStreamHandeler?fileName=" + fileName);
            a.target = "_blank";
            a.click();
        }
    }

    showTempWeatherValid(params){
        var This = this;
        post({
            url: "relieveMeasure/queryTempWeatherValid",
            data: {weatherTempoForecastId: params[0]},
            success: data => {
                This.setState({
                    weatherTempoForecastId: data.tempoForecastReport ? data.tempoForecastReport : "没有相关短时报文！"              
                });
                This.modal2.show();
            }
        });
    }

    render(){
        const modalOptions1 = {
            options: {
                title: "MEL信息",
                footer: null,
            },
            onRef: (ref) => {this.modal1 = ref}
        };
        const modalOptions2 = {
            options: {
                title: "天气预报",
                footer: null,
            },
            onRef: (ref) => {this.modal2 = ref}
        };
        return (
            <React.Fragment>
                {
                    this.state.data.map( (item, index) => {
                        if( item && item.type ){
                            switch(item.type){
                                case "text":
                                    return <span key={index} dangerouslySetInnerHTML={{ __html: item.content }} />;
                                case "mel":
                                    return (<a key={index} onClick={() => this.showMEL(item.params)}>{item.content}</a>);
                                case "weatherValid":
                                    return (<a key={index} onClick={() => this.showWeatherValid(item.params)}>{item.content}</a>);
                                case "weatherAll":
                                    return (<a key={index} onClick={() => this.showWeatherAll(item.params)}>{item.content}</a>);
                                case "weather":
                                    return (<a key={index} onClick={() => this.showWeather(item.params)}>{item.content}</a>);
                                case "reviewFiles":
                                    return (<a key={index} onClick={() => this.reviewFiles(item.params)}>{item.content}</a>);
                                case "tempWeatherValid":
                                        return (<a key={index} onClick={() => this.showTempWeatherValid(item.params)}>{item.content}</a>);
                            }
                        }
                    })
                }
                <CommonModal {...modalOptions1}>
                    <div>{this.state.mel}</div>
                </CommonModal>
                <CommonModal {...modalOptions2}>
                    <div className="weather-box">
                        <div className="title">实况报文</div>
                        <div className="mb70" dangerouslySetInnerHTML={{ __html: this.state.saspReportId }} />
                        <div className="title">预报报文</div>
                        <div dangerouslySetInnerHTML={{ __html: this.state.fcftReportId }} />                      
                    </div>
                </CommonModal>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        authority: state.authority
    };
}

export default connect(
    mapStateToProps
)(withRouter(FlightRiskDetail));