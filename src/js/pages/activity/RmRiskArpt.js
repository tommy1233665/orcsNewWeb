import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import { Modal, message, Input, Tooltip } from 'antd';
import { CardCommon, CommonTable, CommonForm, CommonBtns, CommonModal, CommonTabs } from "common/component";
import { handleInParams, isAuthority } from "common/commonFn";
import { post } from 'common/http';
import PageModel from 'model/pageModel';
import moment from 'moment';
const { confirm } = Modal;

const ADD = "rmRiskArpt.add"; // 新增
const EDIT = "rmRiskArpt.edit"; // 修改
const DEL = "rmRiskArpt.del"; // 删除
const LIST = "rmRiskArpt.list"; // 查询
const DETAIL = "rmRiskArpt.detail"; // 查询飞机详情信息

class RmRiskArpt extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            table: new PageModel(),
            selectedRowKeys: [],
            selectedRows: [],
            btns: [
                { name: "新增", id: ADD, icon: "plus-circle", onClick: this.add },
                { name: "修改", id: EDIT, icon: "edit", onClick: this.edit },
                { name: "删除", id: DEL, icon: "minus-circle", onClick: this.del }
            ].filter(item => isAuthority(item.id, props.authority)),
            modalOkBtnLoading: false,
            currentAction: "",
            currentData: {},
            authorityList: isAuthority(LIST, props.authority),
            authorityDetail: isAuthority(DETAIL, props.authority)
        };
        this.columns = [
            { title: "序号", dataIndex: "index" },
            { title: "机场名称", dataIndex: "arpName" },
            { title: "三字码", dataIndex: "arpCd" },
            { title: "四字码", dataIndex: "icaoCode" },
            { title: "起飞得分", dataIndex: "takeoffValue" },
            { title: "着陆得分", dataIndex: "landValue" },
            { title: "更新人", dataIndex: "updateUser" },
            { title: "更新时间", dataIndex: "updateTime" },
            { title: "状态", dataIndex: "status", render: (text, record) => <a onClick={() => this.detail(record)}>{text}</a> }
        ];
        this.addModal;
        this.addForm;
        this.modal;
        this.form;
        this.tableCustom;
    }

    componentDidMount() {
        this.getList();
    }

    componentWillUnmount(){
        this.setState = (state, callback) => {
            return;
        };
    }

    getList = (obj = {}) => {
        const table = this.state.table;
        table.setPage(obj);
        let params = table.getParmaData();
        post({
            url: "rmRiskArpt/queryRmRiskArptListByParam",
            data: params,
            success: data => {
                if( data && data.rows ){
                    var dataList = data.rows.map( (item, i) => {
                        item.index = ( params.pageNum - 1 ) * params.pageSize + i + 1;
                        return item;
                    });
                    table.setPage({ dataList, total: data.total, pageNum: params.pageNum, pageSize: params.pageSize });
                    this.setState({ table, selectedRowKeys: [], selectedRows: [] });
                }
            }
        });
    }

    onChecked = (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys, selectedRows });
    }

    search = () => {
        this.searcForm.validateFields((err, values) => {
            if( !err ){
                values = handleInParams(values);
                this.getList({params: values, pageNum: 1});
            }
        });
    }

    add = (callback) => {
        callback();
        this.addModal.show();
    }

    addSubmit = () => {
        this.setState({modalOkBtnLoading: true});
        this.addForm.validateFields((err, values) => {
            if( err ){
                this.setState({modalOkBtnLoading: false});
            }else{
                values = handleInParams(values);
                post({
                    url: "rmRiskArpt/addRmRiskArpt",
                    data: values,
                    btn: () => this.setState({modalOkBtnLoading: false}),
                    success: data => {
                        message.success("添加成功！");
                        this.addModal.hide();
                        this.getList({pageNum: 1});
                    }
                });
            }
        });
    }

    edit = (callback) => {
        if( this.state.selectedRows.length == 0 ){
            callback();
            message.warning("必须选择一个选项才能编辑！");
        }else if( this.state.selectedRows.length  > 1 ){
            callback();
            message.warning("只能选择一个选项！");
        }else{
            callback();
            this.setState({
                currentAction: "edit",
                currentData: this.state.selectedRows[0]
            });
            this.modal.show();
        }
    }

    detail = (text) => {
        if( this.state.authorityDetail ){
            this.setState({
                currentAction: "detail",
                currentData: text
            });
            this.modal.show();
        }else{
            message.info("无权限查看");
        }
    }

    submit = () => {
        this.setState({modalOkBtnLoading: true});
        this.form.validateFields((err, values) => {
            if( err ){
                this.setState({modalOkBtnLoading: false});
            }else{
                for(var key in values){
                    if( key == "landValue" || key == "takeoffValue" ){
                        if( values[key] && typeof values[key] == "object"){
                            values[key] = values[key].value; 
                        }
                    }
                }
                values = handleInParams(values);
                values.arpCd = this.state.currentData.arpCd;
                values.detailListStr = JSON.stringify(this.tableCustom.state.selectedRows);
                post({
                    url: "rmRiskArpt/updateRiskArptDetail",
                    data: values,
                    btn: () => this.setState({modalOkBtnLoading: false}),
                    success: data => {
                        message.success("修改成功");
                        this.modal.hide();
                        this.getList({pageNum: 1});
                    }
                });
            }
        });
    }

    del = (callback) => {
        if( this.state.selectedRows.length == 0 ){
            callback();
            message.warning("请至少选择一行数据");
        }else{
            var list = this.state.selectedRows.map(item => item.arpCd);
            var name = this.state.selectedRows.map(item => item.arpName);
            confirm({
                title: "确认删除【" + name.join("、") + "】吗?",
                okType: 'danger',
                onOk: () => {
                    post({
                        url: "rmRiskArpt/delRmRiskArpt",
                        data: {ids: list},
                        btn: callback,
                        success: data => {
                            message.success("删除成功");
                            this.getList({pageNum: 1});
                        }
                    });
                },
                onCancel: callback
            });
        }
    }

    getSearchFormOptions(){
        return [
            {
                type: "Input",
                label: "关键字搜索",
                name: "rmArptRisk",
                span: 10,
                length: 5,
                placeholder: "请输入机场名称（全称）、三字码（全称）、四字码（全称）搜索"
            }
        ];
    }

    getAddFormOptions(){
        return [
            {
                type: "Input",
                label: "机场名称",
                name: "arpName",
                span: 22,
                options: {
                    rules: [
                        {required: true, message: "机场名称不可为空！"}
                    ]
                }
            },
            {
                type: "Input",
                label: "三字码",
                name: "arpCd",
                span: 22,
                options: {
                    rules: [
                        {required: true, message: "三字码不可为空！"}
                    ]
                }
            },
            {
                type: "Input",
                label: "四字码",
                name: "icaoCode",
                span: 22,
                options: {
                    rules: [
                        {required: true, message: "四字码不可为空！"}
                    ]
                }
            },
            {
                type: "Input",
                label: "起飞得分",
                name: "takeoffValue",
                span: 22
            },
            {
                type: "Input",
                label: "着陆得分",
                name: "landValue",
                span: 22
            }
        ];
    }

    /**
     * 获取form表的配置
     */
    getFormOptions(){
        var datas = this.state.currentData;
        var arr = [
            {
                type: "Input",
                label: "机场名称",
                name: "arpName",
                span: 6,
                length: 4,
                disabled: true,
                options: {
                    initialValue: datas.arpName
                }
            },
            {
                type: "Input",
                label: "四字码",
                name: "icaoCode",
                span: 6,
                length: 3,
                disabled: true,
                options: {
                    initialValue: datas.icaoCode
                }
            },
            {
                type: "InputExplain",
                label: "起飞得分",
                name: "takeoffValue",
                span: 6,
                length: 4,
                isHelp: "根据机场起飞阶段的风险项目按一定算法综合得出，将参与起飞阶段风险值的计算。",
                options: {
                    initialValue: datas.takeoffValue
                }
            },
            {
                type: "InputExplain",
                label: "着陆得分",
                name: "landValue",
                span: 6,
                length: 4,
                isHelp: "根据机场着陆阶段的风险项目按一定算法综合得出，将参与着陆阶段风险值的计算。",
                options: {
                    initialValue: datas.landValue
                }
            }
        ];
        if( this.state.currentAction == "detail" ){
            arr = arr.map(item => {
                item.disabled = true;
                return item;
            });
        }
        return arr;
    }

    render(){
        const { table, modalOkBtnLoading, currentAction, currentData, selectedRowKeys, authorityList, authorityDetail } = this.state;
        // 查询form
        const searchFormOptions = this.getSearchFormOptions();
        const btnOptions = {
            aligin: "left",
            span: 6,
            list: [
                {text: "查询", options: "queryOpt", event: this.search}
            ]
        };
        // 增删改
        const commonBtnOptions = {
            shape: "round",
            size: "small"
        };
        // 列表表格参数
        const tableOptions = {
            key: "arpCd",
            columns: this.columns,
            table: table,
            rowSelection: {
                selectedRowKeys,
                onChange: (selectedRowKeys, selectedRows) => { // 选中项发生变化时的回调
                    this.onChecked(selectedRowKeys, selectedRows);
                },
            },
            onChange: this.getList
        }
        // add
        const addModalOptions = {
            options: {
                title: "新增",
                okButtonProps: { loading: modalOkBtnLoading }
            },
            onRef: (ref) => {this.addModal = ref},
            ok: this.addSubmit.bind(this)
        }
        const addFormOptions = this.getAddFormOptions();
        // edit、detail模态框
        var title = currentAction == "edit" ? "编辑" : "查看";
        const modalOptions =  {
            options: {
                title: title + "机场风险详情",
                width: "1000px",
                bodyStyle: {
                    width: "1000px"
                },
                okButtonProps: { loading: modalOkBtnLoading }
            },
            onRef: (ref) => {this.modal = ref},
            ok: this.submit.bind(this)
        }
        if( currentAction == "detail" ) modalOptions.options.footer = null;
        const formOptions = this.getFormOptions();
        return(
            <CardCommon>
                { authorityList && <CommonForm options={searchFormOptions} btnOptions={btnOptions} wrappedComponentRef={(form) => { if(form && form.props && form.props.form) this.searcForm = form.props.form;}} /> }
                <div className="buttons"><CommonBtns options={commonBtnOptions} btns={this.state.btns} /></div>
                { authorityList && <CommonTable options={tableOptions} onChecked={this.onChecked}></CommonTable> }
                { !authorityList && <div className="no-authority-box">无权限查看</div> }   
                <CommonModal {...addModalOptions}>
                    <div className="form-grid-6">
                        <CommonForm options={addFormOptions} wrappedComponentRef={(form) => { if(form && form.props && form.props.form) this.addForm = form.props.form;}} />
                    </div>
                </CommonModal>
                <CommonModal {...modalOptions}>
                    <CommonForm options={formOptions} wrappedComponentRef={(form) => { if(form && form.props && form.props.form) this.form = form.props.form;}} />
                    <TableCustom datas={currentData} currentAction={currentAction} onRef={ref => this.tableCustom = ref} />
                </CommonModal>
            </CardCommon>            
        );
    }
}

class TableCustom extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            tabs: [
                {name: "多阶段并存风险"},
                {name: "机坪运行阶段"},
                {name: "起飞阶段"},
                {name: "离场阶段"},
                {name: "进场阶段"},
                {name: "进近阶段"},
                {name: "五边阶段"},
                {name: "着陆阶段"},
                {name: "复飞阶段"}
            ],
            dataSource: [],
            selectedRows: [],
            selectedRowKeys: [],
            edit: false,
            selected: {},
            loading: true
        };
        this.columns =  [
            { title: "编号", dataIndex: "index", width: 50, render: (text) => <div id={text}>{text}</div> },
            { title: "项目编号", dataIndex: "itemNum", width: 70 },
            { title: "风险因素", dataIndex: "riskItem", width: 220, className: "text-left" },
            { title: "风险值", dataIndex: "riskValue", width: 50 },
            { title: "风险详细描述", dataIndex: "riskDetail", width: 100, className: "text-left", render: (text, record) => this.getDom("riskDetail", text, record) },
            { title: "维护期限", dataIndex: "operPeriod", width: 70 },
            { title: "失效日期", dataIndex: "invalidTime", width: 70, render: (text, record) => this.getDom("invalidTime", text, record) },
            { title: "更新时间", dataIndex: "updateTime", width: 70 }
        ];
    }

    componentDidMount(){
        if( this.props.onRef ) this.props.onRef(this);
        this.getDefaultArp(data => {
            this.getList(data);
        });
        var This = this;
        document.onclick = function (e) {
            if( e.target.nodeName == "TD" || (e.target.nodeName == "DIV" && !e.target.onclick) ){
                This.setState({edit: false});
            }
        };
    }

    componentWillUnmount(){
        this.setState = (state, callback) => {
            return;
        };
    }

    getDom(key, text, record){
        if( this.props.currentAction == "detail" ) return <div>{text}</div>;
        if( this.state.edit && record.arpRiskParamId == this.state.selected.arpRiskParamId ){
            return <Tooltip title={text}><Input defaultValue={text} onChange={(e) => this.onChange(key, record, e)} autoComplete="off" /></Tooltip>;
        }else if(key == "riskDetail"){
            return <div style={{minHeight: "22px"}} onClick={this.onStartEdit.bind(this, record)}>{text}</div>;
        }else if(key == "invalidTime"){
            return <div>{text}</div>;
        }
    }

    onChange(key, record, e){
        var dataSource = this.state.dataSource.map(item => {
            if( item.arpRiskParamId == record.arpRiskParamId ) item[key] = e.target.value;
            return item;
        });
        this.setState({dataSource});
    }

    onStartEdit(record){
        if( !record.invalidTime ){
            record.invalidTime = this.getInvalidTime(record.operPeriod);
        }
        this.setState({edit: true, selected: record});
    }

    getInvalidTime(operPeriod){
        switch( operPeriod ){
            case "一年":
                return moment().subtract(-1, "years").format("YYYY-MM-DD HH:mm:ss");
            case "半年":
                return moment().subtract(-6, "months").format("YYYY-MM-DD HH:mm:ss");
            case "三个月":
                return moment().subtract(-3, "months").format("YYYY-MM-DD HH:mm:ss");
            case "暂无要求":
            default:
                var currentDate = moment().format("YYYY-MM-DD HH:mm:ss");
                return currentDate.replace( currentDate.slice(0, 4), "2999" );
        }
    }

    getDefaultArp(callback){
        post({
            url: "rmRiskArpt/queryDefaultArpOptions",
            data: {arpCd: this.props.datas.arpCd},
            success: data => {
                callback && typeof callback == "function" && callback(data);
            }
        });
    }

    getList = (defaultArp) => {
        post({
            url: "rmRiskArpt/queryrmRiskArptDetail",
            data: {arpCd: this.props.datas.arpCd},
            success: data => {
                if( data && data.rows ){
                    var dataSource = data.rows.map( (item, i) => {
                        item.index = i + 1;
                        return item;
                    });
                    // 
                    var selectedRowKeys = [], selectedRows = [];
                    defaultArp.forEach(id => {
                        dataSource.forEach((item, i) => {
                            if( id == item.arpRiskParamId ){
                                selectedRowKeys.push(item.itemNum);
                                selectedRows.push(item);
                            }
                        });
                    });
                    this.setState({dataSource, selectedRowKeys, selectedRows, loading: false});
                }
            }
        });
    }

    onTab = (tab, i) => {
        const { dataSource } = this.state;
        var anchorName;
        for(var i = 0; i < dataSource.length - 1; i++){
            if( dataSource[0]['flyPhase'] == tab.name ){
                anchorName = 1;
            }else if( dataSource[i]['flyPhase'] != dataSource[i + 1]['flyPhase'] && dataSource[i + 1]['flyPhase'] == tab.name ){
                anchorName = i + 1;
            }
        }
        let anchorElement = document.getElementById(anchorName);
        if(anchorElement) anchorElement.scrollIntoView();
    }

    onChecked = (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys, selectedRows });
    }

    render(){
        const { dataSource, selectedRowKeys, loading } = this.state;
        // 列表表格参数
        const tableOptions = {
            key: "itemNum",
            columns: this.columns,
            table: {dataList: dataSource, loading: loading },
            scroll: {
                x: "750px",
                y: "300px"
            },
            rowSelection: {
                selectedRowKeys,
                onChange: (selectedRowKeys, selectedRows) => { // 选中项发生变化时的回调
                    this.onChecked(selectedRowKeys, selectedRows);
                },
                getCheckboxProps: record => ({
                    disabled: this.props.currentAction == "detail" ? true : false,
                })
            },
            needPage: false
        }
        return (
            <React.Fragment>
                <div>选择机场风险因素</div>
                <CommonTabs className="mt20 mb20" tabs={this.state.tabs} onClick={this.onTab} />
                <CommonTable options={tableOptions} onChecked={this.onChecked} />
            </React.Fragment>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        authority: state.authority
    };
}

export default connect(
    mapStateToProps
)(withRouter(RmRiskArpt));