import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import { Modal, message } from 'antd';
import { CardCommon, CommonTable, CommonForm, CommonBtns, CommonModal } from "common/component";
import { handleInParams, isAuthority } from "common/commonFn";
import { post } from 'common/http';
import PageModel from 'model/pageModel';
const { confirm } = Modal;

const ADD = "rmSpecialAirLine.add"; // 新增
const EDIT = "rmSpecialAirLine.edit"; // 修改
const DEL = "rmSpecialAirLine.del"; // 删除
const LIST = "rmSpecialAirLine.list"; // 查询

class RmSpecialAirLine extends React.Component {

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
            areaList: [],
            arpCdCnList: [],
            latestEqpCdList: [],
            authorityList: isAuthority(LIST, props.authority)
        };
        this.columns = [
            { title: "序号", dataIndex: "index", width: 50, fixed: 'left' },
            { title: "区域", dataIndex: "area", width: 100, fixed: 'left' },
            { title: "航线", dataIndex: "airLine", width: 200, fixed: 'left' },
            { title: "机型", dataIndex: "latestEqpCd", width: 50, fixed: 'left' },
            { title: "极地运行", dataIndex: "polarFlight", width: 100, render: this.getTd },
            { title: "180 ETOPS", dataIndex: "etops", width: 100, render: this.getTd },
            { title: "灵活航路", dataIndex: "flexAirLine", width: 100, render: this.getTd },
            { title: "二次放行", dataIndex: "secRelease", width: 100, render: this.getTd },
            { title: "PBN航路", dataIndex: "pbnAirLine", width: 100, render: this.getTd },
            { title: "是否受火山灰影响", dataIndex: "tephrosInfluence", width: 100, render: this.getTd },
            { title: "氧气系统限制", dataIndex: "oxygenLimit", width: 100, render: this.getTd },
            { title: "要加飘降备降场 ", dataIndex: "alterAirport", width: 100, render: this.getTd },
            { title: "ADS-B要求", dataIndex: "adsRequire", width: 100, render: this.getTd },
            { title: "延伸跨水 ", dataIndex: "extCrossWater", width: 100, render: this.getTd },
            { title: "业载受航程极限限制 ", dataIndex: "voyageLimit", width: 100, render: this.getTd },
            { title: "是否飞越香港 ", dataIndex: "flyoverHk", width: 100, render: this.getTd },
            { title: "外籍有限制 ", dataIndex: "foreignLimit", width: 100, render: this.getTd },
            { title: "涉及释压飘降程序 ", dataIndex: "driftProce", width: 100, render: this.getTd },
            { title: "低温航线 ", dataIndex: "lowTemAirLine", width: 100, render: this.getTd }
        ];   
        this.modal;
        this.form;
    }

    componentDidMount() {
        this.getParmaList("rmSpecialAirLine/queryAirLineAreaList", data => this.setState({areaList: data}) );
        this.getParmaList("rmSpecialAirLine/queryArptList", data => this.setState({arpCdCnList: data}) );
        this.getParmaList("acftEqp/queryAcftEqpList", data => this.setState({latestEqpCdList: data}) );
        this.getList();
    }

    componentWillUnmount(){
        this.setState = (state, callback) => {
            return;
        };
    }

    getParmaList(url, callback){
        post({
            url: url,
            success: data => {
                callback && typeof callback == "function" && callback(data);
            }
        });
    }

    getTd(text){
        return text == "Y" ? "是" : "否";
    }

    getList = (obj = {}) => {
        const table = this.state.table;
        table.setPage(obj);
        let params = table.getParmaData();
        post({
            url: "rmSpecialAirLine/queryRmSpecialAirLineListByParam",
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
        this.setState({
            currentAction: "add"
        });
        this.modal.show();
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

    submit = () => {
        this.setState({modalOkBtnLoading: true});
        this.form.validateFields((err, values) => {
            if( err ){
                this.setState({modalOkBtnLoading: false});
            }else{
                values = handleInParams(values);
                var url, msg;
                if( this.state.currentAction == "add"){
                    url = "rmSpecialAirLine/addRmSpecialAirLine";
                    msg = "添加成功";
                }else{
                    values.id = this.state.currentData.id;
                    url = "rmSpecialAirLine/updateRmSpecialAirLine";
                    msg = "修改成功";
                }
                post({
                    url: url,
                    data: values,
                    btn: () => this.setState({modalOkBtnLoading: false}),
                    success: data => {
                        message.success(msg);
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
            var list = this.state.selectedRows.map(item => item.id);
            var name = this.state.selectedRows.map(item => item.airLine);
            confirm({
                title: "确认删除【" + name.join("、") + "】吗?",
                okType: 'danger',
                onOk: () => {
                    post({
                        url: "rmSpecialAirLine/deleteRmSpecialAirLine",
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
                name: "rmSpecialAirLine",
                span: 6,
                length: 5,
                placeholder: "请输入区域、航线、机型搜索"
            }
        ];
    }

    /**
     * 获取form表的配置
     */
    getFormOptions(){
        const { currentAction, currentData, areaList,  arpCdCnList, latestEqpCdList } = this.state;
        var arr = ["polarFlight", "etops", "flexAirLine", "secRelease", "pbnAirLine", "tephrosInfluence", "oxygenLimit", "alterAirport", "adsRequire", "extCrossWater", "voyageLimit", "flyoverHk", "foreignLimit", "driftProce", "lowTemAirLine"];
        var datas = currentAction == "add" ? {} : currentData;
        arr.forEach(item => {
            if( !datas[item] ) datas[item] = "N";
        });
        var list = [
            {key: "Y", text: "是"},
            {key: "N", text: "否"}
        ];
        var areaArr = areaList.map( item => item.selectItem );
        var arpCdCnLArr = arpCdCnList.map( item => item.arpName );
        var latestEqpCdArr = latestEqpCdList.map( item => item.eqpCd );
        return [
            {
                type: "Select",
                label: "区域",
                name: "area",
                list: areaArr,
                span: 24,
                isHasAllSelect: false,
                options: {
                    initialValue: datas.area,
                    rules: [
                        {required: true, message: "区域不可为空！"}
                    ]
                }
            },
            {
                type: "Select",
                label: "计划起飞站",
                name: "depArpCdCn",
                list: arpCdCnLArr,
                span: 24,
                isHasAllSelect: false,
                options: {
                    initialValue: datas.depArpCdCn,
                    rules: [
                        {required: true, message: "计划起飞站不可为空！"}
                    ]
                }
            },
            {
                type: "Select",
                label: "计划到达站",
                name: "arvArpCdCn",
                list: arpCdCnLArr,
                span: 24,
                isHasAllSelect: false,
                options: {
                    initialValue: datas.arvArpCdCn,
                    rules: [
                        {required: true, message: "计划到达站不可为空！"}
                    ]
                }
            },
            {
                type: "Select",
                label: "机型",
                name: "latestEqpCd",
                list: latestEqpCdArr,
                span: 24,
                isHasAllSelect: false,
                options: {
                    initialValue: datas.latestEqpCd,
                    rules: [
                        {required: true, message: "机型不可为空！"}
                    ]
                }
            },
            {
                type: "Radio",
                label: "极地运行",
                name: "polarFlight",
                list: list,
                span: 24,
                options: {
                    initialValue: datas.polarFlight
                }
            },
            {
                type: "Radio",
                label: "180 ETOPS",
                name: "etops",
                list: list,
                span: 24,
                options: {
                    initialValue: datas.etops
                }
            },
            {
                type: "Radio",
                label: "灵活航路",
                name: "flexAirLine",
                list: list,
                span: 24,
                options: {
                    initialValue: datas.flexAirLine
                }
            },
            {
                type: "Radio",
                label: "二次放行",
                name: "secRelease",
                list: list,
                span: 24,
                options: {
                    initialValue: datas.secRelease
                }
            },
            {
                type: "Radio",
                label: "PBN航路",
                name: "pbnAirLine",
                list: list,
                span: 24,
                options: {
                    initialValue: datas.pbnAirLine
                }
            },
            {
                type: "Radio",
                label: "是否受火山灰影响",
                name: "tephrosInfluence",
                list: list,
                span: 24,
                options: {
                    initialValue: datas.tephrosInfluence
                }
            },
            {
                type: "Radio",
                label: "氧气系统限制",
                name: "oxygenLimit",
                list: list,
                span: 24,
                options: {
                    initialValue: datas.oxygenLimit
                }
            },
            {
                type: "Radio",
                label: "要加飘降备降场",
                name: "alterAirport",
                list: list,
                span: 24,
                options: {
                    initialValue: datas.alterAirport
                }
            },
            {
                type: "Radio",
                label: "ADS-B要求",
                name: "adsRequire",
                list: list,
                span: 24,
                options: {
                    initialValue: datas.adsRequire
                }
            },
            {
                type: "Radio",
                label: "延伸跨水",
                name: "extCrossWater",
                list: list,
                span: 24,
                options: {
                    initialValue: datas.extCrossWater
                }
            },
            {
                type: "Radio",
                label: "业载受航程极限限制",
                name: "voyageLimit",
                list: list,
                span: 24,
                options: {
                    initialValue: datas.voyageLimit
                }
            },
            {
                type: "Radio",
                label: "是否飞越香港",
                name: "flyoverHk",
                list: list,
                span: 24,
                options: {
                    initialValue: datas.flyoverHk
                }
            },
            {
                type: "Radio",
                label: "外籍有限制",
                name: "foreignLimit",
                list: list,
                span: 24,
                options: {
                    initialValue: datas.foreignLimit
                }
            },
            {
                type: "Radio",
                label: "涉及释压飘降程序",
                name: "driftProce",
                list: list,
                span: 24,
                options: {
                    initialValue: datas.driftProce
                }
            },
            {
                type: "Radio",
                label: "低温航线",
                name: "lowTemAirLine",
                list: list,
                span: 24,
                options: {
                    initialValue: datas.lowTemAirLine
                }
            },
        ];
    }

    render(){
        const { table, modalOkBtnLoading, currentAction, selectedRowKeys, authorityList } = this.state;
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
            columns: this.columns,
            table: table,
            scroll: {
                x: "1960px"
            },
            rowSelection: {
                selectedRowKeys,
                onChange: (selectedRowKeys, selectedRows) => { // 选中项发生变化时的回调
                    this.onChecked(selectedRowKeys, selectedRows);
                },
            },
            onChange: this.getList
        }
        // add、edit模态框
        var title = currentAction == "add" ? "新增" : currentAction == "edit" ? "修改" : "";
        const modalOptions =  {
            options: {
                title: title,
                bodyStyle: {
                    height: "400px",
                    overflowY: "auto"
                },
                okButtonProps: { loading: modalOkBtnLoading }
            },
            onRef: (ref) => {this.modal = ref},
            ok: this.submit.bind(this)
        }
        const formOptions = this.getFormOptions();
        return(
            <CardCommon>
                { authorityList && <CommonForm options={searchFormOptions} btnOptions={btnOptions} wrappedComponentRef={(form) => { if(form && form.props && form.props.form) this.searcForm = form.props.form;}} /> }
                <div className="buttons"><CommonBtns options={commonBtnOptions} btns={this.state.btns} /></div>
                { authorityList && <CommonTable options={tableOptions} onChecked={this.onChecked}></CommonTable>}
                { !authorityList && <div className="no-authority-box">无权限查看</div> }
                <CommonModal {...modalOptions}>
                    <div className="mb30">特殊航线:</div>
                    <div className="form-grid-9" style={{paddingLeft: "30px", paddingRight: "60px"}}><CommonForm options={formOptions} wrappedComponentRef={(form) => { if(form && form.props && form.props.form) this.form = form.props.form;}} /></div>
                </CommonModal>
            </CardCommon>            
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
)(withRouter(RmSpecialAirLine));