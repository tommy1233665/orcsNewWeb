import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import { Modal, message, Checkbox, Form } from 'antd';
import { CardCommon, CommonTable, CommonForm, CommonBtns, CommonModal } from "common/component";
import { handleInParams, isAuthority } from "common/commonFn";
import { post } from 'common/http';
import PageModel from 'model/pageModel';
const { confirm } = Modal;

const ADD = "role.add"; // 新增
const EDIT = "role.edit"; // 修改
const DEL = "role.del"; // 删除
const LIST = "role.list"; // 查询
const EDITHASAUTHORITY = "role.editHasAuthority"; // 修改角色拥有权限
const DETAILHASAUTHORITY = "role.detailHasAuthority"; // 查看角色拥有权限

class Role extends React.Component {

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
            statusList: [
                {key: "1", text: "启用"},
                {key: "0", text: "禁用"}
            ],
            currentRole: {},
            detailData: {},
            authorityList: isAuthority(LIST, props.authority),
            editHasAuthority: isAuthority(EDITHASAUTHORITY, props.authority),
            detailHasAuthority: isAuthority(DETAILHASAUTHORITY, props.authority)
        };
        this.columns = [
            { title: "编号", dataIndex: "index" },
            { title: "角色名称 ", dataIndex: "name" },
            { title: "角色描述 ", dataIndex: "roleDesc" },
            { title: "角色状态", dataIndex: "available", render: (text) => text == "1" ? "启用" : "禁用" }, //0:启用；1：未启用
            { title: "权限", key: "action", render: (text) => <a onClick={() => this.detail(text)}>查看</a> }
        ];
        this.searcForm;
        this.addModal;
        this.addForm;
        this.modal;
        this.form;
        this.tableCustom;
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
            url: "sysRole/querySysRoleListByParam",
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
                    url: "sysRole/insert",
                    data: values,
                    btn: () => this.setState({modalOkBtnLoading: false}),
                    success: data => {
                        message.success("添加角色成功！");
                        this.addModal.hide();
                        this.getList({pageNum: 1});
                    }
                });
            }
        });
    }

    getRolesDetail(id, callback){
        post({
            url: "sysRole/getPermissionsDetailByRoleId",
            data: {roleId: id},
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
                    currentRole: this.state.selectedRows[0],
                    detailData: data.mapList
                });
                this.modal.show();
            });
        }
    }

    detail = (text) => {
        this.getRolesDetail(text.id, (data) => {
            this.setState({
                currentAction: "detail",
                currentRole: text,
                detailData: data.mapList
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
                values.roleId = this.state.currentRole.id;
                if( this.state.editHasAuthority ){
                    var result = this.tableCustom.getValues();
                    Object.assign(values, result);
                }
                post({
                    url: "sysRole/updateRolePermissions",
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
            var list = this.state.selectedRows.map(item => item.id);
            var names = this.state.selectedRows.map(item => item.name);
            confirm({
                title: "确认删除【" + names.join("、") + "】吗?",
                okType: 'danger',
                onOk: () => {
                    post({
                        url: "sysRole/delete",
                        data: {roleIds: list},
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
                label: "角色名称",
                name: "name",
                span: 6
            }
        ];
    }

    getAddFormOptions(){
        return [
            {
                type: "Input",
                label: "角色名称",
                name: "name",
                span: 22,
                options: {
                    rules: [
                        {required: true, message: "角色名称不可为空！"}
                    ]
                }
            },
            {
                type: "Input",
                label: "角色描述",
                name: "roleDesc",
                span: 22
            },
            {
                type: "Select",
                label: "角色状态",
                name: "available",
                span: 22,
                list: this.state.statusList,
                isHasAllSelect: false,
                options: {
                    rules: [
                        {required: true, message: "角色状态不可为空！"}
                    ]
                }
            },
        ];
    }

    /**
     * 获取form表的配置
     */
    getFormOptions(){
        var datas = this.state.currentRole;
        var arr = [
            {
                type: "Input",
                label: "角色名称",
                name: "name",
                span: 8,
                length: 5,
                options: {
                    initialValue: datas.name,
                    rules: [
                        {required: true, message: "角色名称不可为空！"}
                    ]
                }
            },
            {
                type: "Input",
                label: "角色描述",
                name: "roleDesc",
                span: 8,
                length: 4,
                options: {
                    initialValue: datas.roleDesc
                }
            },
            {
                type: "Select",
                label: "角色状态",
                name: "available",
                span: 8,
                length: 5,
                list: this.state.statusList,
                isHasAllSelect: false,
                options: {
                    initialValue: datas.available,
                    rules: [
                        {required: true, message: "角色状态不可为空！"}
                    ]
                }
            }
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
        const { table, modalOkBtnLoading, currentAction, detailData, selectedRowKeys, authorityList, editHasAuthority, detailHasAuthority } = this.state;
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
        // add模态框
        const addModalOptions = {
            options: {
                title: "新增角色",
                okButtonProps: { loading: modalOkBtnLoading }
            },
            onRef: (ref) => {this.addModal = ref},
            ok: this.addSubmit.bind(this)
        }
        const addFormOptions = this.getAddFormOptions();
        // edit、detail模态框
        var title = currentAction == "edit" ? "修改角色权限信息" : "查看角色拥有权限";
        const modalOptions =  {
            options: {
                title: title,
                width: "800px",
                okButtonProps: { loading: modalOkBtnLoading }
            },
            onRef: (ref) => {this.modal = ref},
            ok: this.submit.bind(this)
        }
        if( (editHasAuthority && currentAction == "edit") || detailHasAuthority && currentAction == "detail" ){
            modalOptions.options.bodyStyle = {
                height: "500px",
                overflow: "auto"
            }
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
                        { editHasAuthority && currentAction == "edit" && <TableCustom  detailData={detailData} currentAction={currentAction} onRef={ref => this.tableCustom = ref}/> }
                        { detailHasAuthority && currentAction == "detail" && <TableCustom  detailData={detailData} currentAction={currentAction} onRef={ref => this.tableCustom = ref}/> }                        
                    </div>
                </CommonModal>
            </CardCommon>            
        );
    }
}

class TableCustom extends React.Component {
    constructor(props){
        super(props);
        this.state = {}
    }

    componentDidMount(){
        if( this.props.onRef ) this.props.onRef(this);
    }

    componentWillUnmount(){
        this.setState = (state, callback) => {
            return;
        };
    }

    getValues(){
        var values = this.props.form.getFieldsValue();
        for(var key in values){
            if( values[key] ){
                values[key] = values[key].filter( item => {
                    if( item ) return item;
                });
            }
        }
        var permissionIds = [];
        for(var key in values){
            if( key.indexOf("-") > -1 ){
                permissionIds = permissionIds.concat(values[key]);
            }
        }
        return {
            permissionIds: permissionIds,
            branchCds: values.branchCds,
            branchCds2: values.branchCds2
        };
    }

    getEditDataSource(){
        const { branchMap = {}, branchMap2 = {}, permissionMap = {} } = this.props.detailData;
        var arr = [];
        if( Object.keys(permissionMap).length > 0 ){
            for(var key in permissionMap){
                var obj = {
                    systemModule: key,
                    permissionsList: permissionMap[key],
                    permissionsName: "permissionIds" + "-" + key
                }
                for(var key1 in branchMap){
                    if( key == key1 ){
                        obj.company = branchMap[key1];
                        obj.companyName = "branchCds";
                    }
                }
                for(var key2 in branchMap2){
                    if( key == key2 ){
                        obj.company = branchMap2[key2];
                        obj.companyName = "branchCds2";
                    }
                }
                arr.push(obj);
            }
        }
        return arr;
    }

    getEditColumnDom(text, record, type){
        const { getFieldDecorator } = this.props.form;
        var dom = "";
        if( text ){
            const options = text.map(item => {
                if( type == "company" ){
                    return {
                        label: item.branchCd + item.chnDescShort,
                        value: item.branchCd
                    }
                }else{
                    return {
                        label: item.name,
                        value: item.id
                    }
                }
            });
            const defaultValue = text.map(item => {
                if( item.checked == "checked" ){
                    return type == "company" ? item.branchCd : item.id;
                }
            });
            var name = type == "company" ? record.companyName : record.permissionsName;
            dom = (
                <Form.Item>
                    {
                        getFieldDecorator(name, {
                            initialValue: defaultValue
                        })(<Checkbox.Group options={options} disabled={this.props.currentAction=="detail"?true:false} />)
                    }
                </Form.Item>
            );
        }
        return dom;
    }

    render(){
        const editTableOptions = {
            notCheck: true,
            columns: [
                { title: "系统模块", dataIndex: "systemModule", width: 160 },
                { title: "公司 ", dataIndex: "company", width: 232, className: "text-left role-edit-select",
                    render: (text, record) => this.getEditColumnDom(text, record, "company")
                },
                { title: "权限清单 ", dataIndex: "permissionsList", width: 340, className: "text-left role-edit-select",
                    render: (text, record) => this.getEditColumnDom(text, record, "permissionsList")
                }
            ],
            table: {dataList: this.getEditDataSource(), loading: false},
            needPage: false
        }
        return (
            <Form>
                <CommonTable options={editTableOptions} />
            </Form>
        )
    }
}
TableCustom = Form.create({})(TableCustom);

const mapStateToProps = (state) => {
    return {
        authority: state.authority
    };
}

export default connect(
    mapStateToProps
)(withRouter(Role));