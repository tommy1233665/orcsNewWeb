import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import { Row, Col, Tree, Form, Input, message, Modal } from 'antd';
import { handleInParams, isAuthority } from 'common/commonFn';
import { CardCommon, CommonModal, ContextMenu, CommonForm, CommonBtns, CommonTable } from "common/component";
import { post } from "common/http";
import PageModel from 'model/pageModel';
import { riskTargetMap } from 'common/datas';

const { TreeNode, DirectoryTree } = Tree;
const { Search } = Input;
const { confirm } = Modal;

// 用同一个侧风标准，目的地机场的侧风标准跟其他节点一样有新增修改删除，目的地备降机场的只查看不做其他操作
const originalId = riskTargetMap.originalId; // 目的地机场的侧风标准
const modifyId = riskTargetMap.modifyId; // 目的地备降机场的侧风标准

const ADDTREE = "riskTarget.addTree"; // 新增树节点
const EDITTREE = "riskTarget.editTree"; // 修改树节点
const DELTREE = "riskTarget.delTree"; // 删除树节点
const LISTTREE = "riskTarget.listTree"; // 查询树节点

const EDITNODE = "riskTarget.editNode"; // 新增/修改组合风险节点默认值、概率、比重
const DETAILNODE = "riskTarget.detailNode"; // 查看组合风险节点默认值、概率、比重
const EDITLEAF = "riskTarget.editLeaf"; // 新增/修改终端风险节点默认值、告警值、概率、比重
const DETAILLEAF = "riskTarget.detailLeaf"; // 查看终端风险节点默认值、告警值、概率、比重

const EDITMATRIX = "riskTarget.editMatrix"; // 新增/修改组合风险节点交叉矩阵赋值
const DETAILMATRIX = "riskTarget.detailMatrix"; // 查看组合风险节点交叉矩阵赋值

const ADDRULE = "riskTarget.addRule"; // 新增终端风险节点规则
const EDITRULE = "riskTarget.editRule"; // 修改终端风险节点规则
const DELRULE = "riskTarget.delTule"; // 删除终端风险节点规则
const LISTRULE = "riskTarget.listRule"; // 查看终端风险节点规则

class RiskTarget extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            authorityEditNode: isAuthority(EDITNODE, props.authority),
            authorityDetailNode: isAuthority(DETAILNODE, props.authority),
            authorityEditLeaf: isAuthority(EDITLEAF, props.authority),
            authorityDetailLeaf: isAuthority(DETAILLEAF, props.authority),
            nodeData: {},
            formOptions: [],
            btnOptions: {
                aligin: "right",
                span: 24,
                list: [
                    {text: "保存", options: "saveOpt", event: this.submit},
                    {text: "取消", options: "reload", event: this.cancel}
                ]
            }
        };
        this.form;
    }

    componentDidMount() {
        this.setState({formOptions: this.getFormOptions()});
    }

    componentWillUnmount(){
        this.setState = (state, callback) => {
            return;
        };
    }

    /**
     * 保存
     */
    submit = () => {
        event.preventDefault();
        this.form.validateFields((err, values) => {
            if (!err) {
                values.id = this.state.nodeData.id;
                values.useDefault =  values.useDefault[0];
                if(values.isShow) values.isShow =  values.isShow[0];
                if(values.warnFlg) values.warnFlg =  values.warnFlg[0];
                values = handleInParams(values);
                post({
                    url: "rmItem/updateRmItemAndRmItemFunPoints",
                    data: values,
                    success: data => {
                        message.success("保存成功");
                    }
                });
            }
        });
    }

    cancel = () => {
        this.form.resetFields();
    }

    nodeData = (data) => {
        var flag = ((data.isLeaf == "N" && !this.state.authorityEditNode) || (data.isLeaf == "Y" && !this.state.authorityEditLeaf)) ? true : false;
        post({
            url: "rmItem/showRmItemById/rmItemParentList",
            data: {id: data.id},
            success: res => {
                var newObj = Object.assign({}, res.rmItem, {parentName: res.parentrmItem.name, parentCode: res.parentrmItem.code});
                this.setState({
                    formOptions: this.getFormOptions(newObj),
                    nodeData: newObj,
                    btnOptions: flag ? {} : {
                        aligin: "right", span: 24,
                        list: [
                            {text: "保存", options: "saveOpt", event: this.submit},
                            {text: "取消", options: "reload", event: this.cancel}
                        ]
                    }
                });
                // 表单赋值
                var values = {
                    name: newObj.name,
                    code: newObj.code,
                    parentCode: newObj.parentCode,
                    parentName: newObj.parentName,
                    useDefault: [newObj.useDefault],
                    defaultValue: newObj.defaultValue,
                    probability: newObj.probability,
                    proportion: newObj.proportion,
                }
                if( newObj.isLeaf == "Y" ){
                    values.isShow = [newObj.isShow];
                    values.warnFlg = [newObj.warnFlg];
                    values.warningValue = newObj.warningValue;
                }
                this.form && this.form.setFieldsValue(values);
            }
        });
    }

    /**
     * 获取form表的配置
     */
    getFormOptions(nodeData = {}){
        const reg = /^0$|^[1-9]\d*$|^[1-9]\d*.\d{1,2}$|^0.\d{1,2}$/,
        message = "最多保留2位小数 如：1、1.0、0.88",
        placeholder = "最多保留2位小数";
        var arr;
        if( nodeData.isLeaf == "Y" ){
            arr = [
                {
                    type: "Input",
                    label: "节点编号",
                    name: "code",
                    span: 6,
                    length: 4,
                    disabled: true,
                    options: {
                        initialValue: ""
                    }
                },
                {
                    type: "Input",
                    label: "父节点编号",
                    name: "parentCode",
                    span: 6,
                    length: 5,
                    disabled: true,
                    options: {
                        initialValue: ""
                    }
                },
                {
                    type: "Input",
                    label: "默认值",
                    name: "defaultValue",
                    span: 6,
                    length: 4,
                    placeholder: placeholder,
                    options: {
                        initialValue: "",
                        rules: [{pattern: reg, message: message}]
                    }
                },
                {
                    type: "Checkbox",
                    label: "",
                    name: "useDefault",
                    span: 6,
                    length: 3,
                    list: [{label: "是否使用默认值", value: "Y"}],
                    options: {
                        initialValue: [],
                    }
                },
                {
                    type: "Input",
                    label: "节点名称",
                    name: "name",
                    span: 6,
                    length: 4,
                    disabled: true,
                    options: {
                        initialValue: "",
                    }
                },
                {
                    type: "Input",
                    label: "父节点名称",
                    name: "parentName",
                    span: 6,
                    length: 5,
                    disabled: true,
                    options: {
                        initialValue: "",
                    }
                },
                {
                    type: "Input",
                    label: "告警上限",
                    name: "warningValue",
                    span: 6,
                    length: 4,
                    placeholder: placeholder,
                    options: {
                        initialValue: "",
                        rules: [{pattern: reg, message: message}]
                    }
                },
                {
                    type: "Checkbox",
                    name: "warnFlg",
                    span: 6,
                    length: 4,
                    list: [{label: "是否告警", value: "Y"}],
                    options: {
                        initialValue: [],
                    }
                },
                {
                    type: "Input",
                    label: "概率",
                    name: "probability",
                    span: 6,
                    length: 4,
                    placeholder: placeholder,
                    options: {
                        initialValue: "",
                        rules: [{pattern: reg, message: message}]
                    }
                },
                {
                    type: "Input",
                    label: "比重",
                    name: "proportion",
                    span: 6,
                    length:5,
                    placeholder: placeholder,
                    options: {
                        initialValue: "",
                        rules: [{pattern: reg, message: message}]
                    }
                },
                {
                    type: "Checkbox",
                    name: "isShow",
                    span: 12,
                    length: 2,
                    list: [{label: "不显示在风险明细中", value: "Y"}],
                    options: {
                        initialValue: [],
                    }
                }
            ];
        }else{
            arr = [
                {
                    type: "Input",
                    label: "节点编号",
                    name: "code",
                    span: 6,
                    length: 4,
                    disabled: true,
                    options: {
                        initialValue: ""
                    }
                },
                {
                    type: "Input",
                    label: "父节点编号",
                    name: "parentCode",
                    span: 6,
                    length: 5,
                    disabled: true,
                    options: {
                        initialValue: ""
                    }
                },
                {
                    type: "Input",
                    label: "比重",
                    name: "proportion",
                    span: 6,
                    length: 2,
                    placeholder: placeholder,
                    options: {
                        initialValue: "",
                        rules: [{pattern: reg, message: message}]
                    }
                },
                {
                    type: "Checkbox",
                    label: "",
                    name: "useDefault",
                    span: 6,
                    length: 3,
                    list: [{label: "是否使用默认值", value: "Y"}],
                    options: {
                        initialValue: [],
                    }
                },
                {
                    type: "Input",
                    label: "节点名称",
                    name: "name",
                    span: 6,
                    length: 4,
                    disabled: true,
                    options: {
                        initialValue: "",
                    }
                },
                {
                    type: "Input",
                    label: "父节点名称",
                    name: "parentName",
                    span: 6,
                    length: 5,
                    disabled: true,
                    options: {
                        initialValue: "",
                    }
                },
                {
                    type: "Input",
                    label: "概率",
                    name: "probability",
                    span: 6,
                    length: 2,
                    placeholder: placeholder,
                    options: {
                        initialValue: "",
                        rules: [{pattern: reg, message: message}]
                    }
                },
                {
                    type: "Input",
                    label: "默认值",
                    name: "defaultValue",
                    span: 6,
                    length: 3,
                    placeholder: placeholder,
                    options: {
                        initialValue: "",
                        rules: [{pattern: reg, message: message}]
                    }
                }
            ];
        }
        return arr;
    }

    render() {
        const { authority } = this.props;
        const { authorityDetailNode, authorityDetailLeaf, formOptions, btnOptions, nodeData } = this.state;
        return (
            <Row gutter={16} className="risk-target">
                <Col span={5}>
                    <CardCommon title="航班风险因素节点">
                        <RmItemTree getSelectedNodeData={this.nodeData} authority={authority} />
                    </CardCommon>
                </Col>
                <Col span={19}>
                    <CardCommon title="风险因素配置">
                        <div className="risk-target-content">
                            <div className="risk-target-form">
                                { authorityDetailNode && nodeData.isLeaf == "N" && <CommonForm options={formOptions} btnOptions={btnOptions} wrappedComponentRef={(form) => { if(form && form.props && form.props.form) this.form = form.props.form;}} />}
                                { !authorityDetailNode && nodeData.isLeaf == "N" && <div className="no-authority-box">无权限查看</div> }
                                { authorityDetailLeaf && nodeData.isLeaf == "Y" && <CommonForm options={formOptions} btnOptions={btnOptions} wrappedComponentRef={(form) => { if(form && form.props && form.props.form) this.form = form.props.form;}} />}
                                { !authorityDetailLeaf && nodeData.isLeaf == "Y" && <div className="no-authority-box">无权限查看</div> }
                            </div>
                            {nodeData.isLeaf == "N" && <RmItemTable options={nodeData} authority={authority} />}
                            {nodeData.isLeaf == "Y" && <RmItemLeafTable id={nodeData.id} authority={authority} />}
                        </div>
                    </CardCommon>
                </Col>
            </Row >
        )
    }
}

class RmItemLeafTable extends React.Component {

    constructor(props){
        super(props);
        var id = props.id == originalId ? modifyId : props.id;
        var readonly = props.id == originalId ? true : false;
        this.state = {
            id: id,
            readonly: readonly,
            table: new PageModel(),
            selectedRowKeys: [],
            selectedRows: [], // table里被选中的行
            currentAction: "",
            rmItemRuleData: {},
            modalOkBtnLoading: false,
            authorityList: isAuthority(LISTRULE, props.authority)
        };
        this.columns = [
            { title: "序号", dataIndex: 'index', width: 50 },
            { title: "风险节点规则名称", dataIndex: 'name', className: "text-left", width: 300, isTooltip: true },
            { title: "分值", dataIndex: 'riskValue', width: 50 },
            { title: "信息描述", dataIndex: 'informationDescription', className: "text-left", width: 400, isTooltip: true },
            { title: "建议措施", dataIndex: 'mitigatingMeasures', className: "text-left", width: 300, isTooltip: true },
            { title: "备注", dataIndex: 'memo', className: "text-left", width: 300, isTooltip: true }
        ];
        this.modal;
        this.form;
    }

    componentDidMount(){
        this.getList({params: {rmItemId: this.state.id}});
    }

    componentWillReceiveProps(nextProps){
        if( nextProps.id != this.props.id ){
            var id = nextProps.id == originalId ? modifyId : nextProps.id;
            var readonly = nextProps.id == originalId ? true : false;
            this.setState({ id, readonly });
            this.getList({params: {rmItemId: id}, pageNum: 1});
        }
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
            url: "rmItemRule/queryRmItemRuleByItemId",
            data: params,
            success: data => {
                if( data && data.rows ){
                    var dataList = data.rows.map( (item, i) => {
                        item.index = ( params.pageNum - 1 ) * params.pageSize + i + 1;
                        return item;
                    });
                    table.setPage({ dataList, total: data.total, pageNum: params.pageNum, pageSize: params.pageSize });
                    this.setState({ table, selectedRowKeys: [], selectedRows: [], currentAction: "" });
                }
            }
        });
    }

    onChecked = (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys, selectedRows });
    }

    /**
     * 新增、修改需要用到
     */
    getRmItemRuleDataAndRuleItem(params, callback){
        post({
            url: "rmItemRuleData/queryRmItemRuleDataAndRuleItemByRmItemRuleId",
            data: params,
            success: data => {
                callback && typeof callback == "function" && callback(data);
            }
        });
    }

    add = (callback) => {
        callback();
        var This = this;
        this.getRmItemRuleDataAndRuleItem({rmtemId: this.state.id}, data => {
            This.setState({
                rmItemRuleData: data,
                currentAction: "add"
            });
            This.modal.show();
        });
    }

    edit = (callback) => {
        if( this.state.selectedRows.length == 0 ){
            message.warning("必须选择一个选项才能编辑！");
            callback();
        }else if( this.state.selectedRows.length  > 1 ){
            message.warning("只能选择一个选项！");
            callback();
        }else{
            callback();
            var This = this;
            this.getRmItemRuleDataAndRuleItem({
                rmtemId: this.state.id, 
                rmItemRuleId: this.state.selectedRows[0].id
            }, res => {
                This.setState({
                    rmItemRuleData: res,
                    currentAction: "edit"
                });
                This.modal.show();
            });
        }
    }

    detail = (callback) => {
        if( this.state.selectedRows.length == 0 ){
            message.warning("必须选择一个选项才能查看！");
            callback();
        }else if( this.state.selectedRows.length  > 1 ){
            message.warning("只能选择一个选项！");
            callback();
        }else{
            callback();
            var This = this;
            this.getRmItemRuleDataAndRuleItem({
                rmtemId: this.state.id, 
                rmItemRuleId: this.state.selectedRows[0].id
            }, res => {
                This.setState({
                    rmItemRuleData: res,
                    currentAction: "detail"
                });
                This.modal.show();
            });
        }
    }

    /**
     * 入参处理
     */
    handleData(item){
        var arr = [];
        for(var key in item){
            if( key == "ruleItem" || key == "symbol" || key == "setValue" ){ //id是否需要传
                arr.push(key + "=" + item[key]);
            }
        }
        return arr;
    }
    getResult(list){
        return list.map( item => {
            return this.handleData(item);
        });
    }
    getParams(values){
        values.rmItemId = this.state.id;
        if( this.state.currentAction == "edit" ) values.id = this.state.selectedRows[0].id;
        if( values.customKey ) values.customKey = values.customKey.value;
        var result1 = [], result2 = [];
        for(var key in values){
            if( values[key] ){
                if( key == "customKey" ){
                    var arr = this.getResult(values[key]);
                    if( arr.length == 0 ){
                        this.setState({modalOkBtnLoading: false});
                        message.warning("请至少添加一条风险节点规则条件");
                    }else{
                        result2 = arr.reduce(function (a, b) { return a.concat(b)} );
                    }
                }else{
                    result1.push(key + "=" + values[key]);
                }
            }
        }
        return result1.concat(result2);
    }

    submit = () => {
        this.setState({modalOkBtnLoading: true});
        this.form.validateFields((err, values) => {
            if( err ){
                this.setState({modalOkBtnLoading: false});
            }else{
                var result = this.getParams(values);
                var url, msg;
                if( this.state.currentAction == "add" ){
                    url = "rmItemRule/insertRmtemRuleAndItemRuleDataAtRmtem";
                    msg = "添加成功";
                }else if( this.state.currentAction == "edit" ){
                    url = "rmItemRule/updateRmtemRuleAndItemRuleDataAtRmtem";
                    msg = "修改成功";
                }
                post({
                    url: url,
                    data: result.join("&"),
                    btn: () => this.setState({modalOkBtnLoading: false}),
                    success: data => {
                        message.success(msg);
                        this.modal.hide();
                        this.getList({params: {rmItemId: this.props.id}, pageNum: 1});
                    }
                });
            }
        });
    }

    del = (callback) => {
        if( this.state.selectedRows.length == 0 ){
            message.warning("未选中选项！");
            callback();
        }else{
            var This = this;
            confirm({
                title: "确认删除选项吗？",
                onOk() {
                    var ids = This.state.selectedRows.map(item => item.id);
                    post({
                        url: "rmItemRule/deleteRmItemRuleAndRmItemRuleData",
                        data: {ids: ids},
                        btn: callback,
                        success: data => {
                            message.success("删除成功");
                            This.getList({params: {rmItemId: This.props.id}, pageNum: 1});
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
        const { currentAction, table, selectedRows, rmItemRuleData } = this.state;
        var data = {};
        if( (currentAction == "edit" || currentAction == "detail") && selectedRows.length > 0 ){
            var result = table.dataList.filter(item => item.id == selectedRows[0].id)[0];
            data = {
                name: result.name,
                riskValue: result.riskValue,
                informationDescription: result.informationDescription,
                mitigatingMeasures: result.mitigatingMeasures,
                memo: result.memo,
                customKey: rmItemRuleData.rmItemRuleDataList
            }  
        }
        var arr = [
            {
                type: "Input",
                label: "风险节点名称",
                name: "name",
                span: 24,
                placeholder: "请输入风险节点名称",
                options: {
                    initialValue: data.name,
                    rules: [{required: true, message: '风险节点名称不能为空'}],
                }
            },
            {
                type: "Input",
                label: "分值",
                name: "riskValue",
                span: 24,
                placeholder: "请输入数字，最多保留2位小数",
                options: {
                    initialValue: data.riskValue,
                    rules: [
                        {required: true, message: '分值不能为空'},
                        {pattern: /^0$|^[1-9]\d*$|^[1-9]\d*.\d{1,2}$|^0.\d{1,2}$/, message: "最多保留2位小数 如：1、1.0、0.88"}
                    ],
                }
            },
            {
                type: "TextArea",
                label: "信息描述",
                name: "informationDescription",
                span: 24,
                options: {
                    initialValue: data.informationDescription
                }
            },
            {
                type: "TextArea",
                label: "建议措施",
                name: "mitigatingMeasures",
                span: 24,
                options: {
                    initialValue: data.mitigatingMeasures
                }
            },
            {
                type: "TextArea",
                label: "备注",
                name: "memo",
                span: 24,
                options: {
                    initialValue: data.memo
                }
            },
            {
                type: "DynamicFieldSetCustom",
                name: "customKey",
                span: 24,
                data: rmItemRuleData,
                options: {
                    initialValue: data.customKey
                }
            }
        ];
        if( currentAction == "detail" ){
            arr.forEach(item => {
                item.disabled = true;
            });
        }
        return arr;
    }

    render(){
        const { readonly, table, modalOkBtnLoading, selectedRowKeys, currentAction, authorityList } = this.state;
        var btn1 = [
            { name: "查看", icon: "eye", onClick: this.detail }
        ];
        var btn2 = [
            { name: "新增", id: ADDRULE, icon: "plus-circle", onClick: this.add },
            { name: "修改", id: EDITRULE, icon: "edit", onClick: this.edit },
            { name: "删除", id: DELRULE, icon: "minus-circle", onClick: this.del }
        ].filter(item => isAuthority(item.id, this.props.authority));
        const tableOptions = {
            notCheck: false,
            table: table,
            columns: this.columns,
            scroll: {
                x: "max-content"
            },
            rowSelection: {
                selectedRowKeys,
                onChange: (selectedRowKeys, selectedRows) => { // 选中项发生变化时的回调
                    this.onChecked(selectedRowKeys, selectedRows);
                },
            },
            onChange: this.getList
        }
        // 增删改
        const commonBtnOptions = {
            shape: "round",
            size: "small"
        };
        // 模态框参数
        const modalOptions = {
            options: {
                title: "编辑",
                width: "600px",
                bodyStyle: {
                    height: "443px",
                    overflow: "auto"
                },
                okButtonProps: { loading: modalOkBtnLoading }
            },
            onRef: (ref) => {this.modal = ref},
            ok: this.submit.bind(this)
        };
        if( currentAction == "detail" ) modalOptions.options.footer = null;
        const formOptions = this.getFormOptions();
        return (
            <div className="mb20">
                <div className="risk-target-tit">
                    <div>风险因素节点规则</div>
                    <div className="buttons">
                        {readonly && authorityList && <CommonBtns options={commonBtnOptions} btns={btn1} />}
                        {!readonly && <CommonBtns options={commonBtnOptions} btns={btn2} />}
                    </div>
                </div>
                { authorityList && <CommonTable options={tableOptions} onChecked={this.onChecked} /> }
                { !authorityList && <div className="no-authority-box">无权限查看</div> }
                <CommonModal {...modalOptions}>
                    <div className="form-grid-7" style={{paddingLeft: "20px", paddingRight: "30px"}}>
                        <CommonForm options={formOptions} wrappedComponentRef={(form) => { if(form && form.props && form.props.form) this.form = form.props.form;}} />
                    </div>
                </CommonModal>
            </div>
        );
    }

}

class RmItemTable extends React.Component {
    
    constructor(props){
        super(props);
        this.state = {
            options: props.options,
            length: 0,
            btns: [
                { name: "保存", id: EDITMATRIX, icon: "save", onClick: this.submit },
                { name: "取消", id: EDITMATRIX, icon: "reload", onClick: this.cancel }
            ].filter(item => isAuthority(item.id, props.authority)),
            rmItemRuleMatrix: [],
            columns1: [],
            columns2: [],
            columns3: [],
            dataSource1: [],
            dataSource2: [],
            dataSource3: [],
            authorityList: isAuthority(DETAILMATRIX, props.authority),
        };
    }

    componentDidMount(){
        this.getRuleItem(this.props.options);
    }

    componentWillReceiveProps(nextProps){
        if( nextProps.options.id != this.state.options.id ){
            this.setState({options: nextProps.options});
            this.getRuleItem(nextProps.options);
        }
    }

    componentWillUnmount(){
        this.setState = (state, callback) => {
            return;
        };
    }

    submit = (callback) => {
        const reg = /^0$|^[1-9]\d*$|^[1-9]\d*.\d{1,2}$|^0.\d{1,2}$/;
        var values = this.state.rmItemRuleMatrix;
        for(var key in values){
            if( values[key] ){
                if( !reg.test(values[key]) ){
                    message.warning("请输入数字，最多保留2位小数 如：1、1.0、0.88");
                    return;
                }
            }
        }
        post({
            url: "rmItemRuleMatrix/updateRmItemRuleMatrix",
            data: {rmItemId: this.state.options.id, matrixValue: JSON.stringify(this.state.rmItemRuleMatrix)},
            btn: callback,
            success: data => {
                if( data.success ){
                    message.success("保存成功");
                }else{
                    message.errpr("保存失败");
                }
            }
        });
    }

    cancel = (callback) => {
        this.setState({
            rmItemRuleMatrix: {}
        });
        callback();
    }

    onChange = (e) => {
        var rmItemRuleMatrix = this.state.rmItemRuleMatrix;
        rmItemRuleMatrix[e.target.name] = e.target.value;
        this.setState({ rmItemRuleMatrix: rmItemRuleMatrix });
    }

    getDom(text){
        return <Input name={text} value={this.state.rmItemRuleMatrix[text]} onChange={this.onChange} autoComplete="off" />;
    }

    getRuleItem(options){
        post({
            url: "rmItem/loadRmItemTreeChildren",
            data: {parentId: options.id},
            success: data => {
                post({
                    url: "rmItemRuleMatrix/queryRmItemRuleMatrixListByRmItemId",
                    data: {rmItemId: options.id},
                    success: res => {
                        var rmItemRuleMatrix = {};
                        res.forEach(item => {
                            rmItemRuleMatrix[item.rowIndentifier] = item.matrixRowValue;
                        });
                        this.setState({
                            length: data.length,
                            rmItemRuleMatrix: rmItemRuleMatrix
                        });
                        switch(data.length){
                            case 0:
                            case 1:
                                break;
                            case 2:
                                var columns1 = [
                                    { title: "", dataIndex: 'label' },
                                    { title: data[0].name + "(低)", dataIndex: 'l', render: (text) => this.getDom(text) },
                                    { title: data[0].name + "(中)", dataIndex: 'm', render: (text) => this.getDom(text) },
                                    { title: data[0].name + "(高)", dataIndex: 'h', render: (text) => this.getDom(text) }
                                ];
                                var dataSource1 = [
                                    {label: data[1].name + "(低)", l: "LLL", m: "LLM", h: "LLH"},
                                    {label: data[1].name + "(中)", l: "LML", m: "LMM", h: "LMH"},
                                    {label: data[1].name + "(高)", l: "LHL", m: "LHM", h: "LHH"},
                                ];
                                this.setState({
                                    columns1: columns1,
                                    dataSource1: dataSource1
                                });
                                break;
                            case 3:
                                var columns1 = [
                                    { title: data[2].name + "(低)", dataIndex: 'label' },
                                    { title: data[0].name + "(低)", dataIndex: 'l', render: (text) => this.getDom(text) },
                                    { title: data[0].name + "(中)", dataIndex: 'm', render: (text) => this.getDom(text) },
                                    { title: data[0].name + "(高)", dataIndex: 'h', render: (text) => this.getDom(text) }
                                ];
                                var columns2 = [
                                    { title: data[2].name + "(中)", dataIndex: 'label' },
                                    { title: data[0].name + "(低)", dataIndex: 'l', render: (text) => this.getDom(text) },
                                    { title: data[0].name + "(中)", dataIndex: 'm', render: (text) => this.getDom(text) },
                                    { title: data[0].name + "(高)", dataIndex: 'h', render: (text) => this.getDom(text) }
                                ];
                                var columns3 = [
                                    { title: data[2].name + "(高)", dataIndex: 'label' },
                                    { title: data[0].name + "(低)", dataIndex: 'l', render: (text) => this.getDom(text) },
                                    { title: data[0].name + "(中)", dataIndex: 'm', render: (text) => this.getDom(text) },
                                    { title: data[0].name + "(高)", dataIndex: 'h', render: (text) => this.getDom(text) }
                                ];
                                var dataSource1 = [
                                    {label: data[1].name + "(低)", l: "LLL", m: "LLM", h: "LLH"},
                                    {label: data[1].name + "(中)", l: "LML", m: "LMM", h: "LMH"},
                                    {label: data[1].name + "(高)", l: "LHL", m: "LHM", h: "LHH"},
                                ];
                                var dataSource2 = [
                                    {label: data[1].name + "(低)", l: "MLL", m: "MLM", h: "MLH"},
                                    {label: data[1].name + "(中)", l: "MML", m: "MMM", h: "MMH"},
                                    {label: data[1].name + "(高)", l: "MHL", m: "MHM", h: "MHH"},
                                ];
                                var dataSource3 = [
                                    {label: data[1].name + "(低)", l: "HLL", m: "HLM", h: "HLH"},
                                    {label: data[1].name + "(中)", l: "HML", m: "HMM", h: "HMH"},
                                    {label: data[1].name + "(高)", l: "HHL", m: "HHM", h: "HHH"},
                                ];
                                this.setState({
                                    columns1: columns1,
                                    columns2: columns2,
                                    columns3: columns3,
                                    dataSource1: dataSource1,
                                    dataSource2: dataSource2,
                                    dataSource3: dataSource3
                                });
                                break;
                        }
                    }
                });
            }
        });
    }

    render(){
        const { authorityList } = this.state;
        const tableOptions1 = {
            notCheck: true,
            table: {dataList: this.state.dataSource1, loading: false},
            columns: this.state.columns1,
            needPage: false
        };
        const tableOptions2 = {
            notCheck: true,
            table: {dataList: this.state.dataSource2, loading: false},
            columns: this.state.columns2,
            needPage: false
        };
        const tableOptions3 = {
            notCheck: true,
            table: {dataList: this.state.dataSource3, loading: false},
            columns: this.state.columns3,
            needPage: false
        };
        return (
            <React.Fragment>
                {
                    (this.state.length >= 2 && this.state.length <= 3) && 
                    <React.Fragment>
                        <div className="buttons"><CommonBtns btns={this.state.btns} /></div>
                        { authorityList &&
                            <form>
                                <div className="mt15"><CommonTable options={tableOptions1} /></div>
                                {
                                    this.state.length == 3 && 
                                    <React.Fragment>
                                        <div className="mt15"><CommonTable options={tableOptions2} /></div>
                                        <div className="mt15 mb30"><CommonTable options={tableOptions3} /></div>
                                    </React.Fragment>
                                }
                            </form>
                        }
                        { !authorityList && <div className="no-authority-box">无权限查看</div> }
                    </React.Fragment>
                }
            </React.Fragment>
        );
    }

}

class RmItemTree extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            treeData: [],
            tip: "请输入节点名称",
            expandedKeys: [],
            searchValue: "",
            autoExpandParent: false,
            contextMenuOptions: {
                pageX: '',
                pageY: '',
                datas: null
            },
            contextMenuList: [
                {name: "添加", id: ADDTREE, click: this.onAddTreeNode},
                {name: "修改", id: EDITTREE, click: this.onEditTreeNode},
                {name: "删除", id: DELTREE, click: this.onDelTreeNode}
            ].filter(item => isAuthority(item.id, props.authority)),
            nodeData: {},
            currentAction: "",
            modalOkBtnLoading: false,
            authorityList: isAuthority(LISTTREE, props.authority),
        };
        this.modal;
        this.contextMenu;
        this.form;
    }

    componentDidMount(){
        this.init();
    }

    componentWillUnmount(){
        this.setState = (state, callback) => {
            return;
        };
    }

    init(){
        this.getRiskValue("root", data => this.setState({treeData: data, expandedKeys: []}));
    }

    getRiskValue(parentId, callback){
        post({
            url: "rmItem/loadRmItemTreeChildren",
            data: {parentId: parentId},
            success: data => {
                var arr = data.map(item => {
                    return {
                        title: item.name,
                        key: item.id,
                        isLeaf: item.isLeaf == "N" ? false : true,
                        datas: item,
                    };
                });
                callback && typeof callback == "function" && callback(arr);
            }
        });
    }

    onLoadData = node => {
        return new Promise(resolve => {
            if (node.props.children) {
                resolve();
                return;
            }
            this.getRiskValue(node.props.dataRef.key, data => {
                node.props.dataRef.children = data;
                this.setState({treeData:  [...this.state.treeData]});
                resolve();
            });
        });
    }

    onExpand = (expandedKeys, {expanded, node}) => {
        this.setState({
            expandedKeys: expandedKeys
        });
    }

    renderTreeNodes = data => data.map(item => {
        let { searchValue } = this.state;
        const index = item.title.indexOf(searchValue);
        const beforeStr = item.title.substr(0, index);
        const afterStr = item.title.substr(index + searchValue.length);
        let title = index == -1 ? item.title : (<React.Fragment>{beforeStr} <span className="text-danger">{searchValue}</span> {afterStr}</React.Fragment>);
        if(item.children) {
            return (
                <TreeNode title={title} key={item.key} isLeaf={item.isLeaf} dataRef={item}>
                    {this.renderTreeNodes(item.children)}
                </TreeNode>
            );
        }
        return <TreeNode title={title} key={item.key} isLeaf={item.isLeaf} dataRef={item}/>;
    });

    treeReplace(list, data, parentId){
        if( list ){
            list.forEach( item => {
                if( item.key == parentId ){
                    item.children = data;
                }else if( item.children ){
                    item.children = this.treeReplace(item.children, data, parentId);
                }
            });
        }
        return list;
    }

    onSearch(value){
        if( value ){
            let This = this;
            post({
                url: "rmItem/searchRmImte",
                data: {name: value},
                success: data => {
                    if( data ){
                        let { treeData } = this.state;
                        // 递归请求接口
                        var i = 0;
                        _ajaxRiskValue();
                        function _ajaxRiskValue(){
                            var id = data[i].id;
                            This.getRiskValue(id, res => {
                                treeData = This.treeReplace(treeData, res, id);
                                i++;
                                if( i < data.length ){
                                    _ajaxRiskValue();
                                }else{
                                    This.setState({
                                        treeData: treeData,
                                        expandedKeys: data.map((item) => {return item.id}),
                                        searchValue: value,
                                    });
                                }
                            });
                        }
                    }
                }
            });
        }else{
            message.warning(this.state.tip);
        }
    }

    onRightClick = (e) => {
        var data = e.node.props.dataRef.datas;
        this.setState({
            contextMenuOptions: {
                pageX: e.event.pageX,
                pageY: e.event.pageY,
                datas: e.node.props.dataRef.datas
            },
        });
        this.contextMenu.show();
    }

    onAddTreeNode = (datas) => {
        this.setState({
            nodeData: datas,
            currentAction: "add"
        });
        this.modal.show();
    }

    onEditTreeNode= (datas) => {
        this.setState({
            nodeData: datas,
            currentAction: "edit"
        });
        this.modal.show();
    }

    onDelTreeNode= (datas) => {
        this.setState({
            nodeData: datas,
            currentAction: "del"
        });
        var This = this;
        confirm({
            title: "确认删除选项吗？",
            onOk() {
                post({
                    url: "rmItem/deleteRmItemRreeCode",
                    data: {id: datas.id},
                    success: data => {
                        message.success("节点删除成功");
                        This.init();
                    }
                });
            }
        });
    }

    /**
     * 获取form表的配置
     */
    getFormOptions(){
        var data = this.state.currentAction == "edit" ? this.state.nodeData : {};
        return [
            {
                type: "Input",
                label: "节点名称",
                name: "name",
                span: 24,
                options: {
                    initialValue: data.name,
                    rules: [{required: true, message: '节点名称不能为空'}],
                }
            },
            {
                type: "Input",
                label: "节点编号",
                name: "code",
                span: 24,
                options: {
                    initialValue: data.code,
                    rules: [{required: true, message: '节点编号不能为空'}],
                }
            },
            {
                type: "InputExplain",
                label: "序号",
                name: "ordIdx",
                span: 24,
                explain: "序号从1开始",
                explainClassName: "form-explain",
                options: {
                    initialValue: data.ordIdx,
                    rules: [
                        {required: true, message: '序号不能为空'},
                        {validator: (rule, value, callback) => {
                            var reg = /^$|^0$|^[1-9]+\d*$/;
                            if( !reg.test(value.value) ){
                                callback("请输入正整数！");
                            }
                            callback();
                        }}
                    ],
                }
            },
            {
                type: "Select",
                label: "状态",
                name: "status",
                span: 24,
                list: [
                    {key: "E", text: "启用"},
                    {key: "D", text: "禁用"},
                ],
                options: {
                    initialValue: data.status,
                    rules: [{required: true, message: '请选择状态'}],
                },
                isHasAllSelect: false
            },
            {
                type: "Select",
                label: "是否叶子",
                name: "isLeaf",
                span: 24,
                list: [
                    {key: "Y", text: "是"},
                    {key: "N", text: "否"},
                ],
                options: {
                    initialValue: data.isLeaf,
                    rules: [{required: true, message: '请选择叶子'}],
                },
                isHasAllSelect: false
            }
        ];
    }

    submit = () => {
        this.setState({modalOkBtnLoading: true});
        this.form.validateFields((err, values) => {
            if( err ){
                this.setState({modalOkBtnLoading: false});
            }else{
                for(var key in values){
                    if( key == "ordIdx" ){
                        values[key] = values[key].value;
                    }
                }
                values = handleInParams(values);
                var url, msg;
                if( this.state.currentAction == "add" ){
                    values.id = this.state.nodeData.id;
                    url = "rmItem/addRmItemTreeCode";
                    msg = "添加成功";
                }else if( this.state.currentAction == "edit" ){
                    values.parentId = this.state.nodeData.parentId;
                    values.id = this.state.nodeData.id;
                    url = "rmItem/updateRmItemTreeCode";
                    msg = "修改成功";
                }
                post({
                    url: url,
                    data: values,
                    btn: () => this.setState({modalOkBtnLoading: false}),
                    success: data => {
                        message.success(msg);
                        this.modal.hide();
                        this.init();
                    }
                });
            }
        });
    }

    render() {
        const { authorityList } = this.state;
        const modalOptions =  {
            options: {
                title: "添加节点",
                okButtonProps: { loading: this.state.modalOkBtnLoading }
            },
            onRef: ref => {this.modal = ref},
            ok: this.submit.bind(this)
        }
        const formOptions = this.getFormOptions();
        const contextMenuOptions = {
            options: this.state.contextMenuOptions,
            list: this.state.contextMenuList,
            onRef: ref => {this.contextMenu = ref}
        }
        return (
            <React.Fragment>
                { authorityList && <Search placeholder={this.state.tip} onSearch={value => this.onSearch(value)} />}
                {
                    authorityList && 
                    <div className="search-tree">
                        <DirectoryTree 
                            loadData={this.onLoadData}
                            onExpand={this.onExpand}
                            onRightClick={this.onRightClick}
                            expandedKeys={this.state.expandedKeys}
                            loadedKeys={this.state.expandedKeys}
                            autoExpandParent={this.state.autoExpandParent}
                            onSelect={(selectedKeys, e) => this.props.getSelectedNodeData(e.node.props.dataRef.datas)}>
                            {this.renderTreeNodes(this.state.treeData)}
                        </DirectoryTree>
                    </div>
                }
                { !authorityList && <div className="no-authority-box">无权限查看</div> }
                <ContextMenu {...contextMenuOptions}></ContextMenu>
                <CommonModal {...modalOptions}>
                    <div className="form-grid-5">
                        <CommonForm options={formOptions} wrappedComponentRef={(form) => { if(form && form.props && form.props.form) this.form = form.props.form;}} />
                    </div>
                </CommonModal>
            </React.Fragment>
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
)(Form.create({ name: 'TreeForm' })(withRouter(RiskTarget)));

//export default Form.create({ name: 'TreeForm' })(withRouter(RiskTarget));