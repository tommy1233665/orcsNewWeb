import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import { Tabs,Modal, message } from 'antd';
import { CardCommon, CommonTable, CommonForm, CommonBtns, CommonModal } from "common/component";
import { handleInParams, isAuthority } from "common/commonFn";
import { post } from 'common/http';
import PageModel from 'model/pageModel';
const { confirm } = Modal;
const { TabPane } = Tabs;

const ADD = "v2500Data.add"; // 新增
const EDIT = "v2500Data.edit"; // 修改
const DEL = "v2500Data.del"; // 删除
const LIST = "v2500Data.list"; // 查询

const ADD2 = "eGTData.add"; // 新增
const EDIT2 = "eGTData.edit"; // 修改
const DEL2 = "eGTData.del"; // 删除
const LIST2 = "eGTData.list"; // 查询

const ADD3 = "fWCData.add"; // 新增
const EDIT3 = "fWCData.edit"; // 修改
const DEL3 = "fWCData.del"; // 删除
const LIST3 = "fWCData.list"; // 查询


const ADD4 = "hAFHData.add"; // 新增
const EDIT4 = "hAFHData.edit"; // 修改
const DEL4 = "hAFHData.del"; // 删除
const LIST4 = "hAFHData.list"; // 查询

class V2500Reform extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    render(){
        const { authority } = this.props;
        return(
            <CardCommon>
                <Tabs>
                    <TabPane tab="7级叶片是否改装" key="1"><V2500Data authority={authority} /></TabPane>
                    <TabPane tab="EGT数值" key="2"><EGTData authority={authority} /></TabPane>
                    <TabPane tab="FWC是否升级" key="3"><FWCData authority={authority} /></TabPane>
                    <TabPane tab="高海拔启动悬挂数据" key="4"><HAFHData authority={authority} /></TabPane>
                </Tabs>
            </CardCommon>
        );
    }

}
class V2500Data extends React.Component{
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
            { title: "序号", dataIndex: "index" },
            { title: "发动机序列号", dataIndex: "engineSerise" },
            { title: "是否安装减震丝", dataIndex: "isReform" },
            { title: "备注", dataIndex: "description", isTooltip: true },
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
            url: "v2500Reform/queryV2500ReformListByParam",
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
                    url = "v2500Reform/addV2500Reform";
                    msg = "添加成功";
                }else{
                    values.id = this.state.currentData.id;
                    url = "v2500Reform/updateV2500Reform";
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
            var name = this.state.selectedRows.map(item => item.engineSerise);
            confirm({
                title: "确认删除序列号为【" + name.join("、") + "】的数据吗?",
                okType: 'danger',
                onOk: () => {
                    post({
                        url: "v2500Reform/deleteV2500Reform",
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
                label: "发动机序列号",
                name: "v2500Reform",
                span: 6,
                length: 6,
                placeholder: "例：V10236"
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
                label: "发动机序列号",
                name: "engineSerise",
                span: 24,
                options: {
                    initialValue: datas.engineSerise,
                    rules: [
                        {required: true, message: "发动机序列号不可为空！"}
                    ]
                }
            },
            {
                type: "Select",
                label: "是否安装减震丝",
                name: "isReform",
                list: isReformList,
                span: 24,
                isHasAllSelect: false,
                options: {
                    initialValue: datas.isReform,
                    rules: [
                        {required: true, message: "是否安装减震丝不可为空！"}
                    ]
                }
            },
            {
                type: "TextArea",
                label: "备注",
                name: "description",
                span: 24,
                options: {
                    initialValue: datas.description
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

class EGTData extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            table: new PageModel(),
            selectedRowKeys: [],
            selectedRows: [],
            btns: [
                { name: "新增", id: ADD2, icon: "plus-circle", onClick: this.add },
                { name: "修改", id: EDIT2, icon: "edit", onClick: this.edit },
                { name: "删除", id: DEL2, icon: "minus-circle", onClick: this.del }
            ].filter(item => isAuthority(item.id, props.authority)),
            modalOkBtnLoading: false,
            currentAction: "",
            currentData: {},        
            authorityList: isAuthority(LIST, props.authority)
        };     
        this.columns = [        
            { title: "机尾号", dataIndex: "tailNr" , width: 100, fixed: 'left' },
            { title: "EGT差值", dataIndex: "egtValue",width: 100},
            { title: "备注", dataIndex: "remark" ,isTooltip: true,width: 800 },
            { title: "更新人", dataIndex: "updateUser" , width: 100},
            { title: "更新时间", dataIndex: "updateTime",width: 280 }
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
            url: "v2500Reform/queryV2500EgtListByParam",
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
                    url = "v2500Reform/addEngineEgtInfo";
                    msg = "添加成功";
                }else{
                    values.id = this.state.currentData.id;
                    url = "v2500Reform/updateEngineEgtV2500Info";
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
            var tailNr = this.state.selectedRows.map(item => item.tailNr);
            confirm({
                title: "确认删除机尾号为【" + tailNr.join("、") + "】的数据吗?",
                okType: 'danger',
                onOk: () => {
                    post({
                        url: "v2500Reform/deleteEngineEgtV2500Info",
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
                name: "engineEgt",
                span: 6,
                length: 3,
                placeholder: "例：B-3096"
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
                type: "Input",
                label: "EGT差值",
                name: "egtValue",
                span: 24,
                options: {
                    initialValue: datas.egtValue,
                    rules: [
                        {required: true, message: "EGT差值不可为空！"}
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

class FWCData extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            table: new PageModel(),
            selectedRowKeys: [],
            selectedRows: [],
            btns: [
                { name: "新增", id: ADD3, icon: "plus-circle", onClick: this.add },
                { name: "修改", id: EDIT3, icon: "edit", onClick: this.edit },
                { name: "删除", id: DEL3, icon: "minus-circle", onClick: this.del }
            ].filter(item => isAuthority(item.id, props.authority)),
            modalOkBtnLoading: false,
            currentAction: "",
            currentData: {},
            isReformList: [],
            authorityList: isAuthority(LIST, props.authority)
        };
       
        this.columns = [        
            { title: "机尾号", dataIndex: "tailNr", width: 100, fixed: 'left' },
            { title: "FWC是否升级到F10", dataIndex: "fwcToF10",width: 100},
            { title: "备注", dataIndex: "remark", isTooltip: true, width: 800},
            { title: "更新人", dataIndex: "updateUser",width: 100 },
            { title: "更新时间", dataIndex: "updateTime" ,width: 280}
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
            url: "v2500Reform/queryV2500FwcListByParam",
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
                    url = "v2500Reform/addEngineFwcV2500Info";
                    msg = "添加成功";
                }else{
                    values.id = this.state.currentData.id;
                    url = "v2500Reform/updateEngineFwcV2500Info";
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
            var tailNr = this.state.selectedRows.map(item => item.tailNr);
            confirm({
                title: "确认删除机尾号为【" + tailNr.join("、") + "】的数据吗?",
                okType: 'danger',
                onOk: () => {
                    post({
                        url: "v2500Reform/deleteEngineFwcV2500Info",
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
                name: "engineFwc",
                span: 6,
                length: 3,
                placeholder: "例：B-3096"
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
                label: "FWC是否升级到F10",
                name: "fwcToF10",
                list: isReformList,
                span: 24,
                isHasAllSelect: false,
                options: {
                    initialValue: datas.fwcToF10,
                    rules: [
                        {required: true, message: "FWC是否升级到F10不可为空！"}
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


class HAFHData extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            table: new PageModel(),
            selectedRowKeys: [],
            selectedRows: [],
            btns: [
                { name: "新增", id: ADD4, icon: "plus-circle", onClick: this.add },
                { name: "修改", id: EDIT4, icon: "edit", onClick: this.edit },
                { name: "删除", id: DEL4, icon: "minus-circle", onClick: this.del }
            ].filter(item => isAuthority(item.id, props.authority)),
            modalOkBtnLoading: false,
            currentAction: "",
            currentData: {},
            isReformList: [],
            authorityList: isAuthority(LIST, props.authority)
        };
       
        this.columns = [        
            { title: "发动机型号", dataIndex: "engineSeries", width: 100, fixed: 'left' },
            { title: "高海拔机场", dataIndex: "hafhArp",width: 100},
            { title: "备注", dataIndex: "remark", isTooltip: true, width: 800},
            { title: "更新人", dataIndex: "updateUser",width: 100 },
            { title: "更新时间", dataIndex: "updateTime" ,width: 280}
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
            url: "v2500Reform/queryV2500HafhListByParam",
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
                    url = "v2500Reform/addEngineHafhInfo";
                    msg = "添加成功";
                }else{
                    values.id = this.state.currentData.id;
                    url = "v2500Reform/updateEngineHafhV2500Info";
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
            var engineSeries = this.state.selectedRows.map(item => item.engineSeries);
            confirm({
                title: "确认删除序列号为【" + engineSeries.join("、") + "】的数据吗?",
                okType: 'danger',
                onOk: () => {
                    post({
                        url: "v2500Reform/deleteEngineHafhV2500Info",
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
                label: "发动机型号",
                name: "engineHafh",
                span: 6,
                length: 5,
                placeholder: "例：CFM56-7B"
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
                label: "发动机型号",
                name: "engineSeries",
                span: 24,
                options: {
                    initialValue: datas.engineSeries,
                    rules: [
                        {required: true, message: "发动机型号不可为空！"}
                    ]
                }
            },
            {
                type: "Input",
                label: "高海拔机场",
                name: "hafhArp",
                span: 24,
                options: {
                    initialValue: datas.hafhArp,
                    rules: [
                        {required: true, message: "高海拔机场不可为空！"}
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
)(withRouter(V2500Reform));