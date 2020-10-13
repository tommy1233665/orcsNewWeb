import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import { Modal, message, Input } from 'antd';
import { CardCommon, CommonTable, CommonForm, CommonBtns, CommonModal } from "common/component";
import { handleInParams, isAuthority } from "common/commonFn";
import { post } from 'common/http';
import PageModel from 'model/pageModel';
const { confirm } = Modal;

const ADD = "acfData.add"; // 新增
const EDIT = "acfData.edit"; // 修改
const DEL = "acfData.del"; // 删除
const LIST = "acfData.list"; // 查询
const DETAIL = "acfData.detail"; // 查询飞机详情信息

class AcfData extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            allFleet: [], // 机型
            fleetTailMap: {}, // 机尾号map
            allBranch: [], // 公司
            subPerformanceTypeMap: {}, // 性能子机型map
            subPerformanceList: [],
            fleetTailList: [], // 机尾号
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
            { title: "编号", dataIndex: "index" },
            { title: "机型", dataIndex: "acftType" },
            { title: "性能子机型", dataIndex: "subPerformanceType" },
            { title: "机尾号", dataIndex: "tailNr" },
            { title: "发动机型号", dataIndex: "engineType" },
            { title: "MSN", dataIndex: "msn" },
            { title: "所属公司", dataIndex: "branchCd" },
            { title: "更新人", dataIndex: "operUser" },
            { title: "更新时间", dataIndex: "updateTime" },
            { title: "操作", key: "action", render: (text) => <a onClick={() => this.detail(text)}>查看</a> },
        ];
        this.searchForm;
        this.addModal;
        this.addForm;
        this.modal;
        this.form;
        this.tableCustom;
    }

    componentDidMount() {
        this.getAllFleet();
        this.getFleetTailMap();
        this.getAllBranch();
        this.getSubPerformanceTypeMap();
        this.getList();
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        };
    }

    getAllFleet() {
        post({
            url: "acfData/queryAllFleet",
            success: data => {
                this.setState({
                    allFleet: data.map(item => { return { key: item.value, text: item.text } })
                });
            }
        });
    }

    getFleetTailMap() {
        post({
            url: "acfData/queryFleetTailMap",
            success: data => {
                this.setState({
                    fleetTailMap: data
                });
            }
        });
    }

    getAllBranch() {
        post({
            url: "acfData/getAllBranch",
            success: data => {
                this.setState({ allBranch: data });
            }
        });
    }

    getSubPerformanceTypeMap() {
        post({
            url: "acfData/querySubPerformanceType",
            success: data => {
                this.setState({
                    subPerformanceTypeMap: data
                });
            }
        });
    }

    getList = (obj = {}) => {
        const table = this.state.table;
        table.setPage(obj);
        let params = table.getParmaData();
        post({
            url: "acfData/queryAcfList",
            data: params,
            success: data => {
                if (data && data.rows) {
                    var dataList = data.rows.map((item, i) => {
                        item.index = (params.pageNum - 1) * params.pageSize + i + 1;
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

    getSearchFormValue(values) {
        for (var key in values) {
            if (key == "tailFleetSelector") delete values[key];
            if ((key == "branchCds" || key == "tailNrs" || key == "fleetCds") && values[key]) values[key] = values[key].value ? values[key].value : values[key];
            if (key == "tailNr") {
                values.tailNrs = values[key];
                delete values[key];
            }
        }
        values = handleInParams(values);
        return values;
    }

    search = () => {
        this.searchForm.validateFields((err, values) => {
            if (!err) {
                values = this.getSearchFormValue(values);
                this.getList({ params: values, pageNum: 1 });
            }
        });
    }

    reset = () => {
        this.searchForm.resetFields();
        this.search();
    }

    add = (callback) => {
        callback();
        this.addModal.show();
    }

    addSubmit = () => {
        this.setState({ modalOkBtnLoading: true });
        this.addForm.validateFields((err, values) => {
            if (err) {
                this.setState({ modalOkBtnLoading: false });
            } else {
                values = handleInParams(values);
                post({
                    url: "acfData/addAcfBasic",
                    data: values,
                    btn: () => this.setState({ modalOkBtnLoading: false }),
                    success: data => {
                        message.success("添加用户成功！");
                        this.addModal.hide();
                        this.getList({ pageNum: 1 });
                    }
                });
            }
        });
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
                currentAction: "edit",
                currentData: this.state.selectedRows[0]
            });
            this.modal.show();
        }
    }

    detail = (text) => {
        if (this.state.authorityDetail) {
            this.setState({
                currentAction: "detail",
                currentData: text
            });
            this.modal.show();
        } else {
            message.info("无权限查看");
        }
    }

    submit = () => {
        this.setState({ modalOkBtnLoading: true });
        this.form.validateFields((err, values) => {
            if (err) {
                this.setState({ modalOkBtnLoading: false });
            } else {
                values = handleInParams(values);
                values.aircraftsStr = JSON.stringify(this.tableCustom.state.dataSource);
                post({
                    url: "acfData/saveAcfDetail",
                    data: values,
                    btn: () => this.setState({ modalOkBtnLoading: false }),
                    success: data => {
                        message.success("修改成功");
                        this.modal.hide();
                        this.getList({ pageNum: 1 });
                    }
                });
            }
        });
    }

    del = (callback) => {
        if (this.state.selectedRows.length == 0) {
            callback();
            message.warning("请至少选择一行数据");
        } else {
            var list = this.state.selectedRows.map(item => item.tailNr);
            confirm({
                title: "确认删除【" + list.join("、") + "】吗?",
                okType: 'danger',
                onOk: () => {
                    post({
                        url: "acfData/deleteAcf",
                        data: { tailNrs: list },
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

    getSearchFormOptions() {
        var { allFleet, fleetTailMap, allBranch } = this.state;
        var allBranchList = allBranch.map(item => {
            return { key: item.branchCd, text: item.branchCd }
        });
        return [
            {
                type: "Radio",
                name: "tailFleetSelector",
                list: [
                    { text: "按机尾号", key: "tail" },
                    { text: "按机型", key: "fleet" }
                ],
                span: 6,
                options: {
                    initialValue: "tail"
                }
            },
            {
                type: "Input",
                label: "机尾号",
                name: "tailNr",
                span: 6,
                placeholder: "多个用分号隔开",
                hide: () => {
                    return this.searchForm && this.searchForm.getFieldValue("tailFleetSelector") == "fleet" ? true : false;
                }
            },
            {
                type: "MultipleSelect",
                label: "机型",
                name: "fleetCds",
                list: allFleet,
                span: 6,
                isHasAllSelect: false,
                onSelect: (value) => {
                    var fleetTailList = [];
                    value.forEach(item => {
                        fleetTailList = fleetTailList.concat(
                            fleetTailMap[item].map(key => {
                                return { key: key, text: key }
                            })
                        );
                    });
                    this.setState({ fleetTailList });
                },
                hide: () => {
                    return this.searchForm && this.searchForm.getFieldValue("tailFleetSelector") == "tail" ? true : false;
                }
            },
            {
                type: "MultipleSelect",
                label: "机尾号",
                name: "tailNrs",
                list: this.state.fleetTailList,
                span: 6,
                hide: () => {
                    return this.searchForm && this.searchForm.getFieldValue("tailFleetSelector") == "tail" ? true : false;
                }
            },
            {
                type: "MultipleSelect",
                label: "所属公司",
                name: "branchCds",
                list: allBranchList,
                span: 6,
                className: "clearBoth"
            },
            {
                type: "Input",
                label: "MSN",
                name: "msn",
                span: 6,
            }
        ];
    }

    getAddFormOptions() {
        const { fleetTailMap, subPerformanceTypeMap, allBranch } = this.state;
        var acftTypeList = [];
        for (var key in fleetTailMap) {
            acftTypeList.push(key);
        }
        var allBranchList = allBranch.map(item => {
            return { key: item.branchCd, text: item.branchCd }
        });
        return [
            {
                type: "Input",
                label: "机尾号",
                name: "tailNr",
                span: 22,
                options: {
                    rules: [
                        { required: true, message: "机尾号不可为空！" },
                        {
                            validator: (rule, value, callback) => {
                                if (value && (value == "B" || value.trim() == "B" || value.trim() == "" || value.length > 12)) {
                                    callback('请输入正确的机尾号！')
                                }
                                callback();
                            }
                        }
                    ]
                }
            },
            {
                type: "Select",
                label: "机型",
                name: "acftType",
                span: 22,
                list: acftTypeList,
                isHasAllSelect: false,
                onSelect: (value) => {
                    this.addForm.setFieldsValue({ subPerformance: null });
                    var subPerformanceList = subPerformanceTypeMap[value];
                    this.setState({ subPerformanceList });
                },
            },
            {
                type: "Select",
                label: "性能子机型",
                name: "subPerformance",
                span: 22,
                list: this.state.subPerformanceList,
                isHasAllSelect: false
            },
            {
                type: "Input",
                label: "发动机",
                name: "engineType",
                span: 22,
                placeholder: "长度不能超过50",
                options: {
                    rules: [
                        { max: 50, message: "engineType的长度不能大于50" }
                    ]
                }
            },
            {
                type: "Input",
                label: "MSN",
                name: "msn",
                span: 22,
                placeholder: "长度不能超过50",
                options: {
                    rules: [
                        { max: 50, message: "msn的长度不能大于50" }
                    ]
                }
            },
            {
                type: "Select",
                label: "所属公司",
                name: "branchCd",
                span: 22,
                list: allBranchList,
                isHasAllSelect: false
            },
        ];
    }

    /**
     * 获取form表的配置
     */
    getFormOptions() {
        var datas = this.state.currentData;
        const { fleetTailMap, allBranch } = this.state;
        var acftTypeList = [];
        for (var key in fleetTailMap) {
            acftTypeList.push(key);
        }
        var allBranchList = allBranch.map(item => {
            return { key: item.branchCd, text: item.branchCd }
        });
        var arr = [
            {
                type: "Input",
                label: "机尾号",
                name: "tailNr",
                span: 4,
                length: 3,
                disabled: true,
                options: {
                    initialValue: datas.tailNr
                }
            },
            {
                type: "Input",
                label: "发动机",
                name: "engineType",
                span: 4,
                length: 3,
                placeholder: "长度不能超过50",
                tooltip: "长度不能超过50",
                options: {
                    initialValue: datas.engineType,
                    rules: [{ max: 50, message: "engineType的长度不能大于50" }]
                }
            },
            {
                type: "Select",
                label: "机型",
                name: "acftType",
                span: 4,
                length: 2,
                list: acftTypeList,
                isHasAllSelect: false,
                options: {
                    initialValue: datas.acftType
                }
            },
            {
                type: "Input",
                label: "性能子机型",
                name: "subPerformanceType",
                span: 4,
                length: 5,
                disabled: true,
                tooltip: datas.subPerformanceType,
                options: {
                    initialValue: datas.subPerformanceType
                }
            },
            {
                type: "Input",
                label: "MSN",
                name: "msn",
                span: 4,
                length: 3,
                placeholder: "长度不能超过50",
                options: {
                    initialValue: datas.msn,
                    rules: [{ max: 50, message: "msn的长度不能大于50" }]
                }
            },
            {
                type: "Select",
                label: "所属公司",
                name: "branchCd",
                span: 4,
                length: 4,
                list: allBranchList,
                isHasAllSelect: false,
                options: {
                    initialValue: datas.branchCd
                }
            },
        ];
        if (this.state.currentAction == "detail") {
            arr = arr.map(item => {
                item.disabled = true;
                return item;
            });
        }
        return arr;
    }

    render() {
        const { currentAction, table, modalOkBtnLoading, btns, currentData, selectedRowKeys, authorityList } = this.state;
        // 查询form
        const searchFormOptions = this.getSearchFormOptions();
        const btnOptions = {
            aligin: "left",
            span: 6,
            list: [
                { text: "查询", options: "queryOpt", event: this.search },
                { text: "重置", options: "resetOpt", event: this.reset }
            ]
        };
        // 增删改
        const commonBtnOptions = {
            shape: "round",
            size: "small"
        };
        // 列表表格参数
        const tableOptions = {
            key: "tailNr",
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
                title: "新增飞机数据",
                okButtonProps: { loading: modalOkBtnLoading }
            },
            onRef: (ref) => { this.addModal = ref },
            ok: this.addSubmit.bind(this)
        }
        const addFormOptions = this.getAddFormOptions();
        // 模态框
        var title = currentAction == "edit" ? "编辑飞机详情" : "查看飞机详情";
        const modalOptions = {
            options: {
                title: title,
                width: "1000px",
                okButtonProps: { loading: modalOkBtnLoading }
            },
            onRef: (ref) => { this.modal = ref },
            ok: this.submit.bind(this)
        }
        if (currentAction == "detail") modalOptions.options.footer = null;
        const formOptions = this.getFormOptions();
        return (
            <CardCommon>
                { authorityList && <CommonForm options={searchFormOptions} btnOptions={btnOptions} wrappedComponentRef={(form) => { if (form && form.props && form.props.form) this.searchForm = form.props.form; }} />}
                <div className="buttons"><CommonBtns options={commonBtnOptions} btns={btns} /></div>
                { authorityList && <CommonTable options={tableOptions} onChecked={this.onChecked} />}
                { !authorityList && <div className="no-authority-box">无权限查看</div>}
                <CommonModal {...addModalOptions}>
                    <div className="form-grid-6">
                        <CommonForm options={addFormOptions} wrappedComponentRef={(form) => { if (form && form.props && form.props.form) this.addForm = form.props.form; }} />
                    </div>
                </CommonModal>
                <CommonModal {...modalOptions}>
                    <div>
                        <CommonForm options={formOptions} wrappedComponentRef={(form) => { if (form && form.props && form.props.form) this.form = form.props.form; }} />
                        <TableCustom datas={currentData} currentAction={currentAction} onRef={ref => this.tableCustom = ref} />
                    </div>
                </CommonModal>
            </CardCommon>
        );
    }
}

class TableCustom extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            types: [],
            depts: [],
            subDepts: [],
            deptMap: {},
            edit: false,
            selected: {},
            selectedKey: "",
            loading: true
        };
        this.searchForm;
    }

    componentDidMount() {
        if (this.props.onRef) this.props.onRef(this);
        this.getTypes();
        this.getDepts();
        this.getSubDepts();
        this.getDeptMap();
        this.getList();
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        };
    }

    getColumns() {
        var arr = [
            { title: "编号", dataIndex: "index", width: 50 },
            { title: "类别", dataIndex: "colType", width: 100 },
            { title: "数据项目", dataIndex: "colChnName", width: 200 },
            { title: "具体数据信息", dataIndex: "colValue", width: 100, render: (text, record) => this.getDom("colValue", text, record) },
            { title: "数据说明", dataIndex: "sourceCd", width: 100 },
            { title: "备注", dataIndex: "remark", width: 100, render: (text, record) => this.getDom("remark", text, record) },
            { title: "维护部门", dataIndex: "deptName", width: 100 }
        ];
        return arr;
    }

    getDom(key, text, record) {
        if (this.props.currentAction == "detail") return <div>{text}</div>;
        return this.state.edit && record.aircraftColsId == this.state.selected.aircraftColsId && key == this.state.selectedKey ? <Input defaultValue={text} onBlur={(e) => this.editTable(key, record, false, e)} autoComplete="off" /> : <div style={{ minHeight: "22px" }} onClick={this.editTable.bind(this, key, record, true)}>{text}</div>;
    }

    editTable(key, record, flag, e) {
        this.setState({ edit: flag, selected: record, selectedKey: key });
        if (!flag) {
            var dataSource = this.state.dataSource.map(item => {
                if (item.aircraftColsId == record.aircraftColsId) item[key] = e.target.value;
                return item;
            });
            this.setState({ dataSource });
        }
    }

    getTypes() {
        post({
            url: "acfData/queryAllDataTypes",
            success: data => {
                this.setState({
                    types: data.map(item => {
                        return { key: item.value, text: item.text }
                    })
                });
            }
        });
    }

    getDepts() {
        post({
            url: "acfData/queryAllDepts",
            success: data => {
                this.setState({
                    depts: data.map(item => {
                        return { key: item.value, text: item.text }
                    })
                });
            }
        });
    }

    getSubDepts() {
        post({
            url: "acfData/queryAllSubDepts",
            success: data => {
                this.setState({
                    subDepts: data.map(item => {
                        return { key: item.value, text: item.text }
                    })
                });
            }
        });
    }

    getDeptMap() {
        post({
            url: "acfData/queryDeptMap",
            success: data => {
                this.setState({
                    deptMap: data
                });
            }
        });
    }

    getList = (params = {}) => {
        params.tailNr = this.props.datas.tailNr;
        post({
            url: "acfData/queryAcfDetail",
            data: params,
            success: data => {
                if (data && data.rows) {
                    var dataSource = data.rows.map((item, i) => {
                        item.index = i + 1;
                        return item;
                    });
                    this.setState({ dataSource, loading: false });
                }
            }
        });
    }

    search = () => {
        this.searchForm.validateFields((err, values) => {
            if (!err) {
                var params = {};
                for (var key in values) {
                    if (values[key]) {
                        if (key == "dataType" || key == "dept1" || key == "dept") params[key] = values[key].value ? values[key].value : values[key];
                    }
                }
                if (values.deptTypeSelector == "dept" && (!params.dept1 || (params.dept1 && params.dept1.length == 0))) {
                    message.warning("请选择一级部门！");
                    return;
                }
                if (values.deptTypeSelector == "dept" && (!params.dept || (params.dept && params.dept.length == 0))) {
                    message.warning("请选择二级部门！");
                    return;
                }
                if (params.dept && params.dept.indexOf("全部") > -1) {
                    if (params.dept1 && params.dept1.indexOf("全部") > -1) {
                        params = {};
                    } else {
                        params.dept = params.dept1;
                    }
                }
                if (params.dept1) delete params.dept1;
                this.getList(params);
            }
        });
    }

    searchDeptChange = value => {
        const deptMap = this.state.deptMap;
        var arr = [];
        value.forEach(item => {
            if (deptMap[item]) {
                arr = arr.concat(
                    deptMap[item].map(key => {
                        return { key: key, text: key }
                    })
                );
            }
        });
        this.setState({ subDepts: arr });
    }

    getSearchFormOptions() {
        const { types, depts, subDepts } = this.state;
        return [
            {
                type: "Radio",
                name: "deptTypeSelector",
                list: [
                    { text: "按部门筛选", key: "dept" },
                    { text: "按类别筛选", key: "info-type" }
                ],
                span: 7,
                options: {
                    initialValue: "info-type"
                }
            },
            {
                type: "MultipleSelect",
                label: "一级部门",
                name: "dept1",
                list: depts,
                span: 6,
                length: 4,
                onSelect: this.searchDeptChange,
                onDeselect: this.searchDeptChange,
                hide: () => {
                    return this.searchForm && this.searchForm.getFieldValue("deptTypeSelector") == "info-type" ? true : false;
                },
                options: {
                    initialValue: depts.map(item => item.key)
                }
            },
            {
                type: "MultipleSelect",
                label: "二级部门",
                name: "dept",
                list: subDepts,
                span: 6,
                length: 4,
                hide: () => {
                    return this.searchForm && this.searchForm.getFieldValue("deptTypeSelector") == "info-type" ? true : false;
                },
                options: {
                    initialValue: subDepts.map(item => item.key)
                }
            },
            {
                type: "MultipleSelect",
                label: "数据类别",
                name: "dataType",
                list: types,
                span: 6,
                length: 4,
                hide: () => {
                    return this.searchForm && this.searchForm.getFieldValue("deptTypeSelector") == "dept" ? true : false;
                }
            },
        ];
    }

    render() {
        // 查询form
        const searchFormOptions = this.getSearchFormOptions();
        const btnOptions = {
            aligin: "left",
            span: 5,
            list: [{ text: "查询", options: "queryOpt", event: this.search }]
        };
        // 列表表格参数
        const tableOptions = {
            notCheck: true,
            columns: this.getColumns(),
            table: { dataList: this.state.dataSource, loading: this.state.loading },
            scroll: {
                x: "750px",
                y: "300px"
            },
            needPage: false
        }
        return (
            <React.Fragment>
                <CommonForm options={searchFormOptions} btnOptions={btnOptions} wrappedComponentRef={(form) => { if (form && form.props && form.props.form) this.searchForm = form.props.form; }} />
                <CommonTable options={tableOptions} />
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
)(withRouter(AcfData));