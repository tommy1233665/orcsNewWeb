import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import { Modal, message } from 'antd';
import { CardCommon, CommonTable, CommonForm, CommonBtns, CommonModal } from "common/component";
import { handleInParams, isAuthority } from "common/commonFn";
import { post } from 'common/http';
import PageModel from 'model/pageModel';
const { confirm } = Modal;

const ADD = "permission.add"; // 新增
const EDIT = "permission.edit"; // 修改
const DEL = "permission.del"; // 删除
const LIST = "permission.list"; // 查询

class Permission extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            table: new PageModel(),
            selectedRowKeys: [],
            selectedRows: [],
            // 目前是未加权限，若需要加权限，则将现在用的btns注释掉，原来注释的放开，并且将上方增删改查对应的权限id写入
            btns: [
                { name: "新增", icon: "plus-circle", onClick: this.add },
                { name: "修改", icon: "edit", onClick: this.edit },
                { name: "删除", icon: "minus-circle", onClick: this.del }
            ],
            authorityList: true,
            // btns: [
            //     { name: "新增", id: ADD, icon: "plus-circle", onClick: this.add },
            //     { name: "修改", id: EDIT, icon: "edit", onClick: this.edit },
            //     { name: "删除", id: DEL, icon: "minus-circle", onClick: this.del }
            // ].filter(item => isAuthority(item.id, props.authority)),
            // authorityList: isAuthority(LIST, props.authority),
            modalOkBtnLoading: false,
            currentAction: "",
            currentData: {},
        };
        this.columns = [
            { title: "编号", dataIndex: "index" },
            { title: "权限名称", dataIndex: "name" },
            { title: "系统模块", dataIndex: "permGroup" },
            { title: "权限状态", dataIndex: "available", render: (text) => text == "0" ? "禁用" : text == "1" ? "启用" : "" }
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
            url: "sysPermission/querySysPermissionListByParam",
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
                if(this.state.currentAction == "edit"){
                    values.id = this.state.currentData.id;
                    url = "sysPermission/update";
                    msg = "修改成功";
                }else{
                    url = "sysPermission/insert";
                    msg = "添加成功";
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
            var names = this.state.selectedRows.map(item => item.name);
            confirm({
                title: "确认删除【" + names.join("、") + "】吗?",
                okType: 'danger',
                onOk: () => {
                    post({
                        url: "sysPermission/delete",
                        data: {permissionIds: list},
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
                type: "Select",
                label: "权限类型",
                name: "type",
                span: 6,
                list: [
                    {key: "menu", text: "菜单"},
                    {key: "permission", text: "权限"}
                ]
            },
            {
                type: "Input",
                label: "权限名称",
                name: "name",
                span: 6
            }
        ];
    }

    /**
     * 获取form表的配置
     */
    getFormOptions(){
        const { currentData, currentAction } = this.state; 
        var datas = currentAction == "edit" ? currentData : {};
        return [
            {
                type: "Input",
                label: "权限名称",
                name: "name",
                span: 24,
                length: 5,
                options: {
                    initialValue: datas.name
                }
            },
            {
                type: "Input",
                label: "系统模块",
                name: "permGroup",
                span: 24,
                length: 5,
                options: {
                    initialValue: datas.permGroup
                }
            },
            {
                type: "Select",
                label: "权限类型",
                name: "type",
                span: 24,
                length: 5,
                list: [
                    {key: "permission", text: "权限"}
                ],
                isHasAllSelect: false,
                options: {
                    initialValue: datas.type
                }
            },
            {
                type: "Input",
                label: "权限代码",
                name: "percode",
                span: 24,
                length: 5,
                options: {
                    initialValue: datas.percode
                }
            },
            {
                type: "Select",
                label: "权限状态",
                name: "available",
                span: 24,
                length: 5,
                list: [
                    {"key": "1", text: "启用"},
                    {"key": "0", text: "禁用"}
                ],
                isHasAllSelect: false,
                options: {
                    initialValue: datas.available
                }
            }
        ];
    }

    render(){
        const { table, currentAction, modalOkBtnLoading, btns, selectedRowKeys, authorityList } = this.state;
        const searchFormOptions = this.getSearchFormOptions();
        // 查询form
        const btnOptions = {
            aligin: "left",
            span: 6,
            list: [{text: "查询", options: "queryOpt", event: this.search}]
        };
        // 增删改
        const commonBtnOptions = { shape: "round", size: "small" };
        // 列表表格参数
        const tableOptions = {
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
        // 模态框
        var title = currentAction == "edit" ? "编辑" : "新增";
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
                <div className="buttons"><CommonBtns options={commonBtnOptions} btns={btns} /></div>
                { authorityList && <CommonTable options={tableOptions} onChecked={this.onChecked}></CommonTable>}     
                { !authorityList && <div className="no-authority-box">无权限查看</div> } 
                <CommonModal {...modalOptions}>
                    <div className="mb30">权限信息:</div>
                    <div style={{paddingLeft:"60px",paddingRight:"60px"}}><CommonForm options={formOptions} wrappedComponentRef={(form) => { if(form && form.props && form.props.form) this.form = form.props.form;}} /></div>
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
)(withRouter(Permission));