import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import { Modal, message } from 'antd';
import { CardCommon, CommonTable, CommonForm, CommonBtns, CommonModal } from "common/component";
import { handleInParams, downloadFile, onSelect, onSelectAll, isAuthority } from "common/commonFn";
import { post } from 'common/http';
import PageModel from 'model/pageModel';
const { confirm } = Modal;

const ADD = "rwyRule.add"; // 新增
const EDIT = "rwyRule.edit"; // 修改
const DEL = "rwyRule.del"; // 删除
const LIST = "rwyRule.list"; // 查询
const EXPORT = "rwyRule.export"; // 导出

class RwyRule extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            table: new PageModel(),
            selectedRowKeys: [],
            selectedRows: [],
            selectedExport: [], // 标记导出的
            btns: [
                { name: "新增", id: ADD, icon: "plus-circle", onClick: this.add },
                { name: "修改", id: EDIT, icon: "edit", onClick: this.edit },
                { name: "删除", id: DEL, icon: "minus-circle", onClick: this.del },
                { name: "导出", id: EXPORT, icon: "export", onClick: this.export },
                { name: "导出全部", id: EXPORT, icon: "export", onClick: this.exportAll }
            ].filter(item => isAuthority(item.id, props.authority)),
            authorityList: isAuthority(LIST, props.authority),
            modalOkBtnLoading: false,
            currentAction: "",
            currentData: {},
            performanceType: [],
            performanceTypeMap: {},
            subPerformanceType: []
        };
        this.columns = [
            { title: "序号", dataIndex: "index", width: 50 },
            { title: "机场", dataIndex: "icaoCode", width: 100 },
            { title: "性能机型", dataIndex: "performanceType", width: 100 },
            { title: "性能子机型", dataIndex: "subPerformanceType", width: 100 },
            { title: "起飞常用跑道", dataIndex: "takeoffCommonUseRwy", width: 120, isTooltip: true },
            { title: "原因备注", dataIndex: "takeoffCommonUseRwyRemark", width: 120, isTooltip: true },
            { title: "起飞不可用跑道", dataIndex: "takeoffUnuseRwy", width: 120, isTooltip: true },
            { title: "原因备注", dataIndex: "takeoffUnuseRwyRemark", width: 120, isTooltip: true },
            { title: "落地常用跑道", dataIndex: "landCommonUseRwy", width: 120, isTooltip: true },
            { title: "原因备注", dataIndex: "landCommonUseRwyRemark", width: 120, isTooltip: true },
            { title: "落地不可用跑道", dataIndex: "landUnuseRwy", width: 120, isTooltip: true },
            { title: "原因备注", dataIndex: "landUnuseRwyRemark", width: 120, isTooltip: true },
            { title: "更新人", dataIndex: "updateUser", width: 100 },
            { title: "更新时间", dataIndex: "updateTime", width: 150 }
        ];
        this.modal;
        this.form;
    }

    componentDidMount() {
        this.getParmaList("acfData/getAllPerformanceType", data => {
            this.setState({ performanceType: data.map(item => item.performanceType) })
        });
        this.getParmaList("acfData/queryPerformanceType", data => this.setState({ performanceTypeMap: data }));
        this.getList();
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        };
    }

    getParmaList(url, callback) {
        post({
            url: url,
            success: data => {
                callback && typeof callback == "function" && callback(data);
            }
        });
    }

    getList = (obj = {}) => {
        const table = this.state.table;
        table.setPage(obj);
        let params = table.getParmaData();
        post({
            url: "rwyRule/queryRwyRuleListByParam",
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
            var datas = this.state.selectedRows[0];
            this.setState({
                currentAction: "edit",
                currentData: datas
            });
            if (datas.performanceType) {
                for (var key in this.state.performanceTypeMap) {
                    if (key == datas.performanceType) {
                        this.setState({ subPerformanceType: this.state.performanceTypeMap[key] });
                    }
                }
            }
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
                    if (key == "subPerformanceType") {
                        if (values[key].value) values[key] = values[key].value;
                        var index = values[key].indexOf("全部");
                        if (index > -1) {
                            values[key].splice(index, 1);
                        }
                    }
                }
                var url, msg;
                if (this.state.currentAction == "add") {
                    url = "rwyRule/insert";
                    msg = "添加成功";
                } else {
                    values.id = this.state.currentData.id;
                    url = "rwyRule/update";
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
            confirm({
                title: "确认删除选项吗?",
                okType: 'danger',
                onOk: () => {
                    post({
                        url: "rwyRule/delete",
                        data: { ids: list },
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

    export = (callback) => {
        if (this.state.selectedExport.length == 0) {
            callback();
            message.warning("未选中选项");
        } else {
            var list = this.state.selectedExport.map(item => item.id);
            confirm({
                title: "确定导出选中的跑道规则吗？",
                onOk() {
                    post({
                        url: "rwyRule/export",
                        data: { ids: list },
                        btn: callback,
                        success: data => {
                            downloadFile(data, "跑道规则表");
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
            title: "确定导出全部跑道规则吗？",
            onOk() {
                var params = handleInParams(This.searcForm.getFieldsValue());
                post({
                    url: "rwyRule/export",
                    data: params,
                    btn: callback,
                    success: data => {
                        downloadFile(data, "跑道规则表");
                    }
                });
            },
            onCancel: callback
        });
    }

    getSearchFormOptions() {
        const { performanceType } = this.state;
        return [
            {
                type: "Input",
                label: "机场",
                name: "icaoCode",
                span: 6,
                length: 2,
                placeholder: "四字码，如：ZWAT",
                options: {
                    rules: [
                        { pattern: /^[A-Z]{4}$/, message: "请输入正确的四字码！" }
                    ]
                }
            },
            {
                type: "Select",
                label: "机型",
                name: "performanceType",
                list: performanceType,
                span: 6,
                length: 2
            }
        ];
    }

    /**
     * 获取form表的配置
     */
    getFormOptions() {
        const { currentAction, currentData, performanceType, performanceTypeMap, subPerformanceType } = this.state;
        var datas = currentAction == "add" ? {} : currentData;
        var subPerformanceTypeValue = [];
        if (datas.subPerformanceType) {
            subPerformanceTypeValue = datas.subPerformanceType.split(",");
        }
        return [
            {
                type: "Input",
                label: "机场",
                name: "icaoCode",
                span: 24,
                placeholder: "四字码，如：ZWAT",
                options: {
                    initialValue: datas.icaoCode,
                    rules: [
                        { required: true, message: "机场不可为空！" },
                        { pattern: /^[A-Z]{4}$/, message: "请输入正确的四字码！" }
                    ]
                }
            },
            {
                type: "Select",
                label: "性能机型",
                name: "performanceType",
                list: performanceType,
                span: 24,
                isHasAllSelect: false,
                onSelect: (value) => {
                    for (var key in performanceTypeMap) {
                        if (key == value) this.setState({ subPerformanceType: performanceTypeMap[key] });
                    }
                },
                options: {
                    initialValue: datas.performanceType,
                    rules: [
                        { required: true, message: "性能机型不可为空！" }
                    ]
                }
            },
            {
                type: "MultipleSelect",
                label: "性能子机型",
                name: "subPerformanceType",
                list: subPerformanceType,
                span: 24,
                options: {
                    initialValue: subPerformanceTypeValue,
                    rules: [
                        { required: true, message: "性能子机型不可为空！" },
                        {
                            validator: (rule, value, callback) => {
                                if (value && value.value && value.value.length == 0) {
                                    callback('性能子机型不可为空！')
                                }
                                callback();
                            }
                        }
                    ]
                }
            },
            {
                type: "Input",
                label: "起飞常用跑道",
                name: "takeoffCommonUseRwy",
                span: 24,
                placeholder: "多条跑道请用英文分号隔开",
                options: {
                    initialValue: datas.takeoffCommonUseRwy
                }
            },
            {
                type: "Input",
                label: "原因备注",
                name: "takeoffCommonUseRwyRemark",
                span: 24,
                options: {
                    initialValue: datas.takeoffCommonUseRwyRemark
                }
            },
            {
                type: "Input",
                label: "起飞不可用跑道",
                name: "takeoffUnuseRwy",
                span: 24,
                placeholder: "多条跑道请用英文分号隔开",
                options: {
                    initialValue: datas.takeoffUnuseRwy
                }
            },
            {
                type: "Input",
                label: "原因备注",
                name: "takeoffUnuseRwyRemark",
                span: 24,
                options: {
                    initialValue: datas.takeoffUnuseRwyRemark
                }
            },
            {
                type: "Input",
                label: "落地常用跑道",
                name: "landCommonUseRwy",
                span: 24,
                placeholder: "多条跑道请用英文分号隔开",
                options: {
                    initialValue: datas.landCommonUseRwy
                }
            },
            {
                type: "Input",
                label: "原因备注",
                name: "landCommonUseRwyRemark",
                span: 24,
                options: {
                    initialValue: datas.landCommonUseRwyRemark
                }
            },
            {
                type: "Input",
                label: "落地不可用跑道",
                name: "landUnuseRwy",
                span: 24,
                placeholder: "多条跑道请用英文分号隔开",
                options: {
                    initialValue: datas.landUnuseRwy
                }
            },
            {
                type: "Input",
                label: "原因备注",
                name: "landUnuseRwyRemark",
                span: 24,
                options: {
                    initialValue: datas.landUnuseRwyRemark
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
            columns: this.columns,
            table: table,
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
            },
            onChange: this.getList
        }
        const pagingOptions = {
            pageNum: table.pageNum,
            pageSize: table.pageSize,
            total: table.total,
            onChange: this.getList,
        }
        // add、edit模态框
        var title = currentAction == "add" ? "新增" : currentAction == "edit" ? "修改" : "";
        const modalOptions = {
            options: {
                title: title,
                bodyStyle: {
                    height: "400px",
                    overflowY: "auto"
                },
                okButtonProps: { loading: modalOkBtnLoading }
            },
            onRef: (ref) => { this.modal = ref },
            ok: this.submit.bind(this)
        }
        const formOptions = this.getFormOptions();
        return (
            <CardCommon>
                { authorityList && <CommonForm options={searchFormOptions} btnOptions={btnOptions} wrappedComponentRef={(form) => { if (form && form.props && form.props.form) this.searcForm = form.props.form; }} />}
                <div className="buttons"><CommonBtns options={commonBtnOptions} btns={this.state.btns} /></div>
                { authorityList && <CommonTable options={tableOptions} onChecked={this.onChecked}></CommonTable>}
                { !authorityList && <div className="no-authority-box">无权限查看</div>}
                <CommonModal {...modalOptions}>
                    <div className="form-grid-7" style={{ paddingLeft: "30px", paddingRight: "60px" }}><CommonForm options={formOptions} wrappedComponentRef={(form) => { if (form && form.props && form.props.form) this.form = form.props.form; }} /></div>
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
)(withRouter(RwyRule));