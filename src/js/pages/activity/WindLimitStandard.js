import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import { Modal, message } from 'antd';
import { CardCommon, CommonTable, CommonForm, CommonBtns, CommonModal } from "common/component";
import { handleInParams, downloadFile, onSelect, onSelectAll, isAuthority } from "common/commonFn";
import { post } from 'common/http';
import PageModel from 'model/pageModel';
const { confirm } = Modal;

const ADD = "windLimitStandard.add"; // 新增
const EDIT = "windLimitStandard.edit"; // 修改
const DEL = "windLimitStandard.del"; // 删除
const LIST = "windLimitStandard.list"; // 查询
const EXPORT = "windLimitStandard.export"; // 查询飞机详情信息

class WindLimitStandard extends React.Component {

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
            eqpCdList: ["B777", "B737", "B747", "A320/A319/A321", "A320(neo)", "A330", "A321(neo)", "B787-8", "B787-9", "A380", "E190"],
            brakeEffectList: ["劣", "差", "中到差", "中", "中到好", "好", "好且干"]
        };
        this.columns = [
            { title: "序号", dataIndex: "index", width: 50 },
            { title: "机型", dataIndex: "eqpCd", width: 150 },
            { title: "阶段类型", dataIndex: "stageType", width: 100 },
            { title: "刹车效应", dataIndex: "brakeEffect", width: 100 },
            { title: "Motne代码", dataIndex: "motneNo", width: 100 },
            { title: "侧风范围最小值", dataIndex: "sideWindMin", width: 120 },
            { title: "侧风范围最大值", dataIndex: "sideWindMax", width: 120 },
            { title: "顺风范围最小值", dataIndex: "tailWindMin", width: 120 },
            { title: "顺风范围最大值", dataIndex: "tailWindMax", width: 120 },
            { title: "顶风范围最小值", dataIndex: "againstWindMin", width: 120 },
            { title: "顶风范围最大值", dataIndex: "againstWindMax", width: 120 },
            { title: "更新人", dataIndex: "updateUser", width: 100 },
            { title: "更新时间", dataIndex: "updateTime", width: 150 }
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
            url: "windLimitStandard/queryByParam",
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
                    url = "windLimitStandard/insert";
                    msg = "添加成功";
                }else{
                    values.id = this.state.currentData.id;
                    url = "windLimitStandard/update";
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
            confirm({
                title: "确认删除选中项目吗?",
                okType: 'danger',
                onOk: () => {
                    post({
                        url: "windLimitStandard/delete",
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

    export = (callback) => {
        if( this.state.selectedExport.length == 0 ){
            callback();
            message.warning("未选中选项");
        }else{
            var list = this.state.selectedExport.map(item => item.id);
            var name = this.state.selectedExport.map(item => item.eqpCd);
            confirm({
                title: "确定导出"+ name.join("、")+"机型风限制标准维护吗？",
                onOk() {
                    post({
                        url: "windLimitStandard/export",
                        data: {ids: list},
                        btn: callback,
                        success: data => {
                            downloadFile(data, "风节点表");
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
            title: "确定导出全部机型风限制标准维护吗？",
            onOk() {
                var params = handleInParams(This.searcForm.getFieldsValue());
                post({
                    url: "windLimitStandard/export",
                    data: params,
                    btn: callback,
                    success: data => {
                        downloadFile(data, "风节点表");
                    }
                });
            },
            onCancel: callback
        });
    }

    getSearchFormOptions(){
        return [
            {
                type: "Select",
                label: "机型",
                name: "eqpCd",
                list: this.state.eqpCdList,
                span: 6,
                length: 2
            },
            {
                type: "Select",
                label: "刹车效应",
                name: "brakeEffect",
                list: this.state.brakeEffectList,
                span: 6,
                length: 4
            }
        ];
    }

    /**
     * 获取form表的配置
     */
    getFormOptions(){
        const { currentAction, currentData, eqpCdList, brakeEffectList } = this.state;
        var datas = currentAction == "add" ? {} : currentData;
        const reg = /^0$|^[1-9]\d*$|^[1-9]\d*.\d{1,2}$|^0.\d{1,2}$/,
        message = "请输入数字，最多保留两位小数；如：0、5、5.1、5.11",
        placeholder = "请输入数字，最多保留两位小数";
        return [
            {
                type: "Select",
                label: "机型",
                name: "eqpCd",
                list: eqpCdList,
                span: 24,
                isHasAllSelect: false,
                options: {
                    initialValue: datas.eqpCd,
                    rules: [{required: true, message: "机型不可为空！"}]
                }
            },
            {
                type: "Select",
                label: "刹车效应",
                name: "brakeEffect",
                list: brakeEffectList,
                span: 24,
                isHasAllSelect: false,
                options: {
                    initialValue: datas.brakeEffect,
                    rules: [{required: true, message: "刹车效应不可为空！"}]
                }
            },
            {
                type: "Select",
                label: "Motne代码",
                name: "motneNo",
                list: ["1", "2", "3", "4", "5", "6", "9"],
                span: 24,
                isHasAllSelect: false,
                options: {
                    initialValue: datas.motneNo,
                    rules: [{required: true, message: "Motne代码不可为空！"}]
                }
            },
            {
                type: "Select",
                label: "阶段类型",
                name: "stageType",
                list: ["人工起飞", "人工着陆", "自动着陆"],
                span: 24,
                isHasAllSelect: false,
                options: {
                    initialValue: datas.stageType,
                    rules: [{required: true, message: "阶段类型不可为空！"}]
                }
            },
            {
                type: "Input",
                label: "侧风范围最小值",
                name: "sideWindMin",
                span: 24,
                placeholder: placeholder,
                options: {
                    initialValue: datas.sideWindMin,
                    rules: [{pattern: reg, message: message}]
                }
            },
            {
                type: "Input",
                label: "侧风范围最大值",
                name: "sideWindMax",
                span: 24,
                placeholder: placeholder,
                options: {
                    initialValue: datas.sideWindMax,
                    rules: [{pattern: reg, message: message}]
                }
            },
            {
                type: "Input",
                label: "顺风范围最小值",
                name: "tailWindMin",
                span: 24,
                placeholder: placeholder,
                options: {
                    initialValue: datas.tailWindMin,
                    rules: [{pattern: reg, message: message}]
                }
            },
            {
                type: "Input",
                label: "顺风范围最大值",
                name: "tailWindMax",
                span: 24,
                placeholder: placeholder,
                options: {
                    initialValue: datas.tailWindMax,
                    rules: [{pattern: reg, message: message}]
                }
            },
            {
                type: "Input",
                label: "顶风范围最小值",
                name: "againstWindMin",
                span: 24,
                placeholder: placeholder,
                options: {
                    initialValue: datas.againstWindMin,
                    rules: [{pattern: reg, message: message}]
                }
            },
            {
                type: "Input",
                label: "顶风范围最大值",
                name: "againstWindMax",
                span: 24,
                placeholder: placeholder,
                options: {
                    initialValue: datas.againstWindMax,
                    rules: [{pattern: reg, message: message}]
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
                { authorityList && <CommonForm options={searchFormOptions} btnOptions={btnOptions} wrappedComponentRef={(form) => { if(form && form.props && form.props.form) this.searcForm = form.props.form;}} />}
                <div className="buttons"><CommonBtns options={commonBtnOptions} btns={this.state.btns} /></div>
                { authorityList && <CommonTable options={tableOptions} onChecked={this.onChecked}></CommonTable> }
                { !authorityList && <div className="no-authority-box">无权限查看</div> }  
                <CommonModal {...modalOptions}>
                    <div className="form-grid-7" style={{paddingLeft: "50px", paddingRight: "70px"}}><CommonForm options={formOptions} wrappedComponentRef={(form) => { if(form && form.props && form.props.form) this.form = form.props.form;}} /></div>
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
)(withRouter(WindLimitStandard));