import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import { Modal, message, Transfer } from 'antd';
import { CardCommon, CommonTable, CommonForm, CommonBtns, CommonModal } from "common/component";
import { handleInParams, isAuthority } from "common/commonFn";
import { post } from 'common/http';
import PageModel from 'model/pageModel';
const { confirm } = Modal;

const ADD = "user.add"; // 新增用户
const EDIT = "user.edit"; // 修改用户
const DEL = "user.del"; // 删除用户
const LIST = "user.list"; // 查询用户
const EDITUSERHASROLE = "user.editUserHasRole"; // 修改用户拥有角色
const DETAILUSERHASROLE = "user.detailUserHasRole"; // 查看用户拥有角色

class User extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            branchList: [],
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
            statusList: [
                {key: "0", text: "启用"},
                {key: "1", text: "禁用"}
            ],
            currentUser: {},
            roles: {
                authorizedRoles: [],
                unauthorizedRoles: []
            },
            authorityList: isAuthority(LIST, props.authority),
            editUserHasRole: isAuthority(EDITUSERHASROLE, props.authority),
            detailUserHasRole: isAuthority(DETAILUSERHASROLE, props.authority)
        };
        this.columns = [
            { title: "编号", dataIndex: "index" },
            { title: "用户工号", dataIndex: "userCode" },
            { title: "用户姓名", dataIndex: "userName" },
            { title: "所属公司", dataIndex: "chnDescShort" },
            { title: "用户状态", dataIndex: "locked", render: (text) => text == "0" ? "启用" : "禁用" }, //0:启用；1：未启用
            { title: "操作", key: "action", render: (text) => <a onClick={() => this.detail(text)}>查看</a> }
        ];
        this.searcForm;
        this.addModal;
        this.addForm;
        this.modal;
        this.form;
        this.transferCustom;
    }

    componentDidMount() {
        this.getBranchList( () => {
            this.getList();
        });
    }

    componentWillUnmount(){
        this.setState = (state, callback) => {
            return;
        };
    }

    getBranchList(callback){
        post({
            url: "sysUser/queryBranchofficeInfoList",
            success: data => {
                var branchList = data.map( (item) => {
                    return item.chnDescShort;
                });
                this.setState({branchList});
                callback && typeof callback == "function" && callback();
            }
        });
    }

    getList = (obj = {}) => {
        const table = this.state.table;
        table.setPage(obj);
        let params = table.getParmaData();
        post({
            url: "sysUser/querySysUserListByParam",
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
        this.addModal.show();
    }

    addSubmit = () => {
        this.setState({modalOkBtnLoading: true});
        this.addForm.validateFields((err, values) => {
            if( err ){
                this.setState({modalOkBtnLoading: false});
            }else{
                values = handleInParams(values);
                post({
                    url: "sysUser/insert",
                    data: values,
                    btn: () => this.setState({modalOkBtnLoading: false}),
                    success: data => {
                        message.success("添加用户成功！");
                        this.addModal.hide();
                        this.getList({pageNum: 1});
                    }
                });
            }
        });
    }

    getRolesDetail(id, callback){
        post({
            url: "sysUser/getRolesDetailByUserId",
            data: {userId: id},
            success: data => {
                callback && typeof callback == "function" && callback(data);
            }
        });
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
            this.getRolesDetail(this.state.selectedRows[0].id, (data) => {
                this.setState({
                    currentAction: "edit",
                    currentUser: this.state.selectedRows[0],
                    roles: data.roles
                });
                this.modal.show();
            });
        }
    }

    detail = (text) => {
        this.getRolesDetail(text.id, (data) => {
            this.setState({
                currentAction: "detail",
                currentUser: text,
                roles: data.roles
            });
            this.modal.show();
        });
    }

    submit = () => {
        this.setState({modalOkBtnLoading: true});
        this.form.validateFields((err, values) => {
            if( err ){
                this.setState({modalOkBtnLoading: false});
            }else{
                values = handleInParams(values);
                values.userId = this.state.currentUser.id;
                if( this.state.editUserHasRole ) values.authorizedRoleIds = this.transferCustom.state.targetKeys;
                post({
                    url: "sysUser/updateSysUserRole",
                    data: values,
                    btn: () => this.setState({modalOkBtnLoading: false}),
                    success: data => {
                        message.success("修改成功");
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
            var list = this.state.selectedRows.map(item => item.userCode);
            var names = this.state.selectedRows.map(item => item.userName);
            confirm({
                title: "确认删除【" + names.join("、") + "】吗?",
                okType: 'danger',
                onOk: () => {
                    post({
                        url: "sysUser/delete",
                        data: {userCodes: list},
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
                label: "所属公司",
                name: "chnDescShort",
                span: 6,
                list: this.state.branchList
            },
            {
                type: "Input",
                label: "用户工号",
                name: "userCode",
                span: 6
            }
        ];
    }

    getAddFormOptions(){
        return [
            {
                type: "Input",
                label: "用户工号",
                name: "userCode",
                span: 22,
                options: {
                    rules: [
                        {required: true, message: "用户工号不可为空！"}
                    ]
                }
            },
            {
                type: "Input",
                label: "用户姓名",
                name: "userName",
                span: 22,
                options: {
                    rules: [
                        {required: true, message: "用户姓名不可为空！"}
                    ]
                }
            },
            {
                type: "Select",
                label: "所属公司",
                name: "chnDescShort",
                span: 22,
                list: this.state.branchList,
                isHasAllSelect: false,
                options: {
                    rules: [
                        {required: true, message: "所属公司不可为空！"}
                    ]
                }
            },
            {
                type: "Select",
                label: "用户状态",
                name: "locked",
                span: 22,
                list: this.state.statusList,
                isHasAllSelect: false,
                options: {
                    rules: [
                        {required: true, message: "用户状态不可为空！"}
                    ]
                }
            },
        ];
    }

    /**
     * 获取form表的配置
     */
    getFormOptions(){
        var datas = this.state.currentUser;
        var arr = [
            {
                type: "Input",
                label: "用户工号",
                name: "userCode",
                span: 6,
                length: 5,
                disabled: true,
                options: {
                    initialValue: datas.userCode,
                    rules: [
                        {required: true, message: "用户工号不可为空！"}
                    ]
                }
            },
            {
                type: "Input",
                label: "用户姓名",
                name: "userName",
                span: 6,
                length: 5,
                options: {
                    initialValue: datas.userName,
                    rules: [
                        {required: true, message: "用户姓名不可为空！"}
                    ]
                }
            },
            {
                type: "Select",
                label: "所属公司",
                name: "chnDescShort",
                span: 6,
                length: 5,
                list: this.state.branchList,
                isHasAllSelect: false,
                options: {
                    initialValue: datas.chnDescShort,
                    rules: [
                        {required: true, message: "所属公司不可为空！"}
                    ]
                }
            },
            {
                type: "Select",
                label: "用户状态",
                name: "locked",
                span: 6,
                length: 5,
                list: this.state.statusList,
                isHasAllSelect: false,
                options: {
                    initialValue: datas.locked,
                    rules: [
                        {required: true, message: "用户状态不可为空！"}
                    ]
                }
            },
        ];
        if( this.state.currentAction == "detail" ){
            arr = arr.map(item => {
                item.disabled = true;
                return item;
            });
        }
        return arr;
    }

    render(){
        const searchFormOptions = this.getSearchFormOptions();
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
        const { table, selectedRowKeys, authorityList, editUserHasRole, detailUserHasRole, currentAction } = this.state;
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
        // add
        const addModalOptions = {
            options: {
                title: "新增用户",
                okButtonProps: { loading: this.state.modalOkBtnLoading }
            },
            onRef: (ref) => {this.addModal = ref},
            ok: this.addSubmit.bind(this)
        }
        const addFormOptions = this.getAddFormOptions();
        // 模态框
        var title = currentAction == "edit" ? "修改用户角色信息" : "查看用户角色信息";
        const modalOptions =  {
            options: {
                title: title,
                width: "800px",
                okButtonProps: { loading: this.state.modalOkBtnLoading }
            },
            onRef: (ref) => {this.modal = ref},
            ok: this.submit.bind(this)
        }
        if( currentAction == "detail" ) modalOptions.options.footer = null;
        const formOptions = this.getFormOptions();
        return(
            <CardCommon>
                {authorityList && <CommonForm options={searchFormOptions} btnOptions={btnOptions} wrappedComponentRef={(form) => { if(form && form.props && form.props.form) this.searcForm = form.props.form;}} />}
                <div className="buttons"><CommonBtns options={commonBtnOptions} btns={this.state.btns} /></div>
                { authorityList && <CommonTable options={tableOptions} onChecked={this.onChecked}></CommonTable> } 
                { !authorityList && <div className="no-authority-box">无权限查看</div> }   
                <CommonModal {...addModalOptions}>
                    <div className="form-grid-6">
                        <CommonForm options={addFormOptions} wrappedComponentRef={(form) => { if(form && form.props && form.props.form) this.addForm = form.props.form;}} />
                    </div>
                </CommonModal>
                <CommonModal {...modalOptions}>
                    <div>
                        <CommonForm options={formOptions} wrappedComponentRef={(form) => { if(form && form.props && form.props.form) this.form = form.props.form;}} />
                        { editUserHasRole && currentAction == "edit" && <TransferCustom datas={this.state.roles} currentAction={currentAction} onRef={ref => this.transferCustom = ref} /> }
                        { detailUserHasRole && currentAction == "detail" && <TransferCustom datas={this.state.roles} currentAction={currentAction} onRef={ref => this.transferCustom = ref} /> }                        
                    </div>
                </CommonModal>
            </CardCommon>            
        );
    }
}

class TransferCustom extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            dataSource: [],
            targetKeys: [],
            disabled: false
        }
    }

    componentDidMount(){
        if( this.props.onRef ) this.props.onRef(this);
        const { authorizedRoles, unauthorizedRoles } = this.props.datas;
        var dataSource = authorizedRoles.concat(unauthorizedRoles).map( (item, i ) => {
            return {
                key: item.id,
                title: item.name
            }
        });
        var targetKeys = authorizedRoles.map(item => item.id);
        var disabled = this.props.currentAction == "detail" ? true : false;
        this.setState({dataSource, targetKeys, disabled});
    }

    componentWillUnmount(){
        this.setState = (state, callback) => {
            return;
        };
    }

    handleChange = (nextTargetKeys) => {
        this.setState({ targetKeys: nextTargetKeys });
    };

    render(){
        const { dataSource, targetKeys, disabled } = this.state;
        return (
            <div style={{paddingTop:"10px",paddingBottom:"10px"}}>
                <div>角色分配：</div>
                <Transfer className="user-edit-transfer" titles={['未授权角色', '已授权角色']}
                    dataSource={dataSource}
                    targetKeys={targetKeys}
                    disabled= {disabled}
                    onChange={this.handleChange}
                    render={item =>  item.title} />
            </div>
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
)(withRouter(User));