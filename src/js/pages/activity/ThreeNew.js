import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import { Tabs, Modal, message, Button, Upload, Icon } from 'antd';
import moment from 'moment';
import { CardCommon, CommonTable, CommonForm, CommonBtns, CommonModal, getUploadProps } from "common/component";
import { handleInParams, downloadFile, onSelect, onSelectAll, isAuthority } from "common/commonFn";
import { post } from 'common/http';
import PageModel from 'model/pageModel';
const { confirm } = Modal;
const { TabPane } = Tabs;

// 新机型老航线
const ADD1 = "airLineAcftType.add"; // 新增
const EDIT1 = "airLineAcftType.edit"; // 修改
const DEL1 = "airLineAcftType.del"; // 删除
const LIST1 = "airLineAcftType.list"; // 查询
const UPLOAD1 = "airLineAcftType.upload"; // 导入
const EXPORT1 = "airLineAcftType.export"; // 导出

// 新开航机场
const ADD2 = "newAirport.add"; // 新增
const EDIT2 = "newAirport.edit"; // 修改
const DEL2 = "newAirport.del"; // 删除
const LIST2 = "newAirport.list"; // 查询
const EXPORT2 = "newAirport.export"; // 导出

// 新开航线
const ADD3 = "newAirLine.add"; // 新增
const EDIT3 = "newAirLine.edit"; // 修改
const DEL3 = "newAirLine.del"; // 删除
const LIST3 = "newAirLine.list"; // 查询
const UPLOAD3 = "newAirLine.upload"; // 导入
const EXPORT3 = "newAirLine.export"; // 导出

// 新引进机型
const ADD4 = "newAcftType.add"; // 新增
const EDIT4 = "newAcftType.edit"; // 修改
const DEL4 = "newAcftType.del"; // 删除
const LIST4 = "newAcftType.list"; // 查询
const EXPORT4 = "newAcftType.export"; // 导出

class ThreeNew extends React.Component {

    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        const { authority } = this.props;
        return (
            <CardCommon>
                <Tabs>
                    <TabPane tab="新机型老航线" key="1"><AirLineAcftType authority={authority} /></TabPane>
                    <TabPane tab="新开航机场" key="2"><NewAirport authority={authority} /></TabPane>
                    <TabPane tab="新开航线" key="3"><NewAirLine authority={authority} /></TabPane>
                    <TabPane tab="新引进机型" key="4"><NewAcftType authority={authority} /></TabPane>
                </Tabs>
            </CardCommon>
        );
    }
}

class AirLineAcftType extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            table: new PageModel(),
            selectedRowKeys: [],
            selectedRows: [],
            selectedExport: [], // 标记导出的
            btns: [
                { name: "新增", id: ADD1, icon: "plus-circle", onClick: this.add },
                { name: "修改", id: EDIT1, icon: "edit", onClick: this.edit },
                { name: "删除", id: DEL1, icon: "minus-circle", onClick: this.del },
                { name: "导出", id: EXPORT1, icon: "export", onClick: this.export },
                { name: "导出全部", id: EXPORT1, icon: "export", onClick: this.exportAll }
            ].filter(item => isAuthority(item.id, props.authority)),
            authorityList: isAuthority(LIST1, props.authority),
            authorityUpload: isAuthority(UPLOAD1, props.authority),
            modalOkBtnLoading: false,
            currentAction: "",
            currentData: {},
            fleetTailMap: {},
            allBranch: []
        };
        this.columns = [
            { title: "序号", dataIndex: "index", width: 50 },
            { title: "航线", dataIndex: "airLineDesc", width: 150 },
            { title: "航线代码", dataIndex: "airLineCode", width: 150 },
            { title: "机型", dataIndex: "acftType", width: 100, isTooltip: true },
            { title: "执行", dataIndex: "executeBase", width: 100 },
            { title: "备注", dataIndex: "remark", width: 120, isTooltip: true },
            { title: "生效时间", dataIndex: "effFrom", width: 120 },
            { title: "失效时间", dataIndex: "effTill", width: 120 },
            { title: "更新时间", dataIndex: "updateTime", width: 150 },
            { title: "更新人", dataIndex: "updateUser", width: 100 }
        ];
        this.modal;
        this.form;
    }

    componentDidMount() {
        this.getFleetTailMap();
        this.getAllBranch();
        this.getList();
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        };
    }

    getFleetTailMap() {
        post({
            url: "acfData/queryFleetTailMap",
            success: data => {
                this.setState({ fleetTailMap: data });
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

    getList = (obj = {}) => {
        const table = this.state.table;
        table.setPage(obj);
        let params = table.getParmaData();
        post({
            url: "airLineAcftType/queryAirLineAcftTypeListByParam",
            data: params,
            success: data => {
                if (data && data.rows) {
                    var dataList = data.rows.map((item, i) => {
                        item.index = (params.pageNum - 1) * params.pageSize + i + 1;
                        return item;
                    });
                    table.setPage({ dataList, total: data.total, pageNum: params.pageNum, pageSize: params.pageSize });
                    this.setState({ table, selectedRowKeys: [], selectedRows: [], currentAction: "add" });
                }
            }
        });
    }

    onChecked = (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys, selectedRows });
    }

    search = () => {
        this.searcForm.validateFields((err, values) => {
            if (!err) {
                values = handleInParams(values);
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
                currentAction: "edit",
                currentData: this.state.selectedRows[0]
            });
            this.modal.show();
        }
    }

    submit = () => {
        this.form.validateFields((err, values) => {
            if (err) {
                this.setState({ modalOkBtnLoading: false });
            } else {
                this.setState({ modalOkBtnLoading: true });
                values = handleInParams(values);
                for (var key in values) {
                    if (key == "acftType" || key == "executeBase") {
                        if (values[key].value) values[key] = values[key].value;
                        var index = values[key].indexOf("全部");
                        if (index > -1) values[key].splice(index, 1);
                    }
                    // if (key == "effFrom" || key == "effTill") values[key] = moment(values[key]).format("YYYY-MM-DD");
                }
                if (values.effecTime) {
                    values.effFrom = moment(values.effecTime[0]).format('YYYY-MM-DD HH:mm:ss')
                    values.effTill = moment(values.effecTime[1]).format('YYYY-MM-DD HH:mm:ss')
                }
                delete values.effecTime
                var url, msg;
                if (this.state.currentAction == "add") {
                    url = "airLineAcftType/insert";
                    msg = "添加成功";
                } else {
                    values.id = this.state.currentData.id;
                    url = "airLineAcftType/update";
                    msg = "修改成功";
                }
                post({
                    url: url,
                    data: values,
                    btn: () => this.setState({ modalOkBtnLoading: false }),
                    success: data => {
                        message.success(msg);
                        this.modal.hide();
                        this.getList({ pageNum: 1 });
                        this.setState({ selectedRowKeys: [], selectedRows: [], selectedExport: [] });
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
            var list = this.state.selectedRows.map(item => item.id);
            var name = this.state.selectedRows.map(item => item.airLineDesc);
            confirm({
                title: "确认删除" + name.join("、") + "航线吗?",
                okType: 'danger',
                onOk: () => {
                    post({
                        url: "airLineAcftType/delete",
                        data: { ids: list },
                        btn: callback,
                        success: data => {
                            message.success("删除成功");
                            this.getList({ pageNum: 1 });
                            this.setState({ selectedRowKeys: [], selectedRows: [], selectedExport: [] });
                        }
                    });
                },
                onCancel: callback
            });
        }
    }

    export = (callback) => {
        if (this.state.selectedExport.length == 0) {
            callback();
            message.warning("未选中选项");
        } else {
            var list = this.state.selectedExport.map(item => item.id);
            var name = this.state.selectedExport.map(item => item.airLineDesc);
            confirm({
                title: "确定导出" + name.join("、") + "的航线吗？",
                onOk() {
                    post({
                        url: "airLineAcftType/export",
                        data: { ids: list },
                        btn: callback,
                        success: data => {
                            downloadFile(data, "新机型老航线表");
                        }
                    });
                },
                onCancel: callback
            });
        }
    }

    exportAll = (callback) => {
        const This = this;
        confirm({
            title: "确定导出全部航线吗？",
            onOk() {
                var params = handleInParams(This.searcForm.getFieldsValue());
                post({
                    url: "airLineAcftType/export",
                    data: params,
                    btn: callback,
                    success: data => {
                        downloadFile(data, "新机型老航线表");
                    }
                });
            },
            onCancel: callback
        });
    }

    getSearchFormOptions() {
        return [
            {
                type: "Input",
                label: "关键字搜索",
                name: "airLineAcftTypeQuery",
                span: 9,
                length: 5,
                placeholder: "请输入航线、航线代码、机型、执行、备注搜索"
            },
        ];
    }

    /**
     * 获取form表的配置
     */
    getFormOptions() {
        const { currentAction, currentData, fleetTailMap, allBranch } = this.state;
        var fleet = [];
        for (var key in fleetTailMap) {
            fleet.push(key);
        }
        var branch = allBranch.map(item => item.chnDescShort);
        var datas = currentAction == "add" ? {} : JSON.parse(JSON.stringify(currentData));
        for (var key in datas) {
            if ((key == "acftType" || key == "executeBase") && datas[key] && typeof datas[key] == "string") datas[key] = datas[key].split(",");
            if (key == "effFrom" || key == "effTill") {
                datas[key] = datas[key] ? moment(datas[key]) : null;
            }
        }
        return [
            {
                type: "Input",
                label: "航线",
                name: "airLineDesc",
                span: 24,
                placeholder: "例：广州-伦敦",
                options: {
                    initialValue: datas.airLineDesc,
                    rules: [
                        { required: true, message: "航线不可为空" },
                        { pattern: /^[\u4e00-\u9fa5-]*$/, message: '请输入正确中文航线' }
                    ]
                }
            },
            {
                type: "Input",
                label: "航线代码",
                name: "airLineCode",
                span: 24,
                placeholder: "例：CAN-LHR",
                options: {
                    initialValue: datas.airLineCode,
                    rules: [
                        { required: true, message: "航线代码不可为空" },
                        { pattern: /^[A-Z-]*$/, message: '请输入正确的航线代码' }
                    ],
                }
            },
            {
                type: "MultipleSelect",
                label: "机型",
                name: "acftType",
                list: fleet,
                span: 24,
                options: {
                    initialValue: datas.acftType,
                    rules: [
                        { required: true, message: "机型不可为空" },
                        {
                            validator: (rule, value, callback) => {
                                if (value && value.value && value.value.length == 0) {
                                    callback('机型不可为空')
                                }
                                callback();
                            }
                        }
                    ]
                }
            },
            {
                type: "MultipleSelect",
                label: "执行",
                name: "executeBase",
                list: branch,
                span: 24,
                options: {
                    initialValue: datas.executeBase,
                    rules: [
                        { required: true, message: "执行不可为空" },
                        {
                            validator: (rule, value, callback) => {
                                if (value && value.value && value.value.length == 0) {
                                    callback('执行不可为空')
                                }
                                callback();
                            }
                        }
                    ]
                }
            },
            {
                type: "Input",
                label: "备注",
                name: "remark",
                span: 24,
                options: {
                    initialValue: datas.remark
                }
            },
            // {
            //     type: "DatePicker",
            //     label: "生效时间",
            //     name: "effFrom",
            //     span: 24,
            //     options: {
            //         initialValue: datas.effFrom,
            //         rules: [
            //             { required: true, message: "生效时间不可为空" },
            //             {
            //                 validator: (rule, value, callback) => {
            //                     console.log(moment(value).valueOf())
            //                     this.setState({ effFromTime: moment(value).valueOf() })
            //                     console.log(this.state.effFromTime)
            //                     if (value && value.value && value.value.length == 0) {
            //                         callback('生效时间不可为空')
            //                     }
            //                     callback()
            //                 }
            //             }
            //         ]
            //     }
            // },
            // {
            //     type: "DatePicker",
            //     label: "失效时间",
            //     name: "effTill",
            //     span: 24,
            //     options: {
            //         initialValue: datas.effTill,
            //         rules: [
            //             { required: true, message: "失效时间不可为空" },
            //             {
            //                 validator: (rule, value, callback) => {
            //                     console.log(moment(value).valueOf())
            //                     if (value && value.value && value.value.length == 0) {
            //                         callback('生效时间不可为空')
            //                     }
            //                     callback()
            //                 }
            //             }
            //         ]
            //     }
            // },
            {
                type: "TimeRangePicker",
                label: "有效时间",
                name: "effecTime",
                span: 24,
                length: 5,
                options: {
                    initialValue: [moment('00:00:00', 'HH:mm:ss'), moment('11:59:59', 'HH:mm:ss')],
                    rules: [{ required: true, message: "时间不可为空！" }],
                }
            },
        ];
    }

    render() {
        const { table, modalOkBtnLoading, currentAction, selectedRowKeys, authorityList, authorityUpload } = this.state;
        // 查询form
        const searchFormOptions = this.getSearchFormOptions();
        const btnOptions = {
            aligin: "left",
            span: 6,
            list: [
                { text: "查询", options: "queryOpt", event: this.search }
            ]
        };
        // 增删改
        const commonBtnOptions = {
            shape: "round",
            size: "small"
        };
        // 列表表格参数
        const tableOptions = {
            table,
            onChange: this.getList,
            columns: this.columns,
            scroll: {
                x: "max-content"
            },
            rowSelection: {
                selectedRowKeys,
                onChange: (selectedRowKeys, selectedRows) => { // 选中项发生变化时的回调
                    this.onChecked(selectedRowKeys, selectedRows);
                },
                onSelect: onSelect.bind(this),
                onSelectAll: onSelectAll.bind(this)
            }
        }
        // add、edit模态框
        var title = currentAction == "add" ? "新增" : currentAction == "edit" ? "修改" : "";
        const modalOptions = {
            options: {
                title: title,
                width: "690px",
                okButtonProps: { loading: modalOkBtnLoading }
            },
            onRef: (ref) => { this.modal = ref },
            ok: this.submit.bind(this)
        }
        const formOptions = this.getFormOptions();
        // 导入
        const props = getUploadProps("airLineAcftType/importExcel", () => {
            this.getList({ pageNum: 1 });
        });
        return (
            <div className="card" style={{ margin: 0, padding: 0 }}>
                { authorityList && <CommonForm options={searchFormOptions} btnOptions={btnOptions} wrappedComponentRef={(form) => { if (form && form.props && form.props.form) this.searcForm = form.props.form; }} />}
                <div className="buttons">
                    <CommonBtns options={commonBtnOptions} btns={this.state.btns} />
                    {authorityUpload &&
                        <Upload {...props}>
                            <Button shape="round" size="small"><Icon type="upload" />导入</Button>
                        </Upload>
                    }
                </div>
                { authorityList && <CommonTable options={tableOptions} onChecked={this.onChecked}></CommonTable>}
                { !authorityList && <div className="no-authority-box">无权限查看</div>}
                <CommonModal {...modalOptions}>
                    <div className="form-grid-5" style={{ paddingLeft: "70px", paddingRight: "100px" }}><CommonForm options={formOptions} wrappedComponentRef={(form) => { if (form && form.props && form.props.form) this.form = form.props.form; }} /></div>
                </CommonModal>
            </div>
        );
    }
}

class NewAirport extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            table: new PageModel(),
            selectedRowKeys: [],
            selectedRows: [],
            selectedExport: [], // 标记导出的
            btns: [
                { name: "新增", id: ADD2, icon: "plus-circle", onClick: this.add },
                { name: "修改", id: EDIT2, icon: "edit", onClick: this.edit },
                { name: "删除", id: DEL2, icon: "minus-circle", onClick: this.del },
                { name: "导出", id: EXPORT2, icon: "export", onClick: this.export },
                { name: "导出全部", id: EXPORT2, icon: "export", onClick: this.exportAll }
            ].filter(item => isAuthority(item.id, props.authority)),
            authorityList: isAuthority(LIST2, props.authority),
            modalOkBtnLoading: false,
            currentAction: "",
            currentData: {},
        };
        this.columns = [
            { title: "序号", dataIndex: "index", width: 50 },
            { title: "新开航机场", dataIndex: "icaoCode", width: 150 },
            { title: "备注", dataIndex: "remark", width: 120, isTooltip: true },
            { title: "生效时间", dataIndex: "effFrom", width: 120 },
            { title: "失效时间", dataIndex: "effTill", width: 120 },
            { title: "更新时间", dataIndex: "updateTime", width: 150 },
            { title: "更新人", dataIndex: "updateUser", width: 100 }
        ];
        this.modal;
        this.form;
    }

    componentDidMount() {
        this.getList();
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        };
    }

    getList = (obj = {}) => {
        const table = this.state.table;
        table.setPage(obj);
        let params = table.getParmaData();
        post({
            url: "newAirport/queryNewAirportListByParam",
            data: params,
            success: data => {
                if (data && data.rows) {
                    var dataList = data.rows.map((item, i) => {
                        item.index = (params.pageNum - 1) * params.pageSize + i + 1;
                        return item;
                    });
                    table.setPage({ dataList, total: data.total, pageNum: params.pageNum, pageSize: params.pageSize });
                    this.setState({ table, selectedRowKeys: [], selectedRows: [], currentAction: "add" });
                }
            }
        });
    }

    onChecked = (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys, selectedRows });
    }

    search = () => {
        this.searcForm.validateFields((err, values) => {
            if (!err) {
                values = handleInParams(values);
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
                currentAction: "edit",
                currentData: this.state.selectedRows[0]
            });
            this.modal.show();
        }
    }

    submit = () => {
        this.setState({ modalOkBtnLoading: true });
        this.form.validateFields((err, values) => {
            if (err) {
                this.setState({ modalOkBtnLoading: false });
            } else {
                values = handleInParams(values);
                // for (var key in values) {
                //     if (key == "effFrom" || key == "effTill") values[key] = moment(values[key]).format("YYYY-MM-DD");
                // }
                debugger
                if (values.effecTime) {
                    values.effFrom = moment(values.effecTime[0]).format('YYYY-MM-DD HH:mm:ss')
                    values.effTill = moment(values.effecTime[1]).format('YYYY-MM-DD HH:mm:ss')
                }
                delete values.effecTime
                var url, msg;
                if (this.state.currentAction == "add") {
                    url = "newAirport/insert";
                    msg = "添加成功";
                } else {
                    values.id = this.state.currentData.id;
                    url = "newAirport/update";
                    msg = "修改成功";
                }
                post({
                    url: url,
                    data: values,
                    btn: () => this.setState({ modalOkBtnLoading: false }),
                    success: data => {
                        message.success(msg);
                        this.modal.hide();
                        this.getList({ pageNum: 1 });
                        this.setState({ selectedRowKeys: [], selectedRows: [], selectedExport: [] });
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
            var list = this.state.selectedRows.map(item => item.id);
            var name = this.state.selectedRows.map(item => item.icaoCode);
            confirm({
                title: "确认删除" + name.join("、") + "吗?",
                okType: 'danger',
                onOk: () => {
                    post({
                        url: "newAirport/delete",
                        data: { ids: list },
                        btn: callback,
                        success: data => {
                            message.success("删除成功");
                            this.getList({ pageNum: 1 });
                            this.setState({ selectedRowKeys: [], selectedRows: [], selectedExport: [] });
                        }
                    });
                },
                onCancel: callback
            });
        }
    }

    export = (callback) => {
        if (this.state.selectedExport.length == 0) {
            callback();
            message.warning("未选中选项");
        } else {
            var list = this.state.selectedExport.map(item => item.id);
            var name = this.state.selectedExport.map(item => item.icaoCode);
            confirm({
                title: "确定导出" + name.join("、") + "的新开航机场吗？",
                onOk() {
                    post({
                        url: "newAirport/export",
                        data: { ids: list },
                        btn: callback,
                        success: data => {
                            downloadFile(data, "新开航机场表");
                        }
                    });
                },
                onCancel: callback
            });
        }
    }

    exportAll = (callback) => {
        const This = this;
        confirm({
            title: "确定导出全部新开航机场吗？",
            onOk() {
                var params = handleInParams(This.searcForm.getFieldsValue());
                post({
                    url: "newAirport/export",
                    data: params,
                    btn: callback,
                    success: data => {
                        downloadFile(data, "新开航机场表");
                    }
                });
            },
            onCancel: callback
        });
    }

    getSearchFormOptions() {
        return [
            {
                type: "Input",
                label: "关键字搜索",
                name: "newAirportQuery",
                span: 8,
                length: 5,
                placeholder: "请输入新开航机场、备注搜索"
            },
        ];
    }

    /**
     * 获取form表的配置
     */
    getFormOptions() {
        const { currentAction, currentData } = this.state;
        var datas = currentAction == "add" ? {} : JSON.parse(JSON.stringify(currentData));
        for (var key in datas) {
            if (key == "effFrom" || key == "effTill") datas[key] = datas[key] ? moment(datas[key]) : null;
        }
        return [
            {
                type: "Input",
                label: "新开航机场",
                name: "icaoCode",
                span: 24,
                placeholder: '四位大写字母',
                options: {
                    initialValue: datas.icaoCode,
                    rules: [
                        { required: true, message: "新开航机场不可为空" },
                        { pattern: /^[A-Z-]{4}$/, message: '请输入正确的航线代码' }
                    ]
                }
            },
            {
                type: "Input",
                label: "备注",
                name: "remark",
                span: 24,
                options: {
                    initialValue: datas.remark
                }
            },
            // {
            //     type: "DatePicker",
            //     label: "生效时间",
            //     name: "effFrom",
            //     span: 24,
            //     options: {
            //         initialValue: datas.effFrom,
            //         rules: [{ required: true, message: "生效时间不可为空" }]
            //     }
            // },
            // {
            //     type: "DatePicker",
            //     label: "失效时间",
            //     name: "effTill",
            //     span: 24,
            //     options: {
            //         initialValue: datas.effTill,
            //         rules: [{ required: true, message: "失效时间不可为空" }]
            //     }
            // },
            {
                type: "TimeRangePicker",
                label: "有效时间",
                name: "effecTime",
                span: 24,
                length: 5,
                options: {
                    initialValue: [moment('00:00:00', 'HH:mm:ss'), moment('11:59:59', 'HH:mm:ss')],
                    rules: [{ required: true, message: "时间不可为空！" }],
                }
            },
        ];
    }

    render() {
        const { table, modalOkBtnLoading, currentAction, selectedRowKeys, authorityList } = this.state;
        // 查询form
        const searchFormOptions = this.getSearchFormOptions();
        const btnOptions = {
            aligin: "left",
            span: 6,
            list: [
                { text: "查询", options: "queryOpt", event: this.search }
            ]
        };
        // 增删改
        const commonBtnOptions = {
            shape: "round",
            size: "small"
        };
        // 列表表格参数
        const tableOptions = {
            table,
            onChange: this.getList,
            columns: this.columns,
            scroll: {
                x: "max-content"
            },
            rowSelection: {
                selectedRowKeys,
                onChange: (selectedRowKeys, selectedRows) => { // 选中项发生变化时的回调
                    this.onChecked(selectedRowKeys, selectedRows);
                },
                onSelect: onSelect.bind(this),
                onSelectAll: onSelectAll.bind(this)
            }
        }
        // add、edit模态框
        var title = currentAction == "add" ? "新增" : currentAction == "edit" ? "修改" : "";
        const modalOptions = {
            options: {
                title: title,
                width: "705px",
                okButtonProps: { loading: modalOkBtnLoading }
            },
            onRef: (ref) => { this.modal = ref },
            ok: this.submit.bind(this)
        }
        const formOptions = this.getFormOptions();
        return (
            <div className="card" style={{ margin: 0, padding: 0 }}>
                { authorityList && <CommonForm options={searchFormOptions} btnOptions={btnOptions} wrappedComponentRef={(form) => { if (form && form.props && form.props.form) this.searcForm = form.props.form; }} />}
                <div className="buttons"><CommonBtns options={commonBtnOptions} btns={this.state.btns} /></div>
                { authorityList && <CommonTable options={tableOptions} onChecked={this.onChecked}></CommonTable>}
                { !authorityList && <div className="no-authority-box">无权限查看</div>}
                <CommonModal {...modalOptions}>
                    <div className="form-grid-6" style={{ paddingLeft: "70px", paddingRight: "100px" }}><CommonForm options={formOptions} wrappedComponentRef={(form) => { if (form && form.props && form.props.form) this.form = form.props.form; }} /></div>
                </CommonModal>
            </div>
        );
    }
}

class NewAirLine extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            table: new PageModel(),
            selectedRowKeys: [],
            selectedRows: [],
            selectedExport: [], // 标记导出的
            btns: [
                { name: "新增", id: ADD3, icon: "plus-circle", onClick: this.add },
                { name: "修改", id: EDIT3, icon: "edit", onClick: this.edit },
                { name: "删除", id: DEL3, icon: "minus-circle", onClick: this.del },
                { name: "导出", id: EXPORT3, icon: "export", onClick: this.export },
                { name: "导出全部", id: EXPORT3, icon: "export", onClick: this.exportAll }
            ].filter(item => isAuthority(item.id, props.authority)),
            authorityList: isAuthority(LIST3, props.authority),
            authorityUpload: isAuthority(UPLOAD3, props.authority),
            modalOkBtnLoading: false,
            currentAction: "",
            currentData: {},
            fleetTailMap: {},
            allBranch: []
        };
        this.columns = [
            { title: "序号", dataIndex: "index", width: 50 },
            { title: "航线变化", dataIndex: "airLineChange", width: 150, isTooltip: true },
            { title: "航线", dataIndex: "airLineDesc", width: 150 },
            { title: "航线代码", dataIndex: "airLineCode", width: 150 },
            { title: "机型", dataIndex: "acftType", width: 100 },
            { title: "执行", dataIndex: "executeBase", width: 100 },
            { title: "备注", dataIndex: "remark", width: 120, isTooltip: true },
            { title: "预计开航时间", dataIndex: "expectStart", width: 120 },
            { title: "生效时间", dataIndex: "effFrom", width: 120 },
            { title: "失效时间", dataIndex: "effTill", width: 120 },
            { title: "更新时间", dataIndex: "updateTime", width: 150 },
            { title: "更新人", dataIndex: "updateUser", width: 100 }
        ];
        this.modal;
        this.form;
    }

    componentDidMount() {
        this.getFleetTailMap();
        this.getAllBranch();
        this.getList();
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        };
    }

    getFleetTailMap() {
        post({
            url: "acfData/queryFleetTailMap",
            success: data => {
                this.setState({ fleetTailMap: data });
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

    getList = (obj = {}) => {
        const table = this.state.table;
        table.setPage(obj);
        let params = table.getParmaData();
        post({
            url: "newAirLine/queryNewAirLineListByParam",
            data: params,
            success: data => {
                if (data && data.rows) {
                    var dataList = data.rows.map((item, i) => {
                        item.index = (params.pageNum - 1) * params.pageSize + i + 1;
                        return item;
                    });
                    table.setPage({ dataList, total: data.total, pageNum: params.pageNum, pageSize: params.pageSize });
                    this.setState({ table, selectedRowKeys: [], selectedRows: [], currentAction: "add" });
                }
            }
        });
    }

    onChecked = (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys, selectedRows });
    }

    search = () => {
        this.searcForm.validateFields((err, values) => {
            if (!err) {
                values = handleInParams(values);
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
                currentAction: "edit",
                currentData: this.state.selectedRows[0]
            });
            this.modal.show();
        }
    }

    submit = () => {
        this.setState({ modalOkBtnLoading: true });
        this.form.validateFields((err, values) => {
            if (err) {
                this.setState({ modalOkBtnLoading: false });
            } else {
                values = handleInParams(values);
                for (var key in values) {
                    if (key == "acftType" || key == "executeBase") {
                        if (values[key].value) values[key] = values[key].value;
                        var index = values[key].indexOf("全部");
                        if (index > -1) values[key].splice(index, 1);
                    }
                    if (key == "expectStart") values[key] = moment(values[key]).format("YYYY-MM-DD");
                }
                if (values.effecTime) {
                    values.effFrom = moment(values.effecTime[0]).format('YYYY-MM-DD HH:mm:ss')
                    values.effTill = moment(values.effecTime[1]).format('YYYY-MM-DD HH:mm:ss')
                }
                delete values.effecTime
                var url, msg;
                if (this.state.currentAction == "add") {
                    url = "newAirLine/insert";
                    msg = "添加成功";
                } else {
                    values.id = this.state.currentData.id;
                    url = "newAirLine/update";
                    msg = "修改成功";
                }
                post({
                    url: url,
                    data: values,
                    btn: () => this.setState({ modalOkBtnLoading: false }),
                    success: data => {
                        message.success(msg);
                        this.modal.hide();
                        this.getList({ pageNum: 1 });
                        this.setState({ selectedRowKeys: [], selectedRows: [], selectedExport: [] });
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
            var list = this.state.selectedRows.map(item => item.id);
            var name = this.state.selectedRows.map(item => item.airLineDesc);
            confirm({
                title: "确认删除" + name.join("、") + "航线吗?",
                okType: 'danger',
                onOk: () => {
                    post({
                        url: "newAirLine/delete",
                        data: { ids: list },
                        btn: callback,
                        success: data => {
                            message.success("删除成功");
                            this.getList({ pageNum: 1 });
                            this.setState({ selectedRowKeys: [], selectedRows: [], selectedExport: [] });
                        }
                    });
                },
                onCancel: callback
            });
        }
    }

    export = (callback) => {
        if (this.state.selectedExport.length == 0) {
            callback();
            message.warning("未选中选项");
        } else {
            var list = this.state.selectedExport.map(item => item.id);
            var name = this.state.selectedExport.map(item => item.airLineDesc);
            confirm({
                title: "确定导出" + name.join("、") + "的新开航航线吗？",
                onOk() {
                    post({
                        url: "newAirLine/export",
                        data: { ids: list },
                        btn: callback,
                        success: data => {
                            downloadFile(data, "新开航线表");
                        }
                    });
                },
                onCancel: callback
            });
        }
    }

    exportAll = (callback) => {
        const This = this;
        confirm({
            title: "确定导出全部新开航航线吗？",
            onOk() {
                var params = handleInParams(This.searcForm.getFieldsValue());
                post({
                    url: "newAirLine/export",
                    data: params,
                    btn: callback,
                    success: data => {
                        downloadFile(data, "新开航线表");
                    }
                });
            },
            onCancel: callback
        });
    }

    getSearchFormOptions() {
        return [
            {
                type: "Input",
                label: "关键字搜索",
                name: "newAirLineQuery",
                span: 12,
                length: 5,
                placeholder: "请输入航线变化、航线、航线代码、机型、执行、备注、预计开航时间搜索"
            },
        ];
    }

    /**
     * 获取form表的配置
     */
    getFormOptions() {
        const { currentAction, currentData, fleetTailMap, allBranch } = this.state;
        var datas = currentAction == "add" ? {} : JSON.parse(JSON.stringify(currentData));;
        for (var key in datas) {
            if ((key == "acftType" || key == "executeBase") && datas[key] && typeof datas[key] == "string") datas[key] = datas[key].split(",");
            if (key == "expectStart" || key == "effFrom" || key == "effTill") datas[key] = datas[key] ? moment(datas[key]) : null;
        }
        var fleet = [];
        for (var key in fleetTailMap) {
            fleet.push(key);
        }
        var branch = allBranch.map(item => item.chnDescShort);
        return [
            {
                type: "Input",
                label: "航线变化",
                name: "airLineChange",
                span: 24,
                options: {
                    initialValue: datas.airLineChange
                }
            },
            {
                type: "Input",
                label: "航线",
                name: "airLineDesc",
                span: 24,
                options: {
                    initialValue: datas.airLineDesc,
                    // rules: [{ required: true, message: "航线不可为空" }]
                    rules: [
                        { required: true, message: "航线不可为空" },
                        { pattern: /^[\u4e00-\u9fa5-]*$/, message: '请输入正确中文航线' }
                    ]
                }
            },
            {
                type: "Input",
                label: "航线代码",
                name: "airLineCode",
                span: 24,
                options: {
                    initialValue: datas.airLineCode,
                    // rules: [{ required: true, message: "航线代码不可为空" }]
                    rules: [
                        { required: true, message: "航线代码不可为空" },
                        { pattern: /^[A-Z-]*$/, message: '请输入正确的航线代码' }
                    ],
                }
            },
            {
                type: "MultipleSelect",
                label: "机型",
                name: "acftType",
                list: fleet,
                span: 24,
                options: {
                    initialValue: datas.acftType,
                    rules: [
                        { required: true, message: "机型不可为空" },
                        {
                            validator: (rule, value, callback) => {
                                if (value && value.value && value.value.length == 0) {
                                    callback('机型不可为空')
                                }
                                callback();
                            }
                        }
                    ]
                }
            },
            {
                type: "MultipleSelect",
                label: "执行",
                name: "executeBase",
                list: branch,
                span: 24,
                options: {
                    initialValue: datas.executeBase,
                    rules: [
                        { required: true, message: "执行不可为空" },
                        {
                            validator: (rule, value, callback) => {
                                if (value && value.value && value.value.length == 0) {
                                    callback('执行不可为空')
                                }
                                callback();
                            }
                        }
                    ]
                }
            },
            {
                type: "Input",
                label: "备注",
                name: "remark",
                span: 24,
                options: {
                    initialValue: datas.remark
                }
            },
            {
                type: "DatePicker",
                label: "预计开航时间",
                name: "expectStart",
                span: 24,
                options: {
                    initialValue: datas.expectStart
                }
            },
            // {
            //     type: "DatePicker",
            //     label: "生效时间",
            //     name: "effFrom",
            //     span: 24,
            //     options: {
            //         initialValue: datas.effFrom,
            //         rules: [{ required: true, message: "生效时间不可为空" }]
            //     }
            // },
            // {
            //     type: "DatePicker",
            //     label: "失效时间",
            //     name: "effTill",
            //     span: 24,
            //     options: {
            //         initialValue: datas.effTill,
            //         rules: [{ required: true, message: "失效时间不可为空" }]
            //     }
            // },
            {
                type: "TimeRangePicker",
                label: "有效时间",
                name: "effecTime",
                span: 24,
                length: 5,
                options: {
                    initialValue: [moment('00:00:00', 'HH:mm:ss'), moment('11:59:59', 'HH:mm:ss')],
                    rules: [{ required: true, message: "时间不可为空！" }],
                }
            }
        ];
    }

    render() {
        const { table, modalOkBtnLoading, currentAction, selectedRowKeys, authorityList, authorityUpload } = this.state;
        // 查询form
        const searchFormOptions = this.getSearchFormOptions();
        const btnOptions = {
            aligin: "left",
            span: 6,
            list: [
                { text: "查询", options: "queryOpt", event: this.search }
            ]
        };
        // 增删改
        const commonBtnOptions = {
            shape: "round",
            size: "small"
        };
        // 列表表格参数
        const tableOptions = {
            table,
            onChange: this.getList,
            columns: this.columns,
            scroll: {
                x: "max-content"
            },
            rowSelection: {
                selectedRowKeys,
                onChange: (selectedRowKeys, selectedRows) => { // 选中项发生变化时的回调
                    this.onChecked(selectedRowKeys, selectedRows);
                },
                onSelect: onSelect.bind(this),
                onSelectAll: onSelectAll.bind(this)
            }
        }
        // add、edit模态框
        var title = currentAction == "add" ? "新增" : currentAction == "edit" ? "修改" : "";
        const modalOptions = {
            options: {
                title: title,
                width: "705px",
                okButtonProps: { loading: modalOkBtnLoading }
            },
            onRef: (ref) => { this.modal = ref },
            ok: this.submit.bind(this)
        }
        const formOptions = this.getFormOptions();
        // 导入
        const props = getUploadProps("newAirLine/importExcel", () => {
            this.getList({ pageNum: 1 });
        });
        return (
            <div className="card" style={{ margin: 0, padding: 0 }}>
                { authorityList && <CommonForm options={searchFormOptions} btnOptions={btnOptions} wrappedComponentRef={(form) => { if (form && form.props && form.props.form) this.searcForm = form.props.form; }} />}
                <div className="buttons">
                    <CommonBtns options={commonBtnOptions} btns={this.state.btns} />
                    {
                        authorityUpload &&
                        <Upload {...props}>
                            <Button shape="round" size="small"><Icon type="upload" />导入</Button>
                        </Upload>
                    }
                </div>
                { authorityList && <CommonTable options={tableOptions} onChecked={this.onChecked}></CommonTable>}
                <CommonModal {...modalOptions}>
                    <div className="form-grid-6" style={{ paddingLeft: "70px", paddingRight: "100px" }}><CommonForm options={formOptions} wrappedComponentRef={(form) => { if (form && form.props && form.props.form) this.form = form.props.form; }} /></div>
                </CommonModal>
            </div>
        );
    }
}

class NewAcftType extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            table: new PageModel(),
            selectedRowKeys: [],
            selectedRows: [],
            selectedExport: [], // 标记导出的
            btns: [
                { name: "新增", id: ADD4, icon: "plus-circle", onClick: this.add },
                { name: "修改", id: EDIT4, icon: "edit", onClick: this.edit },
                { name: "删除", id: DEL4, icon: "minus-circle", onClick: this.del },
                { name: "导出", id: EXPORT4, icon: "export", onClick: this.export },
                { name: "导出全部", id: EXPORT4, icon: "export", onClick: this.exportAll }
            ].filter(item => isAuthority(item.id, props.authority)),
            authorityList: isAuthority(LIST4, props.authority),
            modalOkBtnLoading: false,
            currentAction: "",
            currentData: {},
            comboTree: []
        };
        this.columns = [
            { title: "序号", dataIndex: "index", width: 50 },
            { title: "动态机型", dataIndex: "acftType", width: 100 },
            { title: "备注", dataIndex: "remark", width: 120, isTooltip: true },
            { title: "生效时间", dataIndex: "effFrom", width: 120 },
            { title: "失效时间", dataIndex: "effTill", width: 120 },
            { title: "更新时间", dataIndex: "updateTime", width: 150 },
            { title: "更新人", dataIndex: "updateUser", width: 100 }
        ];
        this.modal;
        this.form;
    }

    componentDidMount() {
        this.getComboTree();
        this.getList();
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        };
    }

    handleComboTree(arr) {
        for (var i = 0; i < arr.length; i++) {
            arr[i].title = arr[i].text;
            arr[i].value = arr[i].id;
            arr[i].key = arr[i].id;
            if (arr[i].children) {
                arr[i].children = this.handleComboTree(arr[i].children);
            }
        }
        return arr;
    }

    getComboTree() {
        post({
            url: "newAcftType/comboTree",
            success: data => {
                if (data) {
                    var arr = this.handleComboTree(JSON.parse(data));
                    this.setState({ comboTree: arr });
                }
            }
        });
    }

    getList = (obj = {}) => {
        const table = this.state.table;
        table.setPage(obj);
        let params = table.getParmaData();
        post({
            url: "newAcftType/queryNewAcftTypeListByParam",
            data: params,
            success: data => {
                if (data && data.rows) {
                    var dataList = data.rows.map((item, i) => {
                        item.index = (params.pageNum - 1) * params.pageSize + i + 1;
                        return item;
                    });
                    table.setPage({ dataList, total: data.total, pageNum: params.pageNum, pageSize: params.pageSize });
                    this.setState({ table, selectedRowKeys: [], selectedRows: [], currentAction: "add" });
                }
            }
        });
    }

    onChecked = (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys, selectedRows });
    }

    search = () => {
        this.searcForm.validateFields((err, values) => {
            if (!err) {
                values = handleInParams(values);
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
                currentAction: "edit",
                currentData: this.state.selectedRows[0]
            });
            this.modal.show();
        }
    }

    getIdByText(text) {
        var result = "";
        var recursion = (tree, text) => {
            if (!tree || !tree.length) return;
            for (let i = 0; i < tree.length; i++) {
                const childs = tree[i].children;
                if (tree[i].text === text) result = tree[i].id;
                if (childs && childs.length > 0) {
                    recursion(childs, text);
                }
            }
            return result;
        }
        recursion(this.state.comboTree, text);
        return result;
    }

    getTextById(id) {
        var result = "";
        var recursion = (tree, id) => {
            if (!tree || !tree.length) return;
            for (let i = 0; i < tree.length; i++) {
                const childs = tree[i].children;
                if (tree[i].id === id) result = tree[i].text;
                if (childs && childs.length > 0) {
                    recursion(childs, id);
                }
            }
            return result;
        }
        recursion(this.state.comboTree, id);
        return result;
    }

    submit = () => {
        this.setState({ modalOkBtnLoading: true });
        this.form.validateFields((err, values) => {
            if (err) {
                this.setState({ modalOkBtnLoading: false });
            } else {
                values = handleInParams(values);
                for (var key in values) {
                    if (key == "acftType") values[key] = this.getTextById(values[key]);
                    // if (key == "effFrom" || key == "effTill") values[key] = moment(values[key]).format("YYYY-MM-DD");
                }
                if (values.effecTime) {
                    values.effFrom = moment(values.effecTime[0]).format('YYYY-MM-DD HH:mm:ss')
                    values.effTill = moment(values.effecTime[1]).format('YYYY-MM-DD HH:mm:ss')
                }
                delete values.effecTime
                var url, msg;
                if (this.state.currentAction == "add") {
                    url = "newAcftType/insert";
                    msg = "添加成功";
                } else {
                    values.id = this.state.currentData.id;
                    url = "newAcftType/update";
                    msg = "修改成功";
                }
                post({
                    url: url,
                    data: values,
                    btn: () => this.setState({ modalOkBtnLoading: false }),
                    success: data => {
                        message.success(msg);
                        this.modal.hide();
                        this.getList({ pageNum: 1 });
                        this.setState({ selectedRowKeys: [], selectedRows: [], selectedExport: [] });
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
            var list = this.state.selectedRows.map(item => item.id);
            var name = this.state.selectedRows.map(item => item.acftType);
            confirm({
                title: "确认删除" + name.join("、") + "吗?",
                okType: 'danger',
                onOk: () => {
                    post({
                        url: "newAcftType/delete",
                        data: { ids: list },
                        btn: callback,
                        success: data => {
                            message.success("删除成功");
                            this.getList({ pageNum: 1 });
                            this.setState({ selectedRowKeys: [], selectedRows: [], selectedExport: [] });
                        }
                    });
                },
                onCancel: callback
            });
        }
    }

    export = (callback) => {
        if (this.state.selectedExport.length == 0) {
            callback();
            message.warning("未选中选项");
        } else {
            var list = this.state.selectedExport.map(item => item.id);
            var name = this.state.selectedExport.map(item => item.acftType);
            confirm({
                title: "确定导出" + name.join("、") + "的新引进机型吗？",
                onOk() {
                    post({
                        url: "newAcftType/export",
                        data: { ids: list },
                        btn: callback,
                        success: data => {
                            downloadFile(data, "新引进机型表");
                        }
                    });
                },
                onCancel: callback
            });
        }
    }

    exportAll = (callback) => {
        const This = this;
        confirm({
            title: "确定导出全部新引进机型吗？",
            onOk() {
                var params = handleInParams(This.searcForm.getFieldsValue());
                post({
                    url: "newAcftType/export",
                    data: params,
                    btn: callback,
                    success: data => {
                        downloadFile(data, "新引进机型表");
                    }
                });
            },
            onCancel: callback
        });
    }

    getSearchFormOptions() {
        return [
            {
                type: "Input",
                label: "关键字搜索",
                name: "newAcftTypeQuery",
                span: 6,
                length: 5,
                placeholder: "请输入动态机型、备注搜索"
            },
        ];
    }

    /**
     * 获取form表的配置
     */
    getFormOptions() {
        const { currentAction, currentData, comboTree } = this.state;
        var datas = currentAction == "add" ? {} : JSON.parse(JSON.stringify(currentData));;
        for (var key in datas) {
            if (key == "effFrom" || key == "effTill") datas[key] = datas[key] ? moment(datas[key]) : datas[key];
        }
        var acftType = this.getIdByText(datas.acftType);
        return [
            {
                type: "TreeSelect",
                label: "动态机型",
                name: "acftType",
                list: comboTree,
                span: 24,
                options: {
                    initialValue: acftType,
                    rules: [{ required: true, message: "动态机型不可为空" }]
                }
            },
            {
                type: "Input",
                label: "备注",
                name: "remark",
                span: 24,
                options: {
                    initialValue: datas.remark
                }
            },
            // {
            //     type: "DatePicker",
            //     label: "生效时间",
            //     name: "effFrom",
            //     span: 24,
            //     options: {
            //         initialValue: datas.effFrom,
            //         rules: [{ required: true, message: "生效时间不可为空" }]
            //     }
            // },
            // {
            //     type: "DatePicker",
            //     label: "失效时间",
            //     name: "effTill",
            //     span: 24,
            //     options: {
            //         initialValue: datas.effTill,
            //         rules: [{ required: true, message: "失效时间不可为空" }]
            //     }
            // },
            {
                type: "TimeRangePicker",
                label: "有效时间",
                name: "effecTime",
                span: 24,
                length: 5,
                options: {
                    initialValue: [moment('00:00:00', 'HH:mm:ss'), moment('11:59:59', 'HH:mm:ss')],
                    rules: [{ required: true, message: "时间不可为空！" }],
                }
            }
        ];
    }

    render() {
        const { table, modalOkBtnLoading, currentAction, selectedRowKeys, authorityList } = this.state;
        // 查询form
        const searchFormOptions = this.getSearchFormOptions();
        const btnOptions = {
            aligin: "left",
            span: 6,
            list: [
                { text: "查询", options: "queryOpt", event: this.search }
            ]
        };
        // 增删改
        const commonBtnOptions = {
            shape: "round",
            size: "small"
        };
        // 列表表格参数
        const tableOptions = {
            table,
            onChange: this.getList,
            columns: this.columns,
            scroll: {
                x: "max-content"
            },
            rowSelection: {
                selectedRowKeys,
                onChange: (selectedRowKeys, selectedRows) => { // 选中项发生变化时的回调
                    this.onChecked(selectedRowKeys, selectedRows);
                },
                onSelect: onSelect.bind(this),
                onSelectAll: onSelectAll.bind(this)
            }
        }
        // add、edit模态框
        var title = currentAction == "add" ? "新增" : currentAction == "edit" ? "修改" : "";
        const modalOptions = {
            options: {
                title: title,
                width: '690px',
                okButtonProps: { loading: modalOkBtnLoading }
            },
            onRef: (ref) => { this.modal = ref },
            ok: this.submit.bind(this)
        }
        const formOptions = this.getFormOptions();
        return (
            <div className="card" style={{ margin: 0, padding: 0 }}>
                { authorityList && <CommonForm options={searchFormOptions} btnOptions={btnOptions} wrappedComponentRef={(form) => { if (form && form.props && form.props.form) this.searcForm = form.props.form; }} />}
                <div className="buttons"><CommonBtns options={commonBtnOptions} btns={this.state.btns} /></div>
                { authorityList && <CommonTable options={tableOptions} onChecked={this.onChecked}></CommonTable>}
                { !authorityList && <div className="no-authority-box">无权限查看</div>}
                <CommonModal {...modalOptions}>
                    <div className="form-grid-5" style={{ paddingLeft: "70px", paddingRight: "100px" }}><CommonForm options={formOptions} wrappedComponentRef={(form) => { if (form && form.props && form.props.form) this.form = form.props.form; }} /></div>
                </CommonModal>
            </div>
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
)(withRouter(ThreeNew));