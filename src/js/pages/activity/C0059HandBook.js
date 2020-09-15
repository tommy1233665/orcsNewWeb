import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import { Modal, message } from 'antd';
import { CardCommon, CommonTable, CommonForm, CommonBtns, CommonModal } from "common/component";
import { handleInParams, isAuthority } from "common/commonFn";
import { post } from 'common/http';
import PageModel from 'model/pageModel';
const { confirm } = Modal;

const ADD = "c0059HandBook.add"; // 新增
const EDIT = "c0059HandBook.edit"; // 修改
const DEL = "c0059HandBook.del"; // 删除
const LIST = "c0059HandBook.list"; // 查询

class C0059HandBook extends React.Component {

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
            authorityList: isAuthority(LIST, props.authority)
        };
        this.columns = [
            { title: "序号", dataIndex: "index", width: 50 },
            { title: "机场名称", dataIndex: "arpName", width: 200 },
            { title: "三字码", dataIndex: "arpCode", width: 70 },
            { title: "四字码", dataIndex: "icaoCode", width: 70 },
            { title: "E190", dataIndex: "e190Value", width: 50 },
            { title: "A319-100", dataIndex: "value100OfA319", width: 90 },
            { title: "A320-200", dataIndex: "value200OfA320", width: 90 },
            { title: "A321-200", dataIndex: "value200OfA321", width: 90 },
            { title: "A330-200", dataIndex: "value200OfA330", width: 90 },
            { title: "A330-300", dataIndex: "value300OfA330", width: 90 },
            { title: "A380-800", dataIndex: "value800OfA380", width: 90 },
            { title: "B737-700", dataIndex: "value700OfB737", width: 90 },
            { title: "B757-200", dataIndex: "value200OfB757", width: 90 },
            { title: "B777-200", dataIndex: "value200OfB777", width: 90 },
            { title: "B777F", dataIndex: "b777fvalue", width: 70 },
            { title: "B747-400F", dataIndex: "value400fOfB747", width: 90 },
            { title: "B777-300ER", dataIndex: "value300erOfB777", width: 100 },
            { title: "B787-8", dataIndex: "value8OfB787", width: 70 },
            { title: "BOEING/737/-8", dataIndex: "value8OfBoeing737", width: 120 }
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
            url: "c0039HandBook/queryC0039HandBookByParam",
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

    reset = () => {
        this.searcForm.resetFields();
        this.search();
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
                    url = "c0039HandBook/addC0039HandBook";
                    msg = "添加成功";
                }else{
                    url = "c0039HandBook/updateC0039HandBook";
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
            var list = this.state.selectedRows.map(item => item.arpCode);
            var name = this.state.selectedRows.map(item => item.arpName);
            confirm({
                title: "确认删除【" + name.join("、") + "】吗?",
                okType: 'danger',
                onOk: () => {
                    post({
                        url: "c0039HandBook/deleteC0039HandBook",
                        data: {arpList: list},
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
                name: "parameters",
                span: 10,
                length: 5,
                placeholder: "请输入机场名称（全称）、三字码（全称）、四字码（全称）搜索"
            }
        ];
    }

    /**
     * 获取form表的配置
     */
    getFormOptions(){
        const { currentAction, currentData } = this.state;
        var datas = currentAction == "add" ? {} : currentData;
        var list = ["R","A","F","P","R/A"];
        var arr = [
            {
                type: "Input",
                label: "机场中文名",
                name: "arpName",
                span: 8,
                options: {
                    initialValue: datas.arpName,
                    rules:[{required: true, message: "机场中文名不可为空"}]
                }
            },
            {
                type: "Input",
                label: "三字码",
                name: "arpCode",
                span: 8,
                placeholder: "如：ADL",
                options: {
                    initialValue: datas.arpCode,
                    rules:[
                        {required: true, message: "三字码不可为空！"},
                        {pattern:/^[A-Z]{3}$/, message: "请输入正确的三字码"}
                    ]
                }
            },
            {
                type: "Input",
                label: "四字码",
                name: "icaoCode",
                span: 8,
                placeholder: "如：YPAD",
                options: {
                    initialValue: datas.icaoCode,
                    rules:[
                        {required: true, message: "四字码不可为空！"},
                        {pattern:/^[A-Z]{4}$/, message: "请输入正确的四字码"}
                    ]
                }
            },
            {
                type: "Select",
                label: "E190",
                name: "e190Value",
                list: list,
                span: 8,
                isHasAllSelect: false,
                allowClear: true,
                options: {
                    initialValue: datas.e190Value
                }
            },
            {
                type: "Select",
                label: "A319-100",
                name: "value100OfA319",
                list: list,
                span: 8,
                isHasAllSelect: false,
                allowClear: true,
                options: {
                    initialValue: datas.value100OfA319
                }
            },
            {
                type: "Select",
                label: "A320-200",
                name: "value200OfA320",
                list: list,
                span: 8,
                isHasAllSelect: false,
                allowClear: true,
                options: {
                    initialValue: datas.value200OfA320
                }
            },
            {
                type: "Select",
                label: "A321-200",
                name: "value200OfA321",
                list: list,
                span: 8,
                isHasAllSelect: false,
                allowClear: true,
                options: {
                    initialValue: datas.value200OfA321
                }
            },
            {
                type: "Select",
                label: "A330-200",
                name: "value200OfA330",
                list: list,
                span: 8,
                isHasAllSelect: false,
                allowClear: true,
                options: {
                    initialValue: datas.value200OfA330
                }
            },
            {
                type: "Select",
                label: "A330-300",
                name: "value300OfA330",
                list: list,
                span: 8,
                isHasAllSelect: false,
                allowClear: true,
                options: {
                    initialValue: datas.value300OfA330
                }
            },
            {
                type: "Select",
                label: "A380-800",
                name: "value800OfA380",
                list: list,
                span: 8,
                isHasAllSelect: false,
                allowClear: true,
                options: {
                    initialValue: datas.value800OfA380
                }
            },
            {
                type: "Select",
                label: "B737-700",
                name: "value700OfB737",
                list: list,
                span: 8,
                isHasAllSelect: false,
                allowClear: true,
                options: {
                    initialValue: datas.value700OfB737
                }
            },
            {
                type: "Select",
                label: "B757-200",
                name: "value200OfB757",
                list: list,
                span: 8,
                isHasAllSelect: false,
                allowClear: true,
                options: {
                    initialValue: datas.value200OfB757
                }
            },
            {
                type: "Select",
                label: "B777-200",
                name: "value200OfB777",
                list: list,
                span: 8,
                isHasAllSelect: false,
                allowClear: true,
                options: {
                    initialValue: datas.value200OfB777
                }
            },
            {
                type: "Select",
                label: "B777F",
                name: "b777fvalue",
                list: list,
                span: 8,
                isHasAllSelect: false,
                allowClear: true,
                options: {
                    initialValue: datas.b777fvalue
                }
            },
            {
                type: "Select",
                label: "B747-400F",
                name: "value400fOfB747",
                list: list,
                span: 8,
                isHasAllSelect: false,
                allowClear: true,
                options: {
                    initialValue: datas.value400fOfB747
                }
            },
            {
                type: "Select",
                label: "B777-300ER",
                name: "value300erOfB777",
                list: list,
                span: 8,
                isHasAllSelect: false,
                allowClear: true,
                options: {
                    initialValue: datas.value300erOfB777
                }
            },
            {
                type: "Select",
                label: "B787-8",
                name: "value8OfB787",
                list: list,
                span: 8,
                isHasAllSelect: false,
                allowClear: true,
                options: {
                    initialValue: datas.value8OfB787
                }
            },
            {
                type: "Select",
                label: "BOEING/737/-8",
                name: "value8OfBoeing737",
                list: list,
                span: 8,
                isHasAllSelect: false,
                allowClear: true,
                options: {
                    initialValue: datas.value8OfBoeing737
                }
            }
        ];
        if( currentAction == "edit" ){
            arr[0].disabled = true;
            arr[1].disabled = true;
            arr[2].disabled = true;
        }
        return arr;
    }

    render(){
        const { table, modalOkBtnLoading, currentAction, selectedRowKeys, authorityList } = this.state;
        // 查询form
        const searchFormOptions = this.getSearchFormOptions();
        const btnOptions = {
            aligin: "left",
            span: 6,
            list: [
                {text: "查询", options: "queryOpt", event: this.search},
                {text: "重置", options: "resetOpt", event: this.reset}
            ]
        };
        // 增删改
        const commonBtnOptions = {
            shape: "round",
            size: "small"
        };
        // 列表表格参数
        const tableOptions = {
            key: "arpCode",
            columns: this.columns,
            table: table,
            scroll: { x: "max-content" },
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
                width: "820px",
                okButtonProps: { loading: modalOkBtnLoading },
            },
            onRef: (ref) => {this.modal = ref},
            ok: this.submit.bind(this)
        }
        const formOptions = this.getFormOptions();
        return(
            <CardCommon>
                { authorityList && <CommonForm options={searchFormOptions} btnOptions={btnOptions} wrappedComponentRef={(form) => { if(form && form.props && form.props.form) this.searcForm = form.props.form;}} />}
                <div className="buttons"><CommonBtns options={commonBtnOptions} btns={this.state.btns} /></div>
                { authorityList && <CommonTable options={tableOptions} onChecked={this.onChecked}></CommonTable>}
                { !authorityList && <div className="no-authority-box">无权限查看</div> }         
                <CommonModal {...modalOptions}>
                    <div className="form-grid-7"><CommonForm options={formOptions} wrappedComponentRef={(form) => { if(form && form.props && form.props.form) this.form = form.props.form;}} /></div>
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
)(withRouter(C0059HandBook));