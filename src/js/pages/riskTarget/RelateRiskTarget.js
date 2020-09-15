import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import { Modal, message } from 'antd';
import { CardCommon, CommonTable, CommonForm, CommonBtns, CommonModal } from "common/component";
import { handleInParams, isAuthority } from "common/commonFn";
import { post } from 'common/http';
import PageModel from 'model/pageModel';
const { confirm } = Modal;

const ADDEDIT = "relateRiskTarget.addEdit"; // 新增、修改
const DEL = "relateRiskTarget.del"; // 删除
const LIST = "relateRiskTarget.list"; // 查询

class RelateRiskTarget extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            table: new PageModel(),
            selectedRowKeys: [],
            selectedRows: [],
            btns: [
                { name: "新增", id: ADDEDIT, icon: "plus-circle", onClick: this.add },
                { name: "修改", id: ADDEDIT, icon: "edit", onClick: this.edit },
                { name: "删除", id: DEL, icon: "minus-circle", onClick: this.del }
            ].filter(item => isAuthority(item.id, props.authority)),
            authorityList: isAuthority(LIST, props.authority),
            modalOkBtnLoading: false,
            currentAction: "",
            isRiskvariablevalue: false // 编辑时：当风险累计方式为“无累计”时，风险变量值为空，该值为true
        };
        this.searchFormOptions = [
            {
                type: "Input",
                label: "风险名称",
                name: "riskName",
                span: 6,
                placeholder:"风险名称",
            }
        ];
        this.columns = [
            { title: "编号", dataIndex: "id", width: 46, fixed: 'left' },
            { title: "风险名", dataIndex: "name", width: 150, fixed: 'left', isTooltip: true },
            { title: "规则描述", dataIndex: "ruleDisc", width: 220, isTooltip: true },
            { title: "风险等级", dataIndex: "riskLevel", width: 76 },
            { title: "风险值", dataIndex: "riskValue", width: 64 },
            { title: "风险描述", dataIndex: "resultDisc", width: 220, isTooltip: true },
            { title: "风险累计方式", dataIndex: "accumulatemethod", width: 180, isTooltip: true },
            { title: "风险变量", dataIndex: "riskvariablevalue", width: 76 },
            { title: "建议措施", dataIndex: "measures", width: 220, isTooltip: true },
            { title: "优先级", dataIndex: "priority", width: 64 },
            { title: "默认", dataIndex: "useDefault", width: 46 },
            { title: "默认值", dataIndex: "defaultValue", width: 64 },
            { title: "生效", dataIndex: "valid", width: 46 },
        ];
        this.searcForm;
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
            url: "associateRisk/queryRiskByName",
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
                isRiskvariablevalue: false
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
                values.useDefault= values.useDefault[0];
                values.valid = values.valid[0];
                values = handleInParams(values);
                post({
                    url: "associateRisk/saveRisk",
                    data: values,
                    btn: () => this.setState({modalOkBtnLoading: false}),
                    success: data => {
                        var msg = this.state.currentAction == "add" ? "添加成功" : "修改成功";
                        message.success(msg);
                        this.modal.hide();
                        this.getList();
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
            var risks = this.state.selectedRows.map(item => {
                item.useDefault = item.useDefault == "是" ? true : false;
                item.valid = item.valid == "是" ? true : false;
                return item;
            });
            var names = risks.map(item => item.name);
            confirm({
                title: "确认删除【" + names.join("、") + "】风险?",
                okType: 'danger',
                onOk: () => {
                    post({
                        url: "associateRisk/deleteRisk",
                        data: {risks: JSON.stringify(risks)},
                        btn: callback,
                        success: data => {
                            message.success("删除成功");
                            this.getList();
                        }
                    });
                },
                onCancel: callback
            });
        }
    }

    /**
     * 获取form表的配置
     */
    getFormOptions(){
        const { currentAction, selectedRows, table, isRiskvariablevalue } = this.state;
        var data = {}, useDefault = false, valid = false;
        if( currentAction == "add" ){
            data.accumulatemethod = "无累计";
        }
        if( currentAction == "edit" && selectedRows.length > 0 ){
            data = table.dataList.find(item => item.id == selectedRows[0].id);
            useDefault = data.useDefault == "是" ? true : false;
            valid = data.valid == "是" ? true : false;
        }
        var riskvariablevalue = isRiskvariablevalue ? "" : data.riskvariablevalue;
        return [
            {
                type: "Input",
                label: "编号",
                name: "id",
                span: 24,
                placeholder: "关联风险编号（非空，唯一，长度64位以内）",
                options: {
                    initialValue: data.id,
                    rules: [
                        {required: true, message: '编号不能为空'},
                        {max: 64, message: '长度在64之内'},
                        {pattern: /^[a-zA-Z]\d+$/, message: '第一位为字母，其余为数字'}
                    ]
                }
            },
            {
                type: "Input",
                label: "风险名",
                name: "name",
                span: 24,
                placeholder: "风险名（非空，长度64位以内）",
                options: {
                    initialValue: data.name,
                    rules: [
                        {required: true, message: '编号不能为空'},
                        {max: 64, message: '长度在64之内'}
                    ]
                }
            },
            {
                type: "Input",
                label: "规则描述",
                name: "ruleDisc",
                span: 24,
                placeholder: "规则描述（长度800以内）",
                options: {
                    initialValue: data.ruleDisc,
                    rules: [
                        {max: 800, message: '规则描述长度不可超过800'}
                    ]
                }
            },
            {
                type: "Input",
                label: "风险等级",
                name: "riskLevel",
                span: 24,
                placeholder: "风险等级（长度1位）",
                options: {
                    initialValue: data.riskLevel,
                    rules: [{max: 1, message: '风险等级长度为1'}]
                }
            },
            {
                type: "Input",
                label: "风险值",
                name: "riskValue",
                span: 24,
                placeholder: "风险值（非默认情况下必填，数字）",
                options: {
                    initialValue: data.riskValue,
                    rules: [
                        {validator: (rule, value, callback) => (!this.form.getFieldValue("useDefault")[0] && !value) ? callback('非默认风险需要设置风险值') : callback()},
                        {pattern: /^[0-9]+(.[0-9]{2})?$/, message: '风险值为正实数，且小数点后面保留2位'},
                    ]
                }
            },
            {
                type: "Input",
                label: "风险描述",
                name: "resultDisc",
                span: 24,
                placeholder: "风险描述（长度500以内）",
                options: {
                    initialValue: data.resultDisc,
                }
            },
            {
                type: "Radio",
                label: "风险累计方式",
                name: "accumulatemethod",
                span: 24,
                list: ["无累计", "乘法(风险值*风险变量值)", "加法(风险值+风险变量值)"],
                options: {
                    initialValue: data.accumulatemethod,
                },
                onChange: (value) => {
                    if( value == "无累计" ){
                        this.setState({isRiskvariablevalue: true});
                    }
                }
            },
            {
                type: "Input",
                label: "风险变量值",
                name: "riskvariablevalue",
                span: 24,
                placeholder: "风险变量值（非无累计情况下必填，数字）",
                options: {
                    initialValue: riskvariablevalue,
                    rules: [
                        {pattern: /^[0-9]+(.[0-9]{2})?$/, message: '风险变量值为正实数，且小数点后面保留2位'},
                    ]
                    
                },
                hide: () => {
                    return (this.form && this.form.getFieldValue("accumulatemethod") == "无累计") || (!this.form && data.accumulatemethod == "无累计") ||  (this.form && !this.form.getFieldValue("accumulatemethod") && data.accumulatemethod == "无累计") ? true : false;
                }
            },
            {
                type: "Input",
                label: "建议措施",
                name: "measures",
                span: 24,
                placeholder: "建议措施（长度500以内）",
                options: {
                    initialValue: data.measures,
                    rules: [{max: 500, message: '缓解措施长度不可超过500'}]
                }
            },
            {
                type: "Input",
                label: "优先级",
                name: "priority",
                span: 24,
                placeholder: "优先级（非空，数字）",
                options: {
                    initialValue: data.priority,
                    rules: [
                        {pattern: /^[1-9]\d{0,3}$/, message: '风险优先级为4位以内的数值'},
                    ]
                }
            },
            {
                type: "Checkbox",
                label: "默认",
                name: "useDefault",
                span: 7,
                list: [
                    {label: "", value: true}
                ],
                options: {
                    initialValue: [useDefault]
                }
            },
            {
                type: "Input",
                label: "默认值",
                name: "defaultValue",
                span: 15,
                placeholder: "默认值（默认情况下必填，数字）",
                options: {
                    initialValue: data.defaultValue,
                    rules: [
                        {validator: (rule, value, callback) => (this.form.getFieldValue("useDefault")[0] && !value) ? callback('默认风险需要设置对应的默认风险值') : callback()},
                        {pattern: /^[0-9]+(.[0-9]{2})?$/, message: '默认风险值为正实数，且小数点后面保留2位'}
                    ]
                }
            },
            {
                type: "Checkbox",
                label: "生效",
                name: "valid",
                span: 7,
                list: [
                    {label: "", value: true}
                ],
                options: {
                    initialValue: [valid]
                }
            }
        ];
    }

    render(){
        const { table, selectedRowKeys, authorityList } = this.state;
        // 查询form
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
                x: "1532px",
            },
            rowSelection: {
                selectedRowKeys,
                onChange: (selectedRowKeys, selectedRows) => { // 选中项发生变化时的回调
                    this.onChecked(selectedRowKeys, selectedRows);
                },
            },
            onChange: this.getList
        }
        // 模态框
        var title = this.state.currentAction == "add" ? "新增" : this.state.currentAction == "edit" ? "编辑" : "";
        const modalOptions =  {
            options: {
                title: title,
                width: "650px",
                bodyStyle: {
                    height: "443px",
                    overflow: "auto"
                },
                okButtonProps: { loading: this.state.modalOkBtnLoading }
            },
            onRef: (ref) => {this.modal = ref},
            ok: this.submit.bind(this)
        }
        const formOptions = this.getFormOptions();
        return(
            <CardCommon>
                { authorityList && <CommonForm options={this.searchFormOptions} btnOptions={btnOptions} wrappedComponentRef={(form) => { if(form && form.props && form.props.form) this.searcForm = form.props.form;}} />}
                <div className="buttons"><CommonBtns options={commonBtnOptions} btns={this.state.btns} /></div>
                { authorityList && <CommonTable options={tableOptions} onChecked={this.onChecked}></CommonTable>}
                { !authorityList && <div className="no-authority-box">无权限查看</div> }       
                <CommonModal {...modalOptions}>
                    <div className="form-grid-6">
                        <CommonForm options={formOptions} wrappedComponentRef={(form) => { if(form && form.props && form.props.form) this.form = form.props.form;}} />
                    </div>
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
)(withRouter(RelateRiskTarget));