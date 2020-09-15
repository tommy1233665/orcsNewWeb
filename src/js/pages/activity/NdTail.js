import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import { Tabs,Modal, message } from 'antd';
import { CardCommon, CommonTable, CommonForm, CommonBtns, CommonModal } from "common/component";
import { handleInParams, isAuthority } from "common/commonFn";
import { post } from 'common/http';
import PageModel from 'model/pageModel';
const { confirm } = Modal;

const ADD = "ndTailData.add"; // 新增
const EDIT = "ndTailData.edit"; // 修改
const DEL = "ndTailData.del"; // 删除
const LIST = "ndTailData.list"; // 查询

class NdTail extends React.Component{
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
            isReformList: [],          
            authorityList: isAuthority(LIST, props.authority)
        };
        this.columns = [
            { title: "机尾号", dataIndex: "tailNr" },
            { title: "AIMS软件是否升级到BP17B", dataIndex: "ifBp17b" },          
            { title: "备注", dataIndex: "remark", isTooltip: true },
            { title: "更新人", dataIndex: "updateUser" },
            { title: "更新时间", dataIndex: "updateTime" }
        ];   
        this.modal;
        this.form;
    }

    componentDidMount() {
        this.getIsReformList();
        this.getList();
    }

    componentWillUnmount(){
        this.setState = (state, callback) => {
            return;
        };
    }

    getIsReformList(){
        post({
            url: "v2500Reform/queryIsReformList",
            success: data => {
                var arr = data.map(item => item.selectItem);
                this.setState({isReformList: arr});
            }
        });
    }

    getList = (obj = {}) => {
        const table = this.state.table;
        table.setPage(obj);
        let params = table.getParmaData();
        post({
            url: "ndBlackScreenTail/queryNdTailListByParam",      
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
                    url = "ndBlackScreenTail/addNdTail";
                    msg = "添加成功";
                }else{
                    values.id = this.state.currentData.id;
                    url = "ndBlackScreenTail/updateNdTail";
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
            var list = this.state.selectedRows.map(item => item.tailNr);
            var name = this.state.selectedRows.map(item => item.tailNr);
            confirm({
                title: "确认删除机尾号为【" + name.join("、") + "的ND黑屏数据】吗?",
                okType: 'danger',
                onOk: () => {
                    post({
                        url: "ndBlackScreenTail/deleteNdTailInfo",
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
                label: "机尾号",
                name: "tailNr",
                span: 6,
                length: 3,
                placeholder: "例：B-3056"
            }
        ];
    }

    /**
     * 获取form表的配置
     */
    getFormOptions(){
        const { currentAction, currentData, isReformList } = this.state;
        var datas = currentAction == "add" ? {} : currentData;
        var arr = [
            {
                type: "Input",
                label: "机尾号",
                name: "tailNr",
                span: 24,
                options: {
                    initialValue: datas.tailNr,
                    rules: [
                        {required: true, message: "机尾号不可为空！"}
                    ]
                }
            },
            {
                type: "Select",
                label: "AIMS软件是否升级到BP17B",
                name: "ifBp17b",
                list: isReformList,
                span: 24,
                isHasAllSelect: false,
                options: {
                    initialValue: datas.ifBp17b,
                    rules: [
                        {required: true, message: "AIMS软件是否升级到BP17B不可为空！"}
                    ]
                }
            },
            {
                type: "TextArea",
                label: "备注",
                name: "remark",
                span: 24,
                options: {
                    initialValue: datas.remark
                }
            }
        ];
        if( currentAction == "edit" ) arr[0].disabled = true;
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
                { authorityList && <CommonForm options={searchFormOptions} btnOptions={btnOptions} wrappedComponentRef={(form) => { if(form && form.props && form.props.form) this.searcForm = form.props.form;}} />}
                <div className="buttons"><CommonBtns options={commonBtnOptions} btns={this.state.btns} /></div>
                { authorityList && <CommonTable options={tableOptions} onChecked={this.onChecked}></CommonTable> }
                { !authorityList && <div className="no-authority-box">无权限查看</div> }
                <CommonModal {...modalOptions}>
                    <div className="form-grid-8" style={{paddingLeft: "30px", paddingRight: "60px"}}><CommonForm options={formOptions} wrappedComponentRef={(form) => { if(form && form.props && form.props.form) this.form = form.props.form;}} /></div>
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
)(withRouter(NdTail));