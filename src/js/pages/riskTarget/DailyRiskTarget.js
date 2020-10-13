import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import { Modal, message, Input, Tree, Icon, Tooltip } from 'antd';
import moment from 'moment';
import { CardCommon, CommonTable, CommonForm, CommonBtns, CommonModal } from "common/component";
import { handleInParams, isAuthority } from "common/commonFn";
import { post } from 'common/http';
import PageModel from 'model/pageModel';
const { confirm } = Modal;
const { Search } = Input;
const { TreeNode, DirectoryTree } = Tree;

const ADD = "dailyRiskTarget.add"; // 新增
const EDIT = "dailyRiskTarget.edit"; // 修改
const DEL = "dailyRiskTarget.del"; // 删除
const LIST = "dailyRiskTarget.list"; // 查询

class DailyRiskTarget extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            allBranch: [], // 所有公司
            searchFormOptions: [],
            table: new PageModel(),
            selectedRowKeys: [],
            selectedRows: [],
            currentRow: {}, // 双击一行查看时
            btns: [
                { name: "新增", id: ADD, icon: "plus-circle", onClick: this.add },
                { name: "修改", id: EDIT, icon: "edit", onClick: this.edit },
                { name: "删除", id: DEL, icon: "minus-circle", onClick: this.del }
            ].filter(item => isAuthority(item.id, props.authority)),
            authorityList: isAuthority(LIST, props.authority),
            currentAction: ""
        };
        this.columns = [
            { title: "序号", dataIndex: "index", width: 60, fixed: 'left' },
            { title: "风险名称", dataIndex: "riskName", width: 200, isTooltip: true, fixed: 'left' },
            { title: "维护部门", dataIndex: "maintenanceDept", width: 100, isTooltip: true },
            { title: "风险值", dataIndex: "riskValue", width: 70 },
            { title: "起飞机场", dataIndex: "depArpName", width: 100 },
            { title: "目的地机场", dataIndex: "destArpName", width: 100 },
            { title: "目的地备降场", dataIndex: "destBjName", width: 120 },
            { title: "航线代码", dataIndex: "routeCode", width: 100 },
            { title: "飞行机组", dataIndex: "fltCrew", width: 100, isTooltip: true },
            { title: "机尾号", dataIndex: "latestTailNr", width: 100, isTooltip: true },
            { title: "阶段", dataIndex: "phase", width: 100 },
            { title: "风险提示", dataIndex: "riskTips", width: 200, isTooltip: true },
            { title: "附件", dataIndex: "riskTipsAppendix", width: 100, render: (text) => text && <Icon type="check" /> },
            { title: "缓解措施", dataIndex: "mitigationMeasures", width: 200, isTooltip: true },
            { title: "附件", dataIndex: "mitigationMeasuresAppendix", width: 100, render: (text) => text && <Icon type="check" /> },
            { title: "生效时间", dataIndex: "effectiveTime", width: 150 },
            { title: "失效时间", dataIndex: "invalidTime", width: 150 },
            { title: "更新人", dataIndex: "updateUser", width: 100 },
            { title: "更新时间", dataIndex: "updateTime", width: 150 }
        ];
        this.searcForm;
        this.modal;
        this.editFrom;
    }

    componentDidMount() {
        this.getAllBranch(data => {
            this.setState({ allBranch: data });
            this.getList();
        });
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        };
    }

    getAllBranch(callback) {
        post({
            url: "acfData/getAllBranch",
            success: data => {
                callback && callback(data);
            }
        });
    }

    getList = (obj = {}) => {
        const table = this.state.table;
        table.setPage(obj);
        let params = table.getParmaData();
        post({
            url: "dailyAssociateRisk/queryDailyAssoRiskListByParam",
            data: params,
            success: data => {
                var dataList = data.rows.map((item, i) => {
                    item.index = (params.pageNum - 1) * params.pageSize + i + 1;
                    return item;
                });
                table.setPage({ dataList, total: data.total, pageNum: params.pageNum, pageSize: params.pageSize });
                this.setState({ table, selectedRowKeys: [], selectedRows: [] });
            }
        });
    }

    onChecked = (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys, selectedRows });
    }

    reset = () => {
        this.searcForm.resetFields();
        this.search();
    }

    /**
     * 处理查询参数（航班日期范围的特殊处理）
     */
    handleSearchParams(values) {
        const params = handleInParams(values);
        for (let key in params) {
            if (key == "startAndEnd" && params[key].length == 2) {
                params["startDt"] = moment(params[key][0]).format("YYYY-MM-DD");
                params["endDt"] = moment(params[key][1]).format("YYYY-MM-DD");
                delete params[key];
            }
            if (key == "treeSelectCustom") {
                for (var i in params[key].value) {
                    if (i == "acftType") params[i] = params[key].value[i];
                }
                delete params[key];
            }
        }
        return params;
    }

    search = () => {
        event.preventDefault();
        this.searcForm.validateFields((err, values) => {
            if (!err) {
                values = this.handleSearchParams(values);
                this.getList({ params: values, pageNum: 1 });
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
        if (this.state.selectedRows.length == 0) {
            callback();
            message.warning("必须选择一个选项才能编辑！");
        } else if (this.state.selectedRows.length > 1) {
            callback();
            message.warning("只能选择一个选项！");
        } else {
            callback();
            this.setState({
                currentAction: "edit"
            });
            this.modal.show();
        }
    }

    submit = () => {
        this.editFrom.submit(() => {
            this.modal.hide();
            this.getList({ pageNum: 1 });
        });
    }

    del = (callback) => {
        if (this.state.selectedRows.length == 0) {
            callback();
            message.warning("请至少选择一行数据");
        } else {
            var ids = this.state.selectedRows.map(item => item.id);
            var names = this.state.selectedRows.map(item => item.riskName);
            confirm({
                title: "确认删除【" + names.join("、") + "】风险?",
                okType: 'danger',
                onOk: () => {
                    post({
                        url: "dailyAssociateRisk/deleteDailyAssoRisksInfo",
                        data: { dailyAssoRiskIds: ids },
                        btn: callback,
                        success: data => {
                            message.success("删除成功");
                            this.getList({ pageNum: 1 });
                        }
                    });
                },
                onCancel: callback
            });
        }
    }

    /**
     * 获取searchForm表的配置
     */
    getSearchFormOptions() {
        var allBranch = this.state.allBranch.map(item => {
            return item.branchCd;
        });
        return [
            {
                type: "Select",
                label: "风险值",
                name: "riskValue",
                span: 4,
                list: [
                    { key: "低", text: "低0-4.0" },
                    { key: "中", text: "中4.1-7.0" },
                    { key: "高", text: "高7.1-10" }
                ],
                length: 3,
                isHasAllSelect: false
            },
            {
                type: "Input",
                label: "风险名称",
                name: "riskName",
                span: 4,
                length: 4
            },
            {
                type: "Input",
                label: "飞行机组",
                name: "fltCrew",
                span: 4,
                length: 4
            },
            {
                type: "Input",
                label: "目的地机场",
                name: "destArpt",
                span: 4,
                length: 6
            },
            {
                type: "Input",
                label: "航线代码",
                name: "routeCode",
                span: 4,
                length: 4
            },
            {
                type: "Select",
                label: "飞机所属公司",
                name: "branchCode",
                span: 4,
                list: allBranch,
                length: 6,
                isHasAllSelect: false
            },
            {
                type: "Input",
                label: "机尾号",
                name: "latestTailNr",
                span: 4,
                length: 3
            },
            {
                type: "Select",
                label: "维护部门",
                name: "maintenanceDept",
                span: 4,
                list: ["运指中心", "信息中心", "安监部", "飞行总队", "机务工程部"],
                length: 4,
                isHasAllSelect: false
            },
            {
                type: "Input",
                label: "起飞机场",
                name: "depArpCd",
                span: 4,
                length: 4
            },
            {
                type: "Input",
                label: "目的地备降场",
                name: "destBjArpt",
                span: 4,
                length: 6
            },
            {
                type: "Select",
                label: "状态",
                name: "status",
                span: 4,
                list: ["当前有效", "已失效", "全部"],
                length: 4,
                isHasAllSelect: false
            },
            {
                type: "Select",
                label: "航班所属公司",
                name: "fltBranchCode",
                span: 4,
                list: allBranch,
                length: 6,
                isHasAllSelect: false
            },
            {
                type: "Input",
                label: "更新人",
                name: "updateUser",
                span: 4,
                length: 3
            },
            {
                type: "RangePicker",
                label: "更新时间",
                name: "startAndEnd",
                span: 8,
                length: 4
            },
            {
                type: "TreeSelectCustom",
                label: "机型",
                name: "treeSelectCustom",
                span: 10,
                detailSpan: [8, 16],
                length: 2
            }
        ];
    }

    render() {
        // 查询form
        const searchFormOptions = this.getSearchFormOptions();
        const btnOptions = {
            aligin: "right",
            span: 2,
            list: [
                //{text: "重置", options: "resetOpt", event: this.reset},
                { text: "查询", options: "queryOpt", event: this.search }
            ]
        };
        // 增删改
        const commonBtnOptions = {
            shape: "round",
            size: "small"
        };
        const { table, selectedRowKeys, authorityList } = this.state;
        const tableOptions = {
            columns: this.columns,
            table: table,
            scroll: { x: "2360px" },
            onRow: (record) => {
                return {
                    onDoubleClick: event => {
                        this.setState({
                            currentAction: "detail",
                            currentRow: record
                        });
                        this.modal.show();
                    }
                };
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
        var title = this.state.currentAction == "add" ? "新增" : this.state.currentAction == "edit" ? "修改" : "查看";
        const modalOptions = {
            options: {
                title: title + "日常风险",
                width: "1000px",
                bodyStyle: {
                    height: "500px",
                    overflow: "auto"
                },
                okButtonProps: { loading: false }
            },
            onRef: (ref) => { this.modal = ref },
            ok: this.submit.bind(this)
        }
        if (this.state.currentAction == "detail") {
            modalOptions.options.footer = null;
        }
        var datas = this.state.currentAction == "edit" ? this.state.selectedRows[0] : this.state.currentAction == "detail" ? this.state.currentRow : {};
        return (
            <CardCommon>
                { authorityList && <CommonForm options={searchFormOptions} btnOptions={btnOptions} wrappedComponentRef={(form) => { if (form && form.props && form.props.form) this.searcForm = form.props.form; }} />}
                <div className="buttons"><CommonBtns options={commonBtnOptions} btns={this.state.btns} /></div>
                { authorityList && <CommonTable options={tableOptions} onChecked={this.onChecked}></CommonTable>}
                { !authorityList && <div className="no-authority-box">无权限查看</div>}
                <CommonModal {...modalOptions}>
                    <EditFrom allBranch={this.state.allBranch} datas={datas} userInfo={this.props.userInfo} currentAction={this.state.currentAction} onRef={ref => this.editFrom = ref} />
                </CommonModal>
            </CardCommon>
        );
    }
}

class EditFrom extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            options1: [],
            options2: [],
            options3: [],
            options4: [],
            options5: [],
            options6: [],
            options7: []
        };
        this.form1;
        this.form2;
        this.form3;
        this.form4;
        this.form5;
        this.form6;
        this.form7;
        this.otherConfig;
    }
    componentDidMount() {
        if (this.props.onRef) this.props.onRef(this, "CommonModal");
        const newAllBranch = this.props.allBranch.map(item => {
            return item.branchCd;
        });
        const datas = this.props.datas;
        this.setState({
            options1: this.getOptions1(datas),
            options2: this.getOptions2(newAllBranch, datas),
            options3: this.getOptions3(newAllBranch, datas),
            options4: this.getOptions4(datas),
            options5: this.getOptions5(datas),
            options6: this.getOptions6(datas),
            options7: this.getOptions7(datas),
        });
    }
    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        };
    }
    getOptions1(datas) {
        return [{
            type: "GroupCustom",
            label: "机组",
            name: "fltCrew",
            span: 18,
            length: 4,
            placeholder: "员工号：205602",
            variableTemp: "fltCrew",
            tooltip: "多个机组请用英文分号;隔开",
            options: {
                initialValue: datas.fltCrew,
                rules: [
                    {
                        validator: (rule, value, callback) => {
                            const reg = /^0$|^[0-9;]*$/;
                            if (value.value && !reg.test(value.value)) {
                                callback('输入规范的员工号！')
                            }
                            callback();
                        }
                    }
                ]
            }
        }];
    }
    getOptions2(allBranch, datas) {
        var melType = datas.melType ? datas.melType : "MEL";
        return [
            {
                type: "GroupCustom",
                label: "机尾号",
                name: "latestTailNr",
                span: 15,
                length: 4,
                placeholder: "如：B6138",
                variableTemp: "latestTailNr",
                tooltip: "多个机尾号请用英文分号;隔开",
                options: {
                    initialValue: datas.latestTailNr,
                    rules: [
                        {
                            validator: (rule, value, callback) => {
                                const reg = /^0$|^[A-Z0-9;]*$/;
                                if (value.value && !reg.test(value.value)) {
                                    callback('输入规范的机尾号！')
                                }
                                callback();
                            }
                        }
                    ]
                }
            },
            {
                type: "Select",
                label: "所属公司",
                name: "branchCode",
                span: 9,
                list: allBranch,
                length: 4,
                isHasAllSelect: false,
                options: {
                    initialValue: datas.branchCode
                }
            },
            {
                type: "TreeSelectCustom",
                label: "机型",
                name: "treeSelectCustom",
                span: 24,
                detailSpan: [10, 14],
                length: 4,
                options: {
                    initialValue: { acftType: datas.acftType, eqpType: datas.eqpType }
                }
            },
            {
                type: "Input",
                label: "MEL",
                name: "melInfo",
                span: 12,
                length: 4,
                placeholder: "如：32-51-01-01",
                tooltip: "多个MEL请用英文分号;隔开",
                options: {
                    initialValue: datas.melInfo
                }
            },
            {
                type: "Radio",
                name: "melType",
                list: ["MEL", "CDL"],
                span: 12,
                options: {
                    initialValue: melType
                }
            }
        ];
    }
    getOptions3(allBranch, datas) {
        var arr = [];
        if (datas.depArpCd) arr.push("depArpCd");
        if (datas.destArpt) arr.push("destArpt");
        if (datas.destBjArpt) arr.push("destBjArpt");
        return [
            {
                type: "GroupCustom",
                label: "机场",
                name: "arpName",
                span: 18,
                length: 4,
                placeholder: "四字码，如：ZGGG",
                variableTemp: "arpName",
                tooltip: "多个机场请用英文分号;隔开",
                options: {
                    initialValue: datas.arpName,
                    rules: [
                        {
                            validator: (rule, value, callback) => {
                                const reg = /^[A-Z;]*$/;
                                if (value.value && !reg.test(value.value)) {
                                    callback('输入规范的机场编码！')
                                }
                                callback();
                            }
                        }
                    ]
                }
            },
            {
                type: "Radio",
                name: "depArpCdDestArptDestBjArpt",
                list: [
                    { key: "depArpCd", text: "起飞机场" },
                    { key: "destArpt", text: "目的地机场" },
                    { key: "destBjArpt", text: "目的地备降场" }
                ],
                span: 24,
                style: { marginLeft: "5em" },
                options: {
                    initialValue: arr
                }
            },
            {
                type: "GroupCustom",
                label: "航班号",
                name: "fltNr",
                span: 18,
                length: 4,
                placeholder: "如：CSN348或CQN",
                variableTemp: "fltNr",
                tooltip: "多个航班号请用英文分号;隔开",
                options: {
                    initialValue: datas.fltNr
                }
            },
            {
                type: "Select",
                label: "所属公司",
                name: "fltBranchCode",
                span: 15,
                list: allBranch,
                length: 4,
                isHasAllSelect: false,
                options: {
                    initialValue: datas.fltBranchCode
                }
            },
            {
                type: "TextArea",
                label: "航路代码",
                name: "routeCode",
                span: 24,
                length: 4,
                rows: 2,
                placeholder: "城市或公司航路：CANPEK或CANPEK01",
                tooltip: "多个航路代码请用英文分号;隔开",
                options: {
                    initialValue: datas.routeCode
                }
            }
        ];
    }
    getOptions4(datas) {
        var arr = [];
        if (datas.takeOff) arr.push("takeOff");
        if (datas.cruise) arr.push("cruise");
        if (datas.landing) arr.push("landing");
        return [
            {
                type: "Input",
                label: "风险名称",
                name: "riskName",
                span: 15,
                length: 5,
                options: {
                    initialValue: datas.riskName,
                    rules: [{ required: true, message: "风险名称不可为空！" }]
                }
            },
            {
                type: "InputCheckboxCustom",
                label: "风险值",
                name: "riskValuePresentation",
                span: 19,
                length: 5,
                placeholder: "低0-4.0 中4.1-7.0 高7.1-10.0",
                options: {
                    initialValue: {
                        riskValue: datas.riskValue,
                        presentation: datas.presentation
                    },
                    rules: [
                        {
                            validator: (rule, value, callback) => {
                                //const reg = /^0$|^[1-9]\d*$|^[1-9]\d*.\d{1,2}$|^0.\d{1,2}$/;
                                const reg = /^0$|^[0-9]\d*$|^[0-9]\d*.\d{1}$|^0/;
                                if (value.value.riskValue && !reg.test(value.value.riskValue)) {
                                    callback('保留1位小数！')
                                }
                                if (value.value.riskValue && value.value.riskValue > 10) {
                                    callback('不能大于10')
                                }
                                callback();
                            }
                        }
                    ]
                }
            },
            {
                type: "Checkbox",
                label: "阶段",
                name: "takeOffCruiseLanding",
                list: [
                    { value: "takeOff", label: "起飞" },
                    { value: "cruise", label: "巡航" },
                    { value: "landing", label: "着陆" }
                ],
                span: 24,
                length: 5,
                options: {
                    initialValue: arr,
                    rules: [{ required: true, message: "阶段不可为空！" }]
                }
            },
        ];
    }

    getOptions5(datas) {
        return [
            {
                type: "UploadFileCustom",
                name: "riskTipsAppendix",
                options: {
                    initialValue: datas.riskTipsAppendix
                }
            },
            {
                type: "TextArea",
                name: "riskTips",
                span: 24,
                rows: 4,
                options: {
                    initialValue: datas.riskTips
                }
            }
        ];
    }

    getOptions6(datas) {
        return [
            {
                type: "UploadFileCustom",
                name: "mitigationMeasuresAppendix",
                options: {
                    initialValue: datas.mitigationMeasuresAppendix
                }
            },
            {
                type: "TextArea",
                name: "mitigationMeasures",
                span: 24,
                rows: 4,
                options: {
                    initialValue: datas.mitigationMeasures
                }
            }
        ];
    }

    getOptions7(datas) {
        return [
            {
                type: "DatePicker",
                label: "生效时间",
                name: "effectiveTime",
                span: 24,
                length: 5,
                options: {
                    initialValue: moment(datas.effectiveTime),
                    rules: [{ required: true, message: "生效时间不可为空！" }]
                }
            },
            {
                type: "DatePicker",
                label: "失效时间",
                name: "invalidTime",
                span: 24,
                length: 5,
                options: {
                    initialValue: moment(datas.invalidTime),
                    rules: [{ required: true, message: "失效时间不可为空！" }]
                }
            },
            {
                type: "Select",
                label: "维护部门",
                name: "maintenanceDept",
                span: 12,
                list: ["运指中心", "信息中心", "安监部", "飞行总队", "机务工程部"],
                length: 5,
                isHasAllSelect: false,
                options: {
                    initialValue: datas.maintenanceDept,
                    rules: [{ required: true, message: "维护部门不可为空！" }]
                }
            },
            {
                type: "Select",
                label: "提醒对象",
                name: "reminder",
                span: 12,
                list: ["签派", "机组", "全部"],
                length: 5,
                isHasAllSelect: false,
                options: {
                    initialValue: datas.reminder,
                    rules: [{ required: true, message: "提醒对象不可为空！" }]
                }
            }
        ];
    }

    handleValues(result, form, cb) {
        form.validateFields((err, values) => {
            if (!err) {
                for (var key in values) {
                    if ((key == "fltCrew" || key == "latestTailNr" || key == "arpName" || key == "fltNr" || key == "riskTipsAppendix" || key == "mitigationMeasuresAppendix") && values[key]) values[key] = values[key].value;
                    if (key == "treeSelectCustom" || key == "riskValuePresentation") {
                        if (values[key] && values[key].value) {
                            for (var i in values[key].value) {
                                values[i] = values[key].value[i];
                            }
                            delete values[key];
                        }
                    }
                    // depArpCd、destArpt、destBjArpt
                    if (key == "depArpCdDestArptDestBjArpt") {
                        if (values[key]) {
                            if (values[key] == "depArpCd") values.depArpCd = true;
                            if (values[key] == "destArpt") values.destArpt = true;
                            if (values[key] == "destBjArpt") values.destBjArpt = true;
                        }
                        if (!values.depArpCd) values.depArpCd = false;
                        if (!values.destArpt) values.destArpt = false;
                        if (!values.destBjArpt) values.destBjArpt = false;
                        delete values[key];
                    }
                    // takeOff、cruise、landing
                    if (key == "takeOffCruiseLanding") {
                        if (values[key]) {
                            values[key].forEach((item, i) => {
                                values[item] = true;
                            });
                        }
                        if (!values.takeOff) values.takeOff = false;
                        if (!values.cruise) values.cruise = false;
                        if (!values.landing) values.landing = false;
                        delete values[key];
                    }
                    if (key == "effectiveTime" || key == "invalidTime") {
                        values[key] = moment(values[key]).format('YYYY-MM-DD HH:mm:ss');
                    }
                }
                Object.assign(result, values);
                // console.log(result, values, '获取input')
                cb && typeof cb == "function" && cb();
            }
        });
    }

    submit = (callback) => {
        var result = {};
        this.handleValues(result, this.form1, () => {
            this.handleValues(result, this.form2, () => {
                this.handleValues(result, this.form3, () => {
                    this.handleValues(result, this.form4, () => {
                        this.handleValues(result, this.form5, () => {
                            this.handleValues(result, this.form6, () => {
                                this.handleValues(result, this.form7, () => {
                                    var obj = {};
                                    this.otherConfig.state.list.forEach((item, i) => {
                                        obj[item.id] = item.riskValue;
                                    });
                                    result.rmItemIds = JSON.stringify(obj).replace("{", "").replace("}", "");
                                    const params = handleInParams(result);
                                    const currentAction = this.props.currentAction;
                                    var url, msg;
                                    if (currentAction == "add") {
                                        url = "dailyAssociateRisk/addDailyAssoRisksInfo";
                                        msg = "添加";
                                    } else if (currentAction == "edit") {
                                        url = "dailyAssociateRisk/updateDailyAssoRisksInfo";
                                        msg = "修改";
                                        params.id = this.props.datas.id;
                                    }
                                    if (url) {
                                        post({
                                            url: url,
                                            data: params,
                                            success: res => {
                                                if (res.success) {
                                                    message.success(msg + "成功！");
                                                    callback && typeof callback == "function" && callback();
                                                } else {
                                                    message.error(msg + "失败！");
                                                }
                                            }
                                        });
                                    }
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    render() {
        const { userInfo = {} } = this.props;
        return (
            <div className="daily-risk-target">
                <div className="update-user">更新人：{userInfo.userCode}</div>
                <div className="fl" style={{ width: "53%" }}>
                    <CardCommon title="机组配置">
                        <CommonForm options={this.state.options1} wrappedComponentRef={(form) => { if (form && form.props && form.props.form) this.form1 = form.props.form }} />
                    </CardCommon>
                    <CardCommon title="飞机配置">
                        <CommonForm options={this.state.options2} wrappedComponentRef={(form) => { if (form && form.props && form.props.form) this.form2 = form.props.form }} />
                    </CardCommon>
                    <CardCommon title="航班配置">
                        <CommonForm options={this.state.options3} wrappedComponentRef={(form) => { if (form && form.props && form.props.form) this.form3 = form.props.form }} />
                    </CardCommon>
                    <div className="mt20">
                        <CommonForm options={this.state.options4} wrappedComponentRef={(form) => { if (form && form.props && form.props.form) this.form4 = form.props.form }} />
                    </div>
                </div>
                <div className="fr pl15" style={{ width: "47%" }}>
                    <CardCommon title="其他配置">
                        <OtherConfig datas={this.props.datas.rmItemIdList} onRef={ref => this.otherConfig = ref} />
                    </CardCommon>
                    <CardCommon title="风险提示">
                        <div className="fixed-height">
                            <CommonForm options={this.state.options5} wrappedComponentRef={(form) => { if (form && form.props && form.props.form) this.form5 = form.props.form }} />
                        </div>
                    </CardCommon>
                    <CardCommon title="缓解措施">
                        <div className="fixed-height">
                            <CommonForm options={this.state.options6} wrappedComponentRef={(form) => { if (form && form.props && form.props.form) this.form6 = form.props.form }} />
                        </div>
                    </CardCommon>
                    <div className="mt20">
                        <CommonForm options={this.state.options7} wrappedComponentRef={(form) => { if (form && form.props && form.props.form) this.form7 = form.props.form }} />
                    </div>
                </div>
            </div>
        );
    }

}

class OtherConfig extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            list: [],
            currentItem: {}
        };
        this.btns = [
            { name: "新增", icon: "plus", onClick: this.add },
            { name: "删除", icon: "minus", onClick: this.del }
        ];
        this.form;
    }

    componentDidMount() {
        if (this.props.onRef) this.props.onRef(this);
        if (this.props.datas) {
            var list = [];
            for (var key in this.props.datas) {
                var obj = {
                    id: key.substring(0, key.indexOf("*")),
                    path: key.substring(key.lastIndexOf("*") + 1),
                    riskName: key.substring(key.lastIndexOf("-") + 1),
                    riskValue: this.props.datas[key]
                }
                list.push(obj);
            }
            this.setState({ list });
        }
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        };
    }

    getFormOptions() {
        return [
            {
                type: "Hidden",
                name: "id",
            },
            {
                type: "Hidden",
                name: "path",
            },
            {
                type: "Input",
                label: "节点名称",
                name: "riskName",
                span: 24,
                length: 5
            },
            {
                type: "Input",
                label: "风险值>=",
                name: "riskValue",
                span: 24,
                length: 5
            },
        ];
    }

    onSelect(data) {
        this.form.setFieldsValue({
            id: data.id,
            path: data.path,
            riskName: data.name,
            riskValue: data.riskValue
        });
    }

    add = (callback) => {
        callback();
        this.modal.show();
    }

    submit = () => {
        this.form.validateFields((err, values) => {
            if (!err) {
                var list = this.state.list;
                list.push(values);
                this.setState({ list });
                this.modal.hide();
            }
        });
    }

    onClick = (data) => {
        var list = this.state.list.map((item, i) => {
            item.active = item.id == data.id ? true : false;
            return item;
        });
        this.setState({
            list: list,
            currentItem: data
        });
    }

    del = (callback) => {
        callback();
        const { list, currentItem } = this.state;
        var arr = list.filter((item, i) => item.id != currentItem.id);
        this.setState({
            list: arr,
            currentItem: {}
        });
    }

    render() {
        const modalOptions = {
            options: { title: "新增其他配置" },
            onRef: (ref) => { this.modal = ref },
            ok: this.submit.bind(this)
        }
        const formOptions = this.getFormOptions();
        return (
            <div className="daily-risk-target-other flex">
                <div className="box">
                    {
                        this.state.list.map((item, i) => {
                            var path = "";
                            if (item.path) path = item.path.substring(0, 2);
                            var title = `<div>阶段：${path}<br />父节点：${item.path}<br />风险值 >= ${item.riskValue}</div>`;
                            return (
                                <Tooltip title={title} key={i} >
                                    <div className={item.active ? "active" : ""} onClick={() => this.onClick(item)}>{item.riskName}</div>
                                </Tooltip>
                            )
                        })
                    }
                </div>
                <div className='buttons'>
                    <CommonBtns btns={this.btns} />
                </div>
                <CommonModal {...modalOptions}>
                    <div className="daily-risk-target-other-modal clearfix">
                        <div className="fl"><RmItemTree onSelect={data => this.onSelect(data)} /></div>
                        <div className="fr"><CommonForm options={formOptions} wrappedComponentRef={(form) => { if (form && form.props && form.props.form) this.form = form.props.form }} /></div>
                    </div>
                </CommonModal>
            </div>
        );
    }
}


class RmItemTree extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            treeData: [],
            tip: "请输入节点名称",
            expandedKeys: [],
            searchValue: "",
            autoExpandParent: false,
            nodeData: {},
        };
    }

    componentDidMount() {
        this.getRiskValue("root", data => this.setState({ treeData: data }));
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        };
    }

    getRiskValue(parentId, callback) {
        post({
            url: "rmItem/loadRmItemTreeChildren",
            data: { parentId: parentId },
            success: data => {
                var arr = data.map(item => {
                    return {
                        title: item.name,
                        key: item.id,
                        isLeaf: item.isLeaf == "N" ? false : true,
                        datas: item,
                    };
                });
                callback && typeof callback == "function" && callback(arr);
            }
        });
    }

    onLoadData = node => new Promise(resolve => {
        if (node.props.children) {
            resolve();
            return;
        }
        this.getRiskValue(node.props.dataRef.key, data => {
            node.props.dataRef.children = data;
            this.setState({ treeData: [...this.state.treeData] });
            resolve();
        });
    });

    onExpand = (expandedKeys, { expanded, node }) => {
        this.setState({
            expandedKeys: expandedKeys
        });
    }

    renderTreeNodes = data => data.map(item => {
        let { searchValue } = this.state;
        const index = item.title.indexOf(searchValue);
        const beforeStr = item.title.substr(0, index);
        const afterStr = item.title.substr(index + searchValue.length);
        let title = index == -1 ? item.title : (<React.Fragment>{beforeStr} <span className="text-danger">{searchValue}</span> {afterStr}</React.Fragment>);
        if (item.children) {
            return (
                <TreeNode title={title} key={item.key} isLeaf={item.isLeaf} dataRef={item}>
                    {this.renderTreeNodes(item.children)}
                </TreeNode>
            );
        }
        return <TreeNode title={title} key={item.key} isLeaf={item.isLeaf} dataRef={item} />;
    });

    treeReplace(list, data, parentId) {
        if (list) {
            list.forEach(item => {
                if (item.key == parentId) {
                    item.children = data;
                } else if (item.children) {
                    item.children = this.treeReplace(item.children, data, parentId);
                }
            });
        }
        return list;
    }

    onSearch(value) {
        if (value) {
            let This = this;
            post({
                url: "rmItem/searchRmImte",
                data: { name: value },
                success: data => {
                    if (data) {
                        let { treeData } = this.state;
                        // 递归请求接口
                        var i = 0;
                        _ajaxRiskValue();
                        function _ajaxRiskValue() {
                            var id = data[i].id;
                            This.getRiskValue(id, res => {
                                treeData = This.treeReplace(treeData, res, id);
                                i++;
                                if (i < data.length) {
                                    _ajaxRiskValue();
                                } else {
                                    This.setState({
                                        treeData: treeData,
                                        expandedKeys: data.map((item) => { return item.id }),
                                        searchValue: value,
                                    });
                                }
                            });
                        }
                    }
                }
            });
        } else {
            message.warning(this.state.tip);
        }
    }

    onSelect = (selectedKeys, e) => {
        if (e.selectedNodes.length > 0) {
            var data = e.selectedNodes[0].props.dataRef.datas;
            if (data.isLeaf == "Y") {
                this.props.onSelect(data);
            }
        }
    }

    render() {
        return (
            <React.Fragment>
                <Search placeholder={this.state.tip} onSearch={value => this.onSearch(value)} />
                <div className="search-tree">
                    <DirectoryTree
                        loadData={this.onLoadData}
                        onExpand={this.onExpand}
                        expandedKeys={this.state.expandedKeys}
                        autoExpandParent={this.state.autoExpandParent}
                        onSelect={this.onSelect}
                    >{this.renderTreeNodes(this.state.treeData)}</DirectoryTree>
                </div>
            </React.Fragment>
        );
    }

}

const mapStateToProps = (state) => {
    return {
        userInfo: state.userInfo,
        authority: state.authority
    };
}

export default connect(
    mapStateToProps
)(withRouter(DailyRiskTarget));