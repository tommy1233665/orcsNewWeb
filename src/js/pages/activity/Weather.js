import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import { Modal, message } from 'antd';
import { CardCommon, CommonTable, CommonForm, CommonBtns, CommonModal } from "common/component";
import { handleInParams, isAuthority } from "common/commonFn";
import { post } from 'common/http';
import PageModel from 'model/pageModel';
const { confirm } = Modal;

const ADD = "weather.add"; // 新增
const EDIT = "weather.edit"; // 修改
const DEL = "weather.del"; // 删除
const LIST = "weather.list"; // 查询

class Weather extends React.Component {

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
            { title: "序号", dataIndex: "index" },
            { title: "分类", dataIndex: "weatherType", render: (text) => text == "B" ? "边缘天气" : text == "U" ? "非边缘天气" : "" },
            { title: "进近类型", dataIndex: "approachType", render: (text) => text == "A" ? "精密进近" : text == "U" ? "非精密进近" : "" },
            { title: "云高标准差值", dataIndex: "cloudData", render: (text, record) => this.cloudData(text, record) },
            { title: "能见度标准差值", dataIndex: "visibilityMark", render: (text, record) => this.visibilityMark(text, record) }
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

    cloudData(text, record){
        if ( record.cloudMark == 'lt' ) return "<" + text;
        if ( record.cloudMark == 'le' ) return "<=" + text;
        if ( record.cloudMark == 'gt' ) return ">" + text;
        if ( record.cloudMark == 'ge' ) return ">=" + text;
        if ( record.cloudMark == 'equal' ) return "=" + text;
        return text;
    }

    visibilityMark(text, record){
        if( record.visibilityMark == 'lt' ) return "<" + record.visibilityValue;
        if( record.visibilityMark == 'le' ) return "<=" + record.visibilityValue;
        if( record.visibilityMark == 'gt' ) return ">" + record.visibilityValue;
        if( record.visibilityMark == 'ge' ) return ">=" + record.visibilityValue;
        if( record.visibilityMark == 'equal' ) return "=" + record.visibilityValue;
        return record.visibilityValue;
    }

    getList = (obj = {}) => {
        const table = this.state.table;
        table.setPage(obj);
        let params = table.getParmaData();
        post({
            url: "weather/queryweatherListAll",
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
                    url = "weather/insert";
                    msg = "添加成功";
                }else{
                    values.id = this.state.currentData.id;
                    url = "weather/update";
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
                title: "确认删除选中项吗?",
                okType: 'danger',
                onOk: () => {
                    post({
                        url: "weather/delete",
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

    /**
     * 获取form表的配置
     */
    getFormOptions(){
        const { currentAction, currentData } = this.state;
        var datas = currentAction == "add" ? {} : currentData;
        var weatherTypeList = [
            {key: "B", text: "边缘天气"},
            {key: "U", text: "非边缘天气"}
        ];
        var approachTypeList = [
            {key: "A", text: "精密进近" },
            {key: "U", text: "非精密进近" }
        ];
        var markList = [
            {key: "lt", text: "<" },
            {key: "le", text: "<=" },
            {key: "gt", text: ">" },
            {key: "ge", text: ">=" },
            {key: "equal", text: "=" }
        ];
        const reg = /^0$|^-?[1-9]\d*$|^-?[1-9]\d*.\d{1,2}$|^-?0.\d{1,2}$/,
        message = "请输入数字，最多保留两位小数；如：0、-5、5.1、-5.11",
        placeholder = "请输入数字，最多保留两位小数";
        return [
            {
                type: "Select",
                label: "分类",
                name: "weatherType",
                list: weatherTypeList,
                span: 24,
                isHasAllSelect: false,
                options: {
                    initialValue: datas.weatherType
                }
            },
            {
                type: "Select",
                label: "进近类型",
                name: "approachType",
                list: approachTypeList,
                span: 24,
                isHasAllSelect: false,
                options: {
                    initialValue: datas.approachType
                }
            },
            {
                type: "Select",
                label: "云高标准差值运算符",
                name: "cloudMark",
                list: markList,
                span: 24,
                isHasAllSelect: false,
                options: {
                    initialValue: datas.cloudMark
                }
            },
            {
                type: "Input",
                label: "云高标准差值",
                name: "cloudData",
                span: 24,
                placeholder: placeholder,
                options: {
                    initialValue: datas.cloudData,
                    rules: [{pattern: reg, message: message}]
                }
            },
            {
                type: "Select",
                label: "能见度标准差值运算符",
                name: "visibilityMark",
                list: markList,
                span: 24,
                isHasAllSelect: false,
                options: {
                    initialValue: datas.visibilityMark
                }
            },
            {
                type: "Input",
                label: "能见度标准差值",
                name: "visibilityValue",
                span: 24,
                placeholder: placeholder,
                options: {
                    initialValue: datas.visibilityValue,
                    rules: [{pattern: reg, message: message}]
                }
            }
        ];
    }

    render(){
        const { table, modalOkBtnLoading, currentAction, selectedRowKeys, authorityList } = this.state;
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
            rowSelection: {
                selectedRowKeys,
                onChange: (selectedRowKeys, selectedRows) => { // 选中项发生变化时的回调
                    this.onChecked(selectedRowKeys, selectedRows);
                },
            }
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
                <div className="buttons"><CommonBtns options={commonBtnOptions} btns={this.state.btns} /></div>
                { authorityList && <CommonTable options={tableOptions} onChecked={this.onChecked}></CommonTable>}
                { !authorityList && <div className="no-authority-box">无权限查看</div> }      
                <CommonModal {...modalOptions}>
                    <div className="mb30">气象标准信息:</div>
                    <div className="form-grid-10" style={{paddingLeft: "30px", paddingRight: "60px"}}><CommonForm options={formOptions} wrappedComponentRef={(form) => { if(form && form.props && form.props.form) this.form = form.props.form;}} /></div>
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
)(withRouter(Weather));