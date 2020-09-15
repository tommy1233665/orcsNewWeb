import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import { Modal, message } from 'antd';
import { CardCommon, CommonTable, CommonForm, CommonBtns, CommonModal } from "common/component";
import { handleInParams, isAuthority } from "common/commonFn";
import { post } from 'common/http';
import PageModel from 'model/pageModel';
const { confirm } = Modal;

const ADD = "rmArptRiskParam.add"; // 新增
const EDIT = "rmArptRiskParam.edit"; // 修改
const DEL = "rmArptRiskParam.del"; // 删除
const LIST = "rmArptRiskParam.list"; // 查询

class RmArptRiskParam extends React.Component {

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
            operPeriodList: ["暂无需求", "一年", "半年", "三个月"],
            currentData: {},
            authorityList: isAuthority(LIST, props.authority),
        };
        this.columns = [
            { title: "序号", dataIndex: "index", width: 50 },
            { title: "编号", dataIndex: "itemNum", width: 100 },
            { title: "飞行阶段", dataIndex: "flyPhase", width: 150, isTooltip: true },
            { title: "风险因素", dataIndex: "riskItem", className: "text-left", isTooltip: true },
            { title: "风险值", dataIndex: "riskValue", width: 100 },
            { title: "维护期限", dataIndex: "operPeriod", width: 100 },
        ];   
        this.modal;
        this.form;
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
            url: "rmArptRiskParam/queryRmArptRiskParamListByParam",
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
                    url = "rmArptRiskParam/addRmArptRiskParam";
                    msg = "添加成功";
                }else{
                    url = "rmArptRiskParam/updateRmArptRiskParam";
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
            var list = this.state.selectedRows.map(item => item.itemNum);
            confirm({
                title: "确认删除【" + list.join("、") + "】吗?",
                okType: 'danger',
                onOk: () => {
                    post({
                        url: "rmArptRiskParam/deleteRmArptRiskParam",
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
                name: "keyWordSearch",
                span: 8,
                length: 5,
                placeholder: "请输入编号、飞行阶段、风险因素搜索"
            }
        ];
    }

    /**
     * 获取form表的配置
     */
    getFormOptions(){
        var datas = this.state.currentAction == "add" ? {} : this.state.currentData;
        return [
            {
                type: "Input",
                label: "编号",
                name: "itemNum",
                span: 24,
                options: {
                    initialValue: datas.itemNum,
                    rules: [
                        {required: true, message: "编号不可为空！"}
                    ]
                }
            },
            {
                type: "Input",
                label: "飞行阶段",
                name: "flyPhase",
                span: 24,
                options: {
                    initialValue: datas.flyPhase,
                    rules: [
                        {required: true, message: "飞行阶段不可为空！"}
                    ]
                }
            },
            {
                type: "Input",
                label: "风险因素",
                name: "riskItem",
                span: 24,
                placeholder: "字数不能超80！",
                options: {
                    initialValue: datas.riskItem,
                    rules: [
                        {required: true, message: "风险因素不可为空！"},
                        {max: 80, message: "字数不能超80！"}
                    ]
                }
            },
            {
                type: "Input",
                label: "风险值",
                name: "riskValue",
                span: 24,
                options: {
                    initialValue: datas.riskValue,
                    rules: [
                        {required: true, message: "风险值不可为空！"}
                    ]
                }
            },
            {
                type: "Select",
                label: "维护期限",
                name: "operPeriod",
                span: 24,
                list: this.state.operPeriodList,
                isHasAllSelect: false,
                options: {
                    initialValue: datas.operPeriod
                }
            }
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
            key: "itemNum",
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
        // add、edit模态框
        var title = currentAction == "add" ? "新增" : currentAction == "edit" ? "修改" : "";
        const modalOptions =  {
            options: {
                title: title,
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
                { authorityList && <CommonTable options={tableOptions} onChecked={this.onChecked}></CommonTable> }
                { !authorityList && <div className="no-authority-box">无权限查看</div> }      
                <CommonModal {...modalOptions}>
                    <div className="mb30">机场风险因素:</div>
                    <div className="form-grid-5" style={{paddingLeft: "60px", paddingRight: "70px"}}><CommonForm options={formOptions} wrappedComponentRef={(form) => { if(form && form.props && form.props.form) this.form = form.props.form;}} /></div>
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
)(withRouter(RmArptRiskParam));