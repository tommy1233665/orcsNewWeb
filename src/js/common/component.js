import { withRouter, Link } from "react-router-dom";
import { message, Pagination, Table, Modal, Button, Badge, Drawer, Form, Row, Col, Input, Select, Upload, TreeSelect, Radio, DatePicker, Checkbox, Menu, Icon, Tooltip, Tag } from "antd";
import moment from 'moment';
import { post } from 'common/http';


const { Item } = Form;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
const InputGroup = Input.Group;
const { CheckableTag } = Tag;
const { confirm } = Modal;

/**
 * 系统功能按钮统一参数
 */
const commonBtnOpt = {
    queryOpt: {//查询
        type: "primary", icon: "search", htmlType: "submit"
    },
    resetOpt: {//重置
        icon: "reload"
    },
    addOpt: {//增加
        shape: "round", size: "small",
        type: "primary", icon: "plus-circle"
    },
    updateOpt: {//修改
        shape: "round", size: "small",
        icon: "edit"
    },
    delOpt: {//删除
        shape: "round", size: "small",
        type: "danger", icon: "minus-circle"
    },
    resetPwOpt: {//重置密码
        shape: "round", size: "small",
        type: "dashed", icon: "sync"
    },
    lockOpt: {//冻结
        shape: "round", size: "small",
        type: "dashed", icon: "lock"
    },
    unlockOpt: {//解冻
        shape: "round", size: "small",
        type: "dashed", icon: "unlock"
    },
    calculatorOpt: {//计算
        //shape: "round", size: "small",
        type: "primary",
        icon: "calculator"
    },
    listOpt: {//计算
        //shape: "round", size: "small",
        //type: "dashed",
        icon: "unordered-list"
    },
    noticeOpt: {//通知
        icon: "notification"
    },
    envitOpt: {//位置
        // icon: "environment"
    },
    saveOpt: {
        type: "primary", icon: "save",
    }
};

/**
 * 页面级权限路由控制
 */
class PermissionRouter extends React.Component {
    render() {
        if (this.props.location.pathname === "/") {
            return this.props.children;
        } else {
            return this.props.children;
        }
    }
}
const PageContainer = withRouter(PermissionRouter);

/**
 * tab
 * tabs:[{name\icon\checked:true/false\等(具体在回调里面需要什么传什么)}]
 * className
 * onClick: () => {}
 */
class CommonTabs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tabs: props.tabs,
            currentIndex: ""
        };
    }
    componentDidMount() {
        this.state.tabs.forEach((item, index) => {
            if (item.checked) {
                this.onTab(item, index);
            }
        });
    }
    onTab(tabData, i) {
        var { tabs, currentIndex } = this.state;
        if (i === currentIndex) { return }//重复点击相同tab不刷新
        var newTabs = tabs.map((tab, index) => {
            tab.checked = i == index ? true : false;
            return tab;
        });
        this.setState({ tabs: newTabs, currentIndex: i });
        // tabs改变时，调用父类onclick事件
        this.props.onClick && typeof this.props.onClick == "function" && this.props.onClick(tabData, i);
    }
    render() {
        const { tabs } = this.state;
        var className = "comm-tab ";
        if (this.props.className) className += this.props.className;
        return (
            <div className={className}>
                {
                    tabs.map((tab, index) =>
                        <Button
                            key={index}
                            icon={tab.icon ? tab.icon : ''}
                            className={tab.checked ? "tabs-checked" : "tabs-no-checked"}
                            onClick={this.onTab.bind(this, tab, index)}>
                            {tab.name}
                        </Button>
                    )
                }
            </div>
        );
    }
}

/**
 * 通用按钮组
 * options:{shape\size} //一组按钮相同属性
 * btns:[{name\icon\onClick}]
 */
class CommonBtns extends React.Component {
    constructor(props) {
        super(props);
        this.state = { btns: props.btns }
    }
    // 改变属性值
    changeAttribute(index, key, value) {
        this.state.btns.forEach((item, i) => {
            if (index == i) item[key] = value;
        });
        this.setState({ btns: this.state.btns });
    }
    onClick(btn, index) {
        this.changeAttribute(index, "disabled", true);
        btn.onClick && typeof btn.onClick == "function" && btn.onClick(() => {
            this.changeAttribute(index, "disabled", false);
        }, btn);
    }
    render() {
        return (
            <React.Fragment>
                {this.state.btns.map((btn, index) =>
                    <Button
                        key={index}
                        {...this.props.options}
                        type={btn.type}
                        icon={btn.icon}
                        disabled={btn.disabled}
                        onClick={this.onClick.bind(this, btn, index)}>
                        {btn.name}
                    </Button>
                )}
            </React.Fragment>
        );
    }
}

/**
 * 模态框
 * options:{title\footer:null\width\bodyStyle\okButtonProps等}
 * ok: () => {}
 * onRef: (ref) => {}
 * children
 */
class CommonModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = { visible: false, confirmLoading: false };
    }
    componentDidMount() {
        // 调用父组件方法把当前实例传给父组件
        if (this.props.onRef) this.props.onRef(this, "CommonModal");
    }
    show = () => {
        this.setState({ visible: true });
    }
    hide = () => {
        this.setState({ confirmLoading: false, visible: false });
        this.props && this.props.hide && this.props.hide();
    }
    ok = () => {
        this.setState({ confirmLoading: true });
        // 调用成功后，会返回一个关闭函数，用于手动关闭弹窗
        this.props.ok();
    }
    cancelConfirmLoading = () => {
        this.setState({ confirmLoading: false });
    }
    render() {
        const { visible, confirmLoading } = this.state;
        //弹窗参数(参考API)，绑定的按钮，显示的弹窗内容
        const { options, children } = this.props;
        return (
            <React.Fragment>
                <Modal
                    keyboard={true}
                    maskClosable={true}
                    destroyOnClose={true}
                    {...options}
                    visible={visible} //显示隐藏
                    confirmLoading={confirmLoading}
                    onOk={this.ok}
                    onCancel={this.hide}>
                    {children}
                </Modal>
            </React.Fragment>
        );
    }
}

/**
 * 抽屉
 * options:{title等}
 * onRef: (ref) => {}
 */
class CommonDrawer extends React.Component {
    constructor(props) {
        super(props);
        this.state = { visible: false };
    }
    componentDidMount() {
        // 调用父组件方法把当前实例传给父组件
        this.props.onRef(this, "CommonDrawer");
    }
    show = () => {
        this.setState({ visible: true });
    }
    hide = () => {
        this.setState({ visible: false });
    }
    render() {
        const { visible } = this.state;
        const { options, children } = this.props;
        const { title, width = 600, placement = "right", closable = false, maskStyle = { backgroundColor: "rgba(0,0,0,.6)" } } = options;
        return (
            <React.Fragment>
                <Drawer
                    visible={visible}
                    title={title}
                    width={width}
                    placement={placement}
                    closable={closable}
                    onClose={this.hide}
                    maskStyle={maskStyle}>
                    {children}
                </Drawer>
            </React.Fragment>
        );
    }
}

/**
 * 右键菜单
 * options:{pageX\pageY\datas},
 * list: [{name\click}],
 * onRef: (ref) => {}
 */
class ContextMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = { visible: false }
    }
    componentDidMount() {
        // 调用父组件方法把当前实例传给父组件
        if (this.props.onRef) this.props.onRef(this, "ContextMenu");
        var This = this;
        document.onclick = function () {
            if (This.state.visible) This.setState({ visible: false });
        };
    }
    show() {
        this.setState({ visible: true });
    }
    hide() {
        this.setState({ visible: false });
    }
    onClick(item, datas) {
        this.hide();
        item.click && item.click(datas);
    }
    render() {
        var { pageX, pageY, datas } = this.props.options;
        return (
            <React.Fragment>
                {
                    this.state.visible &&
                    <Menu className="context-menu" style={{ position: "fixed", top: pageY, left: pageX }}>
                        {this.props.list.map((item, index) => <Menu.Item key={index} onClick={this.onClick.bind(this, item, datas)}>{item.name}</Menu.Item>)}
                    </Menu>
                }
            </React.Fragment>
        );
    }
}

/**
 * 表单多选组件封装
 * value有些奇怪，有时是{value:[]}，有时直接是[]
 */
class CheckboxCustom extends React.Component {

    constructor(props) {
        super(props);
        const initialValue = props.options.options ? props.options.options.initialValue : null;
        this.state = {
            value: props.value || initialValue,
            indeterminate: true,
            checkAll: true
        };
    }

    componentWillReceiveProps(nextProps) {
        const { list, options } = nextProps.options;
        const { initialValue } = options;
        if (list.length > 0 && nextProps.value && nextProps.value.length > 0) {
            this.setState({
                value: nextProps.value,
                indeterminate: !!initialValue.length && initialValue.length < list.length,
                checkAll: initialValue.length === list.length,
            });
            this.triggerChange({ value: initialValue });
        }
    }

    triggerChange = (changedValue) => {
        const onChange = this.props.onChange;
        if (onChange) {
            onChange(Object.assign({}, this.state, changedValue));
        }
    }

    onChange = checkedList => {
        var value = checkedList;
        this.setState({
            value,
            indeterminate: !!checkedList.length && checkedList.length < this.props.options.list.length,
            checkAll: checkedList.length === this.props.options.list.length
        });
        this.triggerChange({ value: value });
    };

    onCheckAllChange = e => {
        var value = e.target.checked ? this.props.options.list.map(item => item.value) : [];
        this.setState({
            value,
            indeterminate: false,
            checkAll: e.target.checked
        });
        this.triggerChange({ value });
    };

    render() {
        const { list } = this.props.options;
        const { indeterminate, value, checkAll } = this.state;
        return (
            <div>
                <Checkbox.Group options={list} value={value} onChange={this.onChange} />
                <Checkbox indeterminate={indeterminate} onChange={this.onCheckAllChange} checked={checkAll}>全选</Checkbox>
            </div>
        )
    }
}

/**
 * 风险因素节点规则添加、修改里的题型
 */
class DynamicFieldSetCustom extends React.Component {
    constructor(props) {
        super(props);
        const symbols = [
            { name: "<", code: "lt" },
            { name: "<=", code: "lt_eq" },
            { name: "==", code: "eq" },
            { name: ">", code: "gt" },
            { name: ">=", code: "gt_eq" }
        ];
        var initialValue = (props.options.options && props.options.options.initialValue) ? props.options.options.initialValue : [];
        initialValue = initialValue.map((item) => {
            for (var i = 0; i < symbols.length; i++) {
                if (symbols[i].name == item.symbol) {
                    item.symbol = symbols[i].code;
                }
            }
            return item;
        });
        this.state = {
            symbols: symbols,
            value: props.value ? props.value : initialValue
        }
    }
    componentDidMount() {
        if (this.state.value && this.state.value != {}) this.triggerChange({ value: this.state.value });
    }
    triggerChange = (changedValue) => {
        const onChange = this.props.onChange;
        if (onChange) {
            onChange(Object.assign({}, this.state, changedValue));
        }
    }
    onChange = (val, index, name) => {
        var value = this.state.value;
        value[index][name] = val;
        this.setState({ value });
        this.triggerChange({ value });
    }
    onAdd() {
        var value = this.state.value;
        value.push({});
        this.setState({ value: value });
    }
    onDel(index) {
        var value = this.state.value;
        value.splice(index, 1);
        this.setState({ value: value });
    }
    render() {
        var disabled = this.props.options.disabled;
        return (
            <div className="form-dynamicFieldSet">
                <div className="top">
                    <div>点击添加风险节点规则条件</div>
                    <Button type="primary" onClick={this.onAdd.bind(this)} disabled={disabled}>+</Button>
                </div>
                <div>
                    {
                        this.state.value && this.state.value.map((item, index) => {
                            return (
                                <InputGroup key={index} className="item" compact >
                                    <Select onChange={(value) => this.onChange(value, index, "ruleItem")} value={item.ruleItem} disabled={disabled}>
                                        {this.props.options.data.ruleItemList.map((item, index) => <Option key={index} value={item.code}>{item.name}</Option>)}
                                    </Select>
                                    <Select onChange={(value) => this.onChange(value, index, "symbol")} value={item.symbol} defaultValue={this.state.symbols[0].code} disabled={disabled}>
                                        {this.state.symbols.map((item, index) => <Option key={index} value={item.code}>{item.name}</Option>)}
                                    </Select>
                                    <Tooltip title={item.setValue}>
                                        <Input onChange={(e) => this.onChange(e.target.value, index, "setValue")} value={item.setValue} disabled={disabled} />
                                    </Tooltip>
                                    <Button onClick={() => this.onDel(index)} disabled={disabled}>删除</Button>
                                </InputGroup>
                            )
                        })
                    }
                </div>
            </div>
        );
    }
}

/**
 * 表单输入加说明组件封装
 */
class InputExplainFrom extends React.Component {
    constructor(props) {
        super(props);
        var initialValue = props.options.options ? props.options.options.initialValue : null;
        this.state = {
            value: props.value || initialValue
        }
    }
    componentDidMount() {
        if (this.state.value && this.state.value != {}) this.triggerChange({ value: this.state.value });
    }
    triggerChange = (changedValue) => {
        const onChange = this.props.onChange;
        if (onChange) {
            onChange(Object.assign({}, this.state, changedValue));
        }
    }
    onChange = (e) => {
        const value = e.target.value;
        this.setState({ value });
        this.triggerChange({ value });
    }
    render() {
        const obj = this.props.options;
        var width = obj.explain ? (obj.explain.length + 1) + "em" : obj.isHelp ? "19px" : 0;
        return (
            <React.Fragment>
                <Input onChange={this.onChange} value={this.state.value} placeholder={obj.placeholder} style={{ width: 'calc( 100% - ' + width + ')' }} />
                { obj.isHelp && <Tooltip title={obj.isHelp}><Icon type="question-circle" style={{ marginLeft: "5px" }} /></Tooltip>}
                { !obj.isHelp && obj.explain && <span className={obj.explainClassName} style={{ width: width }}>{obj.explain}</span>}
            </React.Fragment>
        )
    }
}

/**
 * 表单输入加按钮组件封装
 */
class GroupCustom extends React.Component {
    constructor(props) {
        super(props);
        var initialValue = props.options.options ? props.options.options.initialValue : null;
        this.state = {
            value: props.value || initialValue,
            modalOkBtnLoading1: false,
            modalOkBtnLoading2: false,
            modalOkBtnLoading3: false,
            modalOkBtnLoading4: false,
            groupTypes: [],
            groups: [],
            groupContent: [],
            selectedTags: [],
            groupTypesParams: '',
            editGroupContent: ''
        };
        this.modal1;
        this.modal2;
        this.modal3;
        this.modal4;
        this.form1;
        this.form2;
        this.form4;
    }
    componentDidMount() {
        if (this.state.value && this.state.value != {}) this.triggerChange({ value: this.state.value });
    }
    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        };
    }
    triggerChange = (changedValue) => {
        const onChange = this.props.onChange;
        if (onChange) {
            onChange(Object.assign({}, this.state, changedValue));
        }
    }
    onChange = (e) => {
        const value = e.target.value;
        this.setState({ value });
        this.triggerChange({ value });
    }

    // 配置群组弹窗默认页
    getSelectGroupOptions() {
        const { groupTypes, groups, groupContent, groupTypesParams } = this.state;
        return [
            {
                type: "Select",
                label: "群组类别",
                name: "groupTableType",
                list: groupTypes,
                span: 24,
                length: 5,
                isHasAllSelect: false,
                disabled: true,
                options: {
                    initialValue: groupTypes.length > 0 ? groupTypes[0].key : groupTypesParams,
                    rules: [
                        { required: true, message: '群组类别不能为空' }
                    ]
                },
                onSelect: (value, options) => {
                    this.getGroupList(options.props.children);
                }
            },
            {
                type: "Select",
                label: "群组名称",
                name: "groupTableName",
                list: groups,
                span: 24,
                length: 5,
                isHasAllSelect: false,
                options: {
                    // initialValue: groups,
                    rules: [
                        { required: true, message: '群组名称不能为空' }
                    ]
                },
                onSelect: (value, options) => {
                    this.getGroupContent(options.props.children);
                }
            },
            {
                type: "TextArea",
                label: "群组内容",
                name: "groupTableContent",
                span: 24,
                length: 5,
                placeholder: "请填入机组员工号，多个员工号用英文分号;隔开，如：200123,200124,200125",
                disabled: true,
                options: {
                    initialValue: groupContent
                }
            }
        ];
    }
    // 获取新增时组件配置
    getAddGroupOptions() {
        const { groupTypes, editGroupContent, groupTypesParams } = this.state;
        return [
            {
                type: "Select",
                label: "群组类别",
                name: "groupTableType",
                list: groupTypes,
                span: 24,
                length: 5,
                isHasAllSelect: false,
                disabled: true,
                options: {
                    initialValue: groupTypes.length > 0 ? groupTypes[0].key : groupTypesParams,
                    rules: [
                        { required: true, message: '群组类别不能为空' }
                    ]
                }
            },
            {
                type: "Input",
                label: "群组名称",
                name: "groupTableName",
                span: 24,
                length: 5,
                options: {
                    rules: [
                        { required: true, message: '群组名称不能为空' }
                    ]
                }
            },
            {
                type: "TextArea",
                label: "群组内容",
                name: "groupTableContent",
                span: 24,
                length: 5,
                placeholder: "多个用英文分号;隔开",
                options: {
                    initialValue: editGroupContent
                }
            }
        ];
    }
    // 获取修时组件配置
    getEditGroupOptions() {
        const { groupTypes, groups, editGroupContent, groupTypesParams } = this.state;
        return [
            {
                type: "Select",
                label: "群组类别",
                name: "groupTableType",
                list: groupTypes,
                span: 24,
                length: 5,
                isHasAllSelect: false,
                disabled: true,
                options: {
                    initialValue: groupTypes.length > 0 ? groupTypes[0].key : groupTypesParams,
                    rules: [
                        { required: true, message: '群组类别不能为空' }
                    ]
                }
            },
            {
                type: "Select",
                label: "群组名称",
                name: "groupTableId",
                list: groups,
                span: 24,
                length: 5,
                isHasAllSelect: false,
                options: {
                    rules: [
                        { required: true, message: '群组名称不能为空' }
                    ]
                },
                onSelect: (value, options) => {
                    this.editGroupContent(options.props.children);
                }
            },
            {
                type: "TextArea",
                label: "群组内容",
                name: "groupTableContent",
                span: 24,
                length: 5,
                placeholder: "请填入机组员工号，多个员工号用英文分号;隔开，如：200123,200124,200125",
                options: {
                    initialValue: editGroupContent
                }
            }
        ];
    }

    // 获取群组类型数据
    // getGroupTypeList(callback) {
    //     post({
    //         url: "dailyAssociateRisk/queryGroupTableInfo",
    //         data: { variableTemp: this.props.options.variableTemp },
    //         success: res => {
    //             var groupTypes = res.map(item => {
    //                 return {
    //                     key: item.groupTableId,
    //                     text: item.groupTableName
    //                 };
    //             });
    //             this.setState({ groupTypes });
    //             if (groupTypes.length > 0) {
    //                 this.getGroupList(groupTypes[0].text);
    //             } else {
    //                 let variableTemp = this.props.options.variableTemp
    //                 console.log(variableTemp)
    //                 let params = ''
    //                 switch (this.props.options.variableTemp) {
    //                     case "fltCrew":
    //                         params = '机组'
    //                         break;
    //                     case "latestTailNr":
    //                         params = '机尾号'
    //                         break;
    //                     case "arpName":
    //                         params = '机场'
    //                         break;
    //                     case "fltNr":
    //                         params = '航班号'
    //                         break;
    //                 }
    //                 this.getGroupList(params);
    //             }
    //             callback && typeof callback == "function" && callback(res);
    //         }
    //     });
    // }
    // 获取群组名称
    getGroupList(typeName) {
        post({
            url: "dailyAssociateRisk/queryGroupTableInfoByType",
            data: { tableType: typeName },
            success: res => {
                var groups = res.map(item => {
                    return {
                        key: item.groupTableId,
                        text: item.groupTableName
                    };
                });
                this.setState({ groups });
            }
        });
    }
    // 获取群组内容
    getGroupContent(name) {
        console.log('getGroupContent')
        post({
            url: "dailyAssociateRisk/queryGroupTableInfoByName",
            data: { tableName: name },
            success: res => {
                var groupContent = res;
                this.setState({ groupContent });
            }
        });
    }
    // 编辑获取群组内容
    editGroupContent(name) {
        console.log('editGroupContent')
        post({
            url: "dailyAssociateRisk/queryGroupTableInfoByName",
            data: { tableName: name },
            success: res => {
                var editGroupContent = res
                this.setState({ editGroupContent });
            }
        });
    }
    submit1 = () => {
        this.setState({ modalOkBtnLoading1: true });
        this.form1.validateFields((err, values) => {
            if (err) {
                this.setState({ modalOkBtnLoading1: false });
            } else {
                var value = this.state.value;
                var groupTableName = this.state.groups.find((item) => {
                    return (item.key == values.groupTableName);
                }).text;
                switch (this.props.options.variableTemp) {
                    case "fltCrew":
                        value = value ? value + ",C-" + groupTableName : "C-" + groupTableName;
                        break;
                    case "latestTailNr":
                        value = value ? value + ",R-" + groupTableName : "R-" + groupTableName;
                        break;
                    case "arpName":
                        value = value ? value + ",A-" + groupTableName : "A-" + groupTableName;
                        break;
                    case "fltNr":
                        value = value ? value + ",N-" + groupTableName : "N-" + groupTableName;
                        break;
                }
                this.setState({ value });
                this.triggerChange({ value });
                this.setState({ modalOkBtnLoading1: false });
                message.success("选择群组成功！");
                this.modal1.hide();
            }
        });
    }

    // 配置新增群组
    submit2 = () => {
        this.setState({ modalOkBtnLoading2: true });
        this.form2.validateFields((err, values) => {
            if (err) {
                this.setState({ modalOkBtnLoading2: false });
            } else {
                // var groupTableType = this.state.groupTypes.find((item) => {
                //     return (item.key == values.groupTableType);
                // }).text;
                // values.groupTableType = groupTableType;
                post({
                    url: "dailyAssociateRisk/addGroupTableInfo",
                    data: values,
                    btn: () => this.setState({ modalOkBtnLoading2: false }),
                    success: data => {
                        if (data.success) {
                            message.success("添加成功");
                            this.modal2.hide();
                            // 更新group数据
                            var params = ''
                            switch (this.props.options.variableTemp) {
                                case "fltCrew":
                                    params = '机组'
                                    break;
                                case "latestTailNr":
                                    params = '机尾号'
                                    break;
                                case "arpName":
                                    params = '机场'
                                    break;
                                case "fltNr":
                                    params = '航班号'
                                    break;
                            }
                            this.getGroupList(params);
                            // this.getGroupList(this.state.groupTypes[0].text);
                            // if (this.state.groupTypes.length > 0) {
                            //     this.getGroupList(this.state.groupTypes[0].text);
                            // }
                        }
                    }
                });
            }
        });
    }

    // 删除群组配置
    submit3 = () => {
        const This = this;
        const groupTableIds = This.state.selectedTags;
        if (This.state.selectedTags.length == 0) {
            message.warning("请选择需要删除的群组！");
            return;
        }
        confirm({
            title: "确认删除选中的群组吗？",
            onOk() {
                post({
                    url: "dailyAssociateRisk/deleteGroupTableInfo",
                    data: { groupTableIds: groupTableIds },
                    btn: () => This.setState({ modalOkBtnLoading3: false, selectedTags: [] }),
                    success: data => {
                        if (data.success) {
                            message.success("删除成功");
                            // 更新group数据
                            var params = This.form1.getFieldsValue();
                            if (groupTableIds.indexOf(params.groupTableName) > -1) {
                                params.groupTableName = "";
                                params.groupTableContent = "";
                                This.form1.setFieldsValue(params);
                            }
                            // if (This.state.groupTypes.length > 0) {
                            //     This.getGroupList(This.state.groupTypes[0].text);
                            // }
                            // 更新group数据
                            var params = ''
                            switch (This.props.options.variableTemp) {
                                case "fltCrew":
                                    params = '机组'
                                    break;
                                case "latestTailNr":
                                    params = '机尾号'
                                    break;
                                case "arpName":
                                    params = '机场'
                                    break;
                                case "fltNr":
                                    params = '航班号'
                                    break;
                            }
                            This.getGroupList(params);
                            This.modal3.hide();
                        }
                    }
                })
            }
        });
    }
    submit4 = () => {
        this.setState({ modalOkBtnLoading4: true });
        this.form4.validateFields((err, values) => {
            if (err) {
                this.setState({ modalOkBtnLoading4: false });
            } else {
                delete values.groupTableType;
                post({
                    url: "dailyAssociateRisk/updateGroupTableInfo",
                    data: values,
                    btn: () => this.setState({ modalOkBtnLoading4: false }),
                    success: data => {
                        if (data.success) {
                            message.success("修改成功");
                            this.modal4.hide();
                            // 更新group数据
                            var params = this.form1.getFieldsValue();
                            if (params.groupTableName == values.groupTableId) {
                                params.groupTableContent = values.groupTableContent;
                                this.form1.setFieldsValue(params);
                            }
                            this.setState({ groupContent: [], editGroupContent: [] })
                        }
                    }
                });
            }
        });
    }
    changeDate = () => {
        this.setState({ editGroupContent: [] })
    }
    onClick = () => {
        var params = ''
        switch (this.props.options.variableTemp) {
            case "fltCrew":
                params = '机组'
                break;
            case "latestTailNr":
                params = '机尾号'
                break;
            case "arpName":
                params = '机场'
                break;
            case "fltNr":
                params = '航班号'
                break;
        }
        this.getGroupList(params);
        this.setState({ groupContent: [], groupTypesParams: params });
        this.modal1.show();
        // this.getGroupTypeList((res) => {
        //     this.modal1.show();
        // });
    }
    handleChange(item, checked) {
        const { selectedTags } = this.state;
        const nextSelectedTags = checked ? [...selectedTags, item.key] : selectedTags.filter(t => t !== item.key);
        this.setState({ selectedTags: nextSelectedTags });
    }
    render() {
        const { modalOkBtnLoading1, modalOkBtnLoading2, modalOkBtnLoading3, modalOkBtnLoading4, value, groups, selectedTags } = this.state;
        const obj = this.props.options;
        var text = "群组", width = "65px", widthL = "5px";
        const modalOptions1 = {
            options: {
                title: "选择群组",
                okButtonProps: { loading: modalOkBtnLoading1 }
            },
            onRef: (ref) => { this.modal1 = ref },
            ok: this.submit1.bind(this)
        }
        const modalOptions2 = {
            options: {
                title: "新建群组",
                okButtonProps: { loading: modalOkBtnLoading2 }
            },
            onRef: (ref) => { this.modal2 = ref },
            ok: this.submit2.bind(this)
        }
        const modalOptions3 = {
            options: {
                title: "删除群组",
                okButtonProps: { loading: modalOkBtnLoading3 }
            },
            onRef: (ref) => { this.modal3 = ref },
            ok: this.submit3.bind(this)
        }
        const modalOptions4 = {
            options: {
                title: "修改群组",
                okButtonProps: { loading: modalOkBtnLoading4 }
            },
            onRef: (ref) => { this.modal4 = ref },
            ok: this.submit4.bind(this),
            hide: this.changeDate.bind(this)
        }
        const selectGroupOptions = this.getSelectGroupOptions();
        const addGroupOptions = this.getAddGroupOptions();
        const editGroupOptions = this.getEditGroupOptions();
        return (
            <React.Fragment>
                <Tooltip title={obj.tooltip}>
                    <Input onChange={this.onChange} value={value} placeholder={obj.placeholder} style={{ width: 'calc( 100% - ' + width + ' - ' + widthL + ')' }} />
                </Tooltip>
                <Button className="btn-GroupCustom" style={{ width: width, marginLeft: widthL }} onClick={this.onClick.bind(this)}>{text}</Button>
                <CommonModal {...modalOptions1}>
                    <CommonForm options={selectGroupOptions} wrappedComponentRef={(form) => { if (form && form.props && form.props.form) this.form1 = form.props.form }} />
                    <Button onClick={() => this.modal2.show()}>配置新群组</Button>
                    <Button className="ml10" onClick={() => this.modal4.show()}>修改群组</Button>
                    <Button className="ml10" onClick={() => this.modal3.show()}>删除群组</Button>
                </CommonModal>
                <CommonModal {...modalOptions2}>
                    <CommonForm options={addGroupOptions} wrappedComponentRef={(form) => { if (form && form.props && form.props.form) this.form2 = form.props.form }} />
                </CommonModal>
                <CommonModal {...modalOptions4}>
                    <CommonForm options={editGroupOptions} wrappedComponentRef={(form) => { if (form && form.props && form.props.form) this.form4 = form.props.form }} />
                </CommonModal>
                <CommonModal {...modalOptions3}>
                    <div className="form-GroupCustom-delModal">
                        {
                            groups.map((item, i) => {
                                var colors = ["magenta", "red", "#f50"];
                                return (
                                    <CheckableTag key={i}
                                        checked={selectedTags.indexOf(item.key) > -1}
                                        onChange={checked => this.handleChange(item, checked)}>
                                        {item.text}
                                    </CheckableTag>
                                )
                            })
                        }
                    </div>
                </CommonModal>
            </React.Fragment>
        )
    }
}

class TreeSelectCustom extends React.Component {
    constructor(props) {
        super(props);
        var initialValue = props.options.options && props.options.options.initialValue ? props.options.options.initialValue : {};
        this.state = {
            value: props.value || initialValue,
            treeData: [],
            radioList: [
                { key: "peformanceType", text: "按性能机型", url: "acfData/performanceTypeComboTree" },
                { key: "acftType", text: "按动态机型", url: "newAcftType/comboTree" }
            ]
        }
    }
    componentDidMount() {
        const { value } = this.state;
        if (value.eqpType) {
            if (this.state.treeData.length == 0) {
                this.onRadioChange({ target: { value: value.eqpType } });
            }
        } else {
            if (this.state.treeData.length == 0) {
                this.onRadioChange({ target: { value: "peformanceType" } });
            }
        }
        if (value && value != {}) this.triggerChange({ value });
    }
    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        };
    }
    triggerChange = (changedValue) => {
        const onChange = this.props.onChange;
        if (onChange) {
            onChange(Object.assign({}, this.state, changedValue));
        }
    }

    onChange = (value, label, extra) => {
        var value = this.state.value;
        value.acftType = label[0];
        this.setState({ value });
        this.triggerChange({ value });
    }
    onRadioChange = (e) => {
        var value = this.state.value;
        if (this.state.treeData.length > 0) value.acftType = "";
        value.eqpType = e.target.value;
        this.setState({ value });
        this.triggerChange({ value });
        var url = this.state.radioList.find((item) => { return item.key == e.target.value }).url;
        post({
            url: url,
            success: data => {
                if (data) this.setState({ treeData: JSON.parse(data) });
            }
        });
    }
    handleData(list) {
        var arr = [];
        for (var i = 0; i < list.length; i++) {
            var obj = {
                title: list[i].text,
                value: list[i].id,
                key: list[i].id
            };
            if (list[i].children) obj.children = this.handleData(list[i].children)
            arr.push(obj);
        }
        return arr;
    }
    render() {
        var treeData = this.handleData(this.state.treeData);
        var { detailSpan = [12, 12] } = this.props.options;
        return (
            <React.Fragment>
                <Row gutter={24} className="form-treeSelectCustom">
                    <Col span={detailSpan[0]}>
                        <TreeSelect onChange={this.onChange} value={this.state.value.acftType} dropdownStyle={{ maxHeight: 400, overflow: 'auto' }} treeData={treeData} />
                    </Col>
                    <Col span={detailSpan[1]}>
                        <Radio.Group onChange={this.onRadioChange} value={this.state.value.eqpType}>
                            {this.state.radioList.map((item, i) => <Radio key={i} value={item.key}>{item.text}</Radio>)}
                        </Radio.Group>
                    </Col>
                </Row>
            </React.Fragment>
        );
    }
}

//风险项按钮新增 url: "airLineRisk/getAllRiskTabs"
class RiskTabsCustom extends React.Component {
    constructor(props) {
        super(props);
        var initialValue = props.options.options && props.options.options.initialValue ? props.options.options.initialValue : {};
        this.state = {
            value: props.value || initialValue,
            treeData: []
        }

    }
    componentDidMount() {
        const { value } = this.state;
        this.getAllRiskTabs(data => {
            this.setState({ riskTabsList: data });
            this.setState({ treeData: JSON.parse(data) });
        });
        if (value && value != {}) this.triggerChange({ value });
    }

    getAllRiskTabs(callback) {
        post({
            url: "airLineRisk/getAllRiskTabs",
            success: data => {
                callback && callback(data);
            }
        });
    }

    componentWillUnmount() {

        this.setState = (state, callback) => {
            return;
        };
    }

    triggerChange = (changedValue) => {
        const onChange = this.props.onChange;
        if (onChange) {
            onChange(Object.assign({}, this.state, changedValue));
        }
    }
    onChange = (value, label, extra) => {
        var value = this.state.value;
        // value.acftType = label[0];
        this.setState({ value });
        this.triggerChange({ value });
    }

    handleData(list) {
        var arr = [];
        for (var i = 0; i < list.length; i++) {
            var obj = {
                title: list[i].text,
                value: list[i].id,
                key: list[i].id
            };
            if (list[i].children) obj.children = this.handleData(list[i].children)
            arr.push(obj);
        }
        return arr;
    }

    render() {
        var treeData = this.handleData(this.state.treeData);
        var { detailSpan = [36, 36] } = this.props.options;
        return (
            <React.Fragment>
                <Row gutter={24} className="form-treeSelectCustom">
                    <Col span={detailSpan[0]}>
                        <TreeSelect onChange={this.onChange} dropdownStyle={{ maxHeight: 400, overflow: 'auto' }} treeData={treeData} />
                    </Col>
                </Row>
            </React.Fragment>
        );
    }
}



class InputCheckboxCustom extends React.Component {
    constructor(props) {
        super(props);
        var initialValue = props.options.options && props.options.options.initialValue ? props.options.options.initialValue : {};
        this.state = {
            value: props.value || initialValue,
        }
    }
    componentDidMount() {
        if (this.state.value && this.state.value != {}) this.triggerChange({ value: this.state.value });
    }
    triggerChange = (changedValue) => {
        const onChange = this.props.onChange;
        if (onChange) {
            onChange(Object.assign({}, this.state, changedValue));
        }
    }
    onChange = (e) => {
        const value = this.state.value;
        value.riskValue = e.target.value;
        value.presentation = false;
        this.setState({ value });
        this.triggerChange({ value });
    }
    onCheckedChange = (e) => {
        const value = this.state.value;
        value.presentation = e.target.checked;
        // if (e.target.checked) value.riskValue = '0.0';
        value.riskValue = e.target.checked === false ? '' : '0.0'
        this.setState({ value });
        this.triggerChange({ value });
    }
    render() {
        var obj = this.props.options;
        return (
            <React.Fragment>
                <Row type="flex" justify="start">
                    <Col span={17}>
                        <Input onChange={this.onChange} value={this.state.value.riskValue} placeholder={obj.placeholder} disabled={this.state.value.presentation ? true : false} />
                    </Col>
                    <Col span={5} offset={1}>
                        <Checkbox defaultChecked={this.state.value.presentation} onChange={this.onCheckedChange}>提示</Checkbox>
                    </Col>
                </Row>
            </React.Fragment>
        );
    }
}

class MultipleSelect extends React.Component {
    constructor(props) {
        super(props);
        var initialValue = props.options.options && props.options.options.initialValue ? props.options.options.initialValue : [];
        this.state = {
            value: (props.value && props.value.value) ? props.value.value : props.value || initialValue,
        }
    }
    componentWillReceiveProps(nextProps) {
        var nextValue = nextProps ? nextProps.value ? nextProps.value.value ? nextProps.value.value : nextProps.value : [] : [];
        var value = this.props.value ? this.props.value.value ? this.props.value.value : this.props.value : [];
        if (nextValue.sort().toString() !== value.sort().toString()) {
            this.setState({ value: nextValue });
        }
    }
    triggerChange = (changedValue) => {
        const onChange = this.props.onChange;
        if (onChange) {
            onChange(Object.assign({}, this.state, changedValue));
        }
    }
    onSelect = (val) => {
        var { list, onSelect } = this.props.options;
        var value = this.state.value;
        if (val == "全部") {
            value = list.map(item => item.key == "全部" ? "" : item.key);
            //value = list.map(item => item.key);
        } else {
            value.push(val);
        }
        this.setState({ value });
        this.triggerChange({ value });
        // 为了值影响下一个的list
        onSelect && typeof onSelect == "function" && onSelect(value);
    }
    onDeselect = (val) => {
        var { onDeselect } = this.props.options;
        var value = this.state.value;
        if (val == "全部") {
            value = [];
        } else {
            value.splice(value.indexOf(val), 1);
            if (value.indexOf("全部") > -1) {
                value.splice(value.indexOf("全部"), 1);
            }
        }
        this.setState({ value });
        this.triggerChange({ value });
        // 为了值影响下一个的list
        onDeselect && typeof onDeselect == "function" && onDeselect(value);
    }
    render() {
        var obj = this.props.options;
        if (obj.isHasAllSelect) {
            var flag = false;
            obj.list.find(item => {
                if (item.key == "全部") {
                    flag = true;
                }
            });
            if (!flag) obj.list.unshift({ key: "全部", text: "全部" });
        }
        return (
            <Select mode="multiple" onSelect={this.onSelect} onDeselect={this.onDeselect} value={this.state.value} disabled={obj.disabled} >
                {obj.list.map((item, i) => <Option key={i} value={item.key}>{item.text}</Option>)}
            </Select>

        );
    }
}

class UploadFileCustom extends React.Component {
    constructor(props) {
        super(props);
        var initialValue = props.options.options ? props.options.options.initialValue : null;
        var value = (props.value || initialValue) ? (props.value || initialValue).split(",") : [];
        this.state = {
            value: value,
            uploading: false,
            fileList: []
        }
    }

    getDefaultFileList(names) {
        if (names.length == 0) return [];
        if (names.length > 0) {
            var arr = [];
            names.forEach((name, i) => {
                arr.push({
                    name: name,
                    url: window.g_url + "js/pdfjs/web/viewer.html?file=" + encodeURIComponent(window.g_url + "dailyAssociateRisk/pdfStreamHandeler?fileName=" + name),
                    uid: i,
                    status: 'done',
                    reponse: 'Server Error 500'
                })
            });
            return arr;
        }
    }

    componentDidMount() {
        if (this.state.value) {
            this.setState({
                value: this.state.value,
                fileList: this.getDefaultFileList(this.state.value)
            });
            this.triggerChange({ value: this.state.value.join(",") });
        }
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        };
    }

    triggerChange = (changedValue) => {
        const onChange = this.props.onChange;
        if (onChange) {
            onChange(Object.assign({}, this.state, changedValue));
        }
    }

    uploadPdf(value, successCallback, errorCallback) {
        const formData = new FormData();
        formData.append('file', value);
        post({
            url: "dailyAssociateRisk/uploadPdfFiles",
            data: formData,
            isUpload: true,
            success: (data) => {
                message.success(value.name + '上传成功！');
                successCallback && typeof successCallback == "function" && successCallback();
            },
            error: (data) => {
                this.setState({
                    uploading: false,
                });
                message.error(value.name + '上传失败！');
                errorCallback && typeof errorCallback == "function" && errorCallback();
            }
        });
    }

    setValue(newValue) {
        this.setState({
            value: newValue,
            uploading: false,
            fileList: this.getDefaultFileList(newValue),
        });
        this.triggerChange({ value: newValue.join(",") })
    }

    handleUpload = () => {
        const This = this;
        const { fileList } = this.state;
        var fileListOld = fileList.filter(item => item.url);
        var fileListNew = fileList.filter(item => !item.url);
        if (fileListNew.length == 0) {
            message.warning("请至少选择一个文件！");
            return;
        }
        // 递归上传pdf
        var i = 0;
        _uploadPdf();
        function _uploadPdf() {
            This.uploadPdf(fileListNew[i], () => {
                i++;
                if (i < fileListNew.length) {
                    _uploadPdf();
                } else {
                    var newValue = fileList.map(item => item.name);
                    This.setValue(newValue);
                }
            }, () => {
                var newValue = fileListOld.concat(fileListNew.filter((item, j) => j < i)).map(item => item.name);
                This.setValue(newValue);
            });
        }
    };

    render() {
        const { uploading, fileList } = this.state;
        var fileListNew = fileList.filter(item => !item.url);
        const props = {
            multiple: true,
            onRemove: file => {
                this.setState(state => {
                    const index = state.fileList.indexOf(file);
                    const newFileList = state.fileList.slice();
                    newFileList.splice(index, 1);
                    const newValue = newFileList.map(item => item.name);
                    if (file.url) {
                        this.triggerChange({ value: newValue.join(",") });
                        return {
                            fileList: newFileList,
                            value: newValue
                        }
                    } else {
                        return {
                            fileList: newFileList,
                        };
                    }
                });
            },
            beforeUpload: file => {
                const isType = file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.type == 'application/msword';
                if (!isType) {
                    message.warning('只能上传pdf和word格式的文件!');
                }
                const isLt2M = file.size / 1024 / 1024 < 2;
                if (!isLt2M) {
                    message.warning('文件必须小于2MB!');
                }
                if (isType && isLt2M) {
                    this.setState(state => ({
                        fileList: [...state.fileList, file],
                    }));
                }
                return false;
            },
            fileList
        };
        return (
            <div className="form-uploadFileCustom">
                <Upload {...props}>
                    <Button><Icon type="upload" />选择文件</Button>
                </Upload>
                <Button className="btn-upload" type="primary" onClick={this.handleUpload} disabled={fileListNew.length === 0} loading={uploading} >
                    {uploading ? '上传中' : '上传文件'}
                </Button>
            </div>
        );
    }
}

/**
 * 通用form配置
 * options:[{题型配置}]
 * btnOptions:{aligin\span\list[{text\options\event}]}
 */
class commForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            optionsAllChecked: {
                indeterminate: false,
                checkAll: true
            }
        }
    }
    onChange = e => {
        this.setState({
            checkedList: e.target.checked ? this.props.options.list : [],
            indeterminate: false,
            checkAll: e.target.checked,
        });
    }
    formatList(obj) {
        // 兼容两种写法
        if (obj.list && obj.list.length > 0 && typeof obj.list[0] == "string") {
            obj.list = obj.list.map(item => {
                return obj.type == "Checkbox" ? { value: item, label: item } : { key: item, text: item };
            });
        }
        return obj;
    }
    getDom(obj) {
        let dom;
        var hide = (obj.hide && typeof obj.hide == "function") ? obj.hide() : obj.hide;
        if (!hide) {
            switch (obj.type) {
                case "TimeRangePicker":
                    dom = <RangePicker
                        style={{ width: '390px' }}
                        showTime={{
                            hideDisabledOptions: true,
                            defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('11:59:59', 'HH:mm:ss')],
                        }} format="YYYY-MM-DD HH:mm:ss" />;
                    break;
                case "DatePicker":
                    dom = <DatePicker showTime disabled={obj.disabled} />;
                    break;
                case "RangePicker":
                    dom = <RangePicker disabled={obj.disabled} />;
                    break;
                case "Input":
                    dom = <Input placeholder={obj.placeholder} disabled={obj.disabled} />;
                    break;
                case "Hidden":
                    dom = <Input type="hidden" />;
                    break;
                case "TextArea":
                    obj.rows = obj.rows ? obj.rows : 3;
                    dom = <TextArea placeholder={obj.placeholder} rows={obj.rows} disabled={obj.disabled} />;
                    break;
                case "Select":
                    obj = this.formatList(obj);
                    var onSelect = (value, options) => {
                        obj.onSelect && typeof obj.onSelect == "function" && obj.onSelect(value, options);
                    }
                    // 默认为true，即默认有全部
                    if (typeof obj.isHasAllSelect == "undefined") obj.isHasAllSelect = true;
                    dom = (
                        <Select onSelect={onSelect} disabled={obj.disabled} allowClear={obj.allowClear}>
                            {obj.isHasAllSelect && <Option key="all" value="">全部</Option>}
                            {obj.list.map((item, i) => <Option key={i} value={item.key}>{item.text}</Option>)}
                        </Select>
                    );
                    break;
                case "Radio":
                    obj = this.formatList(obj);
                    if (!obj.style) obj.style = {};
                    var onChange = (e) => {
                        obj.onChange && typeof obj.onChange == "function" && obj.onChange(e.target.value);
                    }
                    dom = (
                        <Radio.Group style={obj.style} onChange={onChange}>
                            {obj.list.map((item, i) => <Radio key={i} value={item.key}>{item.text}</Radio>)}
                        </Radio.Group>
                    );
                    break;
                case "Checkbox":
                    obj = this.formatList(obj);
                    if (!obj.style) obj.style = {};
                    dom = <Checkbox.Group options={obj.list} style={obj.style} disabled={obj.disabled} />
                    break;
                case "CheckboxCustom":
                    obj = this.formatList(obj);
                    dom = <CheckboxCustom options={obj} />;
                    break;
                case "TreeSelect":
                    dom = <TreeSelect treeData={obj.list} dropdownStyle={{ maxHeight: 400, overflow: 'auto' }} />
                    break;
                case "TreeSelectCustom":
                    dom = <TreeSelectCustom options={obj} />
                    break;
                case "RiskTabsCustom":
                    dom = <RiskTabsCustom options={obj} />
                    break;
                case "InputExplain":
                    dom = <InputExplainFrom options={obj} />;
                    break;
                case "DynamicFieldSetCustom":
                    dom = <DynamicFieldSetCustom options={obj} />;
                    break;
                case "GroupCustom":
                    dom = <GroupCustom options={obj} />
                    break;
                case "InputCheckboxCustom":
                    dom = <InputCheckboxCustom options={obj} />
                    break;
                case "UploadFileCustom":
                    dom = <UploadFileCustom options={obj} />
                    break;
                case "RiskTabsTreeSelect":
                    dom = <RiskTabsTreeSelect options={obj} />
                    break;
                case "MultipleSelect":
                    obj = this.formatList(obj);
                    // 默认为true，即默认有全部
                    // if (typeof obj.isHasAllSelect == "undefined") obj.isHasAllSelect = true;
                    dom = <MultipleSelect options={obj} />
                    break;
            }
        }
        return dom;
    }
    getFields() {
        const { getFieldDecorator } = this.props.form;
        let result = [];
        this.props.options.forEach((obj, i) => {
            let dom = this.getDom(obj);
            if (dom) {
                var span = obj.span && typeof obj.span == "function" ? obj.span() : obj.span;
                var fontNum = obj.length ? obj.length : 4;
                result.push(
                    <Col span={span} key={i} className={obj.className}>
                        <Item label={obj.label} className={"form-grid-" + fontNum}>

                            {
                                obj.tooltip ? <Tooltip title={obj.tooltip}>
                                    {obj.name && getFieldDecorator(obj.name, obj.options)(dom)}
                                </Tooltip> :
                                    obj.name && getFieldDecorator(obj.name, obj.options)(dom)
                            }
                        </Item>
                    </Col>,
                )
            }
        });
        return result;
    }
    onClick(btn) {
        btn.event && typeof btn.event == "function" && btn.event(this.props.form);
    }
    render() {
        var list = null, aligin = "center", span = 24;
        if (this.props.btnOptions) {
            list = this.props.btnOptions.list;
            if (this.props.btnOptions.aligin) aligin = this.props.btnOptions.aligin;
            if (this.props.btnOptions.span) span = this.props.btnOptions.span;
        }
        return (
            <React.Fragment>
                <Form layout="horizontal" autoComplete="off">
                    <Row gutter={24}>
                        {this.getFields()}
                        {
                            list &&
                            <Col span={span} style={{ textAlign: aligin }}>
                                {list.map((btn, i) => {
                                    return <Button key={i} data-btn={btn} {...commonBtnOpt[btn.options]} onClick={() => this.onClick(btn)}>{btn.text}</Button>;
                                })}
                            </Col>
                        }
                    </Row>
                </Form>
            </React.Fragment>
        );
    }
}
const CommonForm = Form.create({})(commForm);

/**新增TreeSelect,实现展示书结构并进行多选 */
class RiskTabsTreeSelect extends React.Component {
    constructor(props) {
        super(props);
        // var initialValue = props.options.options && props.options.options.initialValue ? props.options.options.initialValue : {};

        this.state = {
            treeData: [],
            //  riskParamsMapList :[] ,
            value: undefined
            //value: props.value || initialValue
        };
    }
    componentDidMount() {
        const { value } = this.state;
        this.getAllRiskTabs(data => {
            //  this.setState({riskTabsList: data});
            this.setState({ treeData: JSON.parse(data) });
        });

    }

    getAllRiskTabs(callback) {
        post({
            url: "airLineRisk/getAllRiskTabs",
            success: data => {
                callback && callback(data);
            }
        });
    }

    /*getAllRiskParamMaps(callback){
        post({
            url: "airLineRisk/getAllRiskTabsMap",
            success: data => {
                callback && callback(data);
            }
        });
    }*/

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        };
    }


    /*onChange = (value, label, extra) => {
        var value = this.state.value;
       if(value == null || value == "" || value == undefined){
            this.state.riskParamsMapList = [];
        }else{
            this.getValidParams(value,this.state.treeData);
        }   *
        this.setState({ value });
        this.triggerChange({ value });

    } */

    triggerChange = (changedValue) => {
        const onChange = this.props.onChange;
        if (onChange) {
            onChange(Object.assign({}, this.state, changedValue));
        }
    }

    onSelect = value => {
        //  this.getValidParams(value,this.state.treeData);
        //    var value = this.state.value;
        //     this.getValidParams(value,this.state.treeData);
        this.setState({ value });
        this.triggerChange({ value });
    };

    onChange = value => {
        this.setState({ value });
        this.triggerChange({ value });
    };
    /* onBlur = value =>{
         if(value == null || value == "" || value == undefined){
             this.state.riskParamsMapList = [];
         }
     }*/

    getValidParams(value, list) {
        let riskName = "";
        for (var i = 0; i < list.length; i++) {
            var obj = {
                title: list[i].text,
                value: list[i].children,
                key: list[i].id
            };
            for (var j = 0; j < obj.value.length; j++) {
                if (obj.value[j].id == value) riskName = obj.value[j].text;
            }
        }
        this.state.riskParamsMapList.push(riskName);
    }

    handleData(list) {
        var arr = [];
        for (var i = 0; i < list.length; i++) {
            var obj = {
                title: list[i].text,
                value: list[i].id,
                key: list[i].id
            };
            if (list[i].children) obj.children = this.handleData(list[i].children)
            arr.push(obj);
        }
        return arr;
    }
    render() {
        var treeData = this.handleData(this.state.treeData);
        //  const { viewSearchValue } = this.state;
        const { value } = this.state;
        return (
            <TreeSelect
                allowClear
                searchPlaceholder='请选择'
                multiple
                treeCheckable
                value={this.state.value}
                style={{ width: "100%" }}
                dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                treeData={treeData}
                // treeNodeFilterProp="title"
                treeDefaultExpandAll
                onSearch={this.qureHandleSearch}
                onChange={this.onChange}
            //     onSelect={this.onSelect}
            //      onBlur={this.onBlur}
            />

        )
    }

}



/**
 * 通用table配置
 * options:{table\columns\notCheck\key\selectedRowKeys\rowSelection\scroll\onRow \onChange\needPage等} key: 唯一标识
 * onChecked:Fun
 */
class CommonTable extends React.Component {
    constructor(props) {
        super(props);
        // 表格行是否可选择的配置
        this.rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => { // 选中项发生变化时的回调
                this.props.onChecked(selectedRowKeys, selectedRows);
            }
        };
        this.pageOptions = {
            showSizeChanger: false,
            showQuickJumper: true,
            className: "pagination-css",
            pageSizeOptions: ["10", "20", "30", "50"]  // 指定每页可以显示多少条
        };
        this.tableOptions = {
            pagination: false,
            size: "small",
            bordered: true
        }
    }
    onChange = (pageNum, pageSize) => {
        this.props.options.onChange && this.props.options.onChange({ pageNum, pageSize });
    }
    onShowSizeChange = (pageNum, pageSize) => {
        this.props.options.onShowSizeChange && this.props.options.onShowSizeChange({ pageNum, pageSize });
    }

    onRowKey = (record, i) => {
        const { table, key, needPage = true } = this.props.options;
        const { pageNum, pageSize } = table;
        if (key) {
            return record[key];
        } else if (record.id) {
            return record.id;
        } else if (needPage) {
            return (pageNum - 1) * pageSize + i;
        } else {
            return i;
        }
    }

    handleColumns(list) {
        return list.map(item => {
            var Fun = item.render;
            if (!Fun) {
                if (!item.onCell) {
                    if (item.isTooltip) {
                        item.onCell = (record, rowIndex) => {
                            return {
                                style: {
                                    maxWidth: item.width,
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                    cursor: 'pointer'
                                }
                            }
                        };
                        item.render = (text) => <Tooltip title={text}>{text}</Tooltip>;
                    }
                } else {
                    // 以后若有item.onCell再进行扩展；
                }
            } else {
                // 自定义了render的，在自定义的render里加Tooltip
            }
            return item;
        });
    }

    render() {
        var { table = {}, columns = [], notCheck = false, rowSelection, needPage = true, key, selectedRowKeys, scroll, onRow } = this.props.options;
        columns = this.handleColumns(columns);
        // 表格行可选择时：默认情况下
        if (!notCheck) rowSelection = rowSelection || this.rowSelection;
        const { pageNum, pageSize, total, loading = true, dataList = [] } = table;
        let pageOptions = {};
        Object.assign(pageOptions, this.pageOptions, { current: pageNum, pageSize, total });
        var data = { columns, dataSource: dataList, notCheck };
        if (key) data.key = key;
        if (selectedRowKeys) data.selectedRowKeys = selectedRowKeys;
        if (!notCheck) data.rowSelection = rowSelection;
        if (scroll) data.scroll = scroll;
        if (onRow) data.onRow = onRow;
        var tableOptions = {};
        Object.assign(tableOptions, this.tableOptions, data);
        return (
            <React.Fragment>
                {
                    !loading && <Table rowKey={this.onRowKey} {...tableOptions} />
                }
                {
                    !loading && needPage && total > 0 &&
                    <Pagination {...pageOptions}
                        onChange={this.onChange}
                        onShowSizeChange={this.onShowSizeChange} />
                }
            </React.Fragment>
        );
    }
}

/**
 * 风险航班表格头
 */
function riskCAirportColumns({ detailUrl, judge, onLook }) {
    var arr = [
        { title: "航班日期", dataIndex: "fltDt", render: (text) => moment(text).format("YYYY-MM-DD") },
        {
            title: "航班号", dataIndex: "fltNr", render: (text, record) => {
                if (judge) {
                    return <a onClick={() => judge(record)}>{text}</a>;
                } else {
                    return <Link to={`${detailUrl}${record.soflSeqNr}`} target="_blank">{text}</Link>;
                }
            }
        },
        { title: "机尾号", dataIndex: "latestTailNr" },
        { title: "机型", dataIndex: "latestEqpCd" },
        { title: "起飞风险值", dataIndex: "flyingValue", render: (text, record) => riskValueFilter(text, record.flyAssoRiskNum) },
        {
            title: "起飞阶段", children: [
                {
                    title: '起飞机场',
                    dataIndex: 'latestDepArpChineseName',
                },
                {
                    title: '滑出时间',
                    dataIndex: 'latestDepDt',
                    render: (text, record) => timeValueFilter(text, record.depStsCd, "depStsCd")
                }
            ]
        },
        { title: "巡航风险值", dataIndex: "cruiseValue", render: (text, record) => riskValueFilter(text, record.cruiseAssoRiskNum) },
        {
            title: "着陆阶段", children: [
                {
                    title: '着陆机场',
                    dataIndex: 'latestArvArpChineseName',
                },
                {
                    title: '滑入时间',
                    dataIndex: 'latestArvDt',
                    render: (text, record) => timeValueFilter(text, record.arvStsCd, "arvStsCd")
                },
            ]
        },
        { title: "着陆风险值", dataIndex: "landedValue", render: (text, record) => riskValueFilter(text, record.landAssoRiskNum) },
        { title: "公司", dataIndex: "chnDescShort" },
        { title: "更新时间", dataIndex: "updateTime", render: (text) => moment(text).format("YYYY-MM-DD HH:mm") },
    ];
    if (onLook) {
        arr.splice(arr.length - 1, 0, {
            title: "计算风险值",
            key: "action",
            render: (text, record) => {
                return <a onClick={() => onLook(record)}>查看</a>;
            }
        });
        arr.splice(4, 0, { title: "性能子机型", dataIndex: "subPerformanceType" });
    }
    return arr;
}

/**
 * 风险告警列表、告警历史查询表格头
 */
function riskWarnListColumns(isHistory, callback) {
    let arr = [
        { title: "航班日期", dataIndex: "fltDt", render: (text) => moment(text).format("YYYY-MM-DD") },
        { title: "航班号", dataIndex: "fltNr" },
        { title: "机尾号", dataIndex: "latestTailNr" },
        { title: "机型", dataIndex: "latestEqpCd" },
        { title: "公司", dataIndex: "chnDescShort" },
        { title: '出发站', dataIndex: 'latestDepArpChineseName' },
        { title: '滑出时间', dataIndex: 'latestDepDt', render: (text, record) => moment(text).format("HH:mm") },
        { title: '到达站', dataIndex: 'latestArvArpChineseName' },
        { title: '落地时间', dataIndex: 'latestArvDt', render: (text, record) => moment(text).format("HH:mm") },
        { title: "告警内容", dataIndex: "warningContent" },
    ];
    if (isHistory) {
        arr.push(
            { title: "告警处理备注", dataIndex: 'warningRemark' },
            { title: "告警确认时间", dataIndex: 'confirmTime', render: (text, record) => moment(text).format("YYYY--MM-DD HH:mm") }
        );
    } else {
        arr.push({
            title: "确认",
            key: 'action',
            render: (text, record) => <a onClick={() => callback(record)}>确认</a>
        });
    }
    return arr;
}

/**
 * 风险值
 */
function riskValueFilter(value, num) {
    if (value) value = value.toFixed(1);
    if (value >= 0 && value <= 4) {
        return <Badge count={num} className="badge-custom low-badge">{value}</Badge>;
    } else if (value > 4 && value <= 7) {
        return <Badge count={num} className="badge-custom middle-badge">{value}</Badge>;
    } else if (value > 7 && value <= 10) {
        return <Badge count={num} className="badge-custom height-badge">{value}</Badge>;
    }
}

/**
 * 滑入时间、滑出时间
 */
function timeValueFilter(value, stsCd, type) {
    let className = "";
    if (type == "depStsCd") {
        if (stsCd == "ETD") {
            className = "text-danger";
        } else if (stsCd == "OFF" || stsCd == "AIR") {
            className = "text-success";
        } else {
            className = "text-white";
        }
    } else if (type == "arvStsCd") {
        if (stsCd == "ON") {
            className = "text-buff";
        } else if (stsCd == "DWN" || stsCd == "ETA") {
            className = "text-danger";
        } else {
            className = "text-white";
        }
    }
    return <span className={className}>{moment(value).format("DD HH:mm")}</span>
}

/**
 * 图标的提示
 */
function ChartsTip({ low, middle, height }) {
    return (
        <div className="charts-tip">
            <span className="low"></span>
            <span>{low} 低风险</span>
            <span className="middle"></span>
            <span>{middle} 中风险</span>
            <span className="height"></span>
            <span>{height} 高风险</span>
        </div>
    );
}

/**
 * 通用模块样式
 */
function CardCommon({ title, children, className }) {
    return (
        <div className={className ? "card " + className : "card"}>
            <div className="headers">{title}</div>
            <div className="content">{children}</div>
            <FourBorder></FourBorder>
        </div>
    );
}

/**
 * 模块4边图标
 */
function FourBorder() {
    return (
        <React.Fragment>
            <div className="left-top-icon"></div>
            <div className="right-top-icon"></div>
            <div className="left-bottom-icon"></div>
            <div className="right-bottom-icon"></div>
        </React.Fragment>
    )
}

/**
 * 三新风险维护（新机型老航线、新开航线）导入
 */
function getUploadProps(url, callback) {
    const props = {
        accept: "application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        fileList: [],
        beforeUpload(file) {
            const isExcel = file.type === 'application/vnd.ms-excel' || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            if (!isExcel) {
                message.error('只能上传excel!');
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('文件必须小于2MB!');
            }
            return isExcel && isLt2M;
        },
        customRequest(option) {
            const msgFun = message.loading('开始导入中...', 0);
            const formData = new FormData();
            formData.append('file', option.file);
            post({
                url: url,
                data: formData,
                isUpload: true,
                success: data => {
                    msgFun();
                    message.success("导入成功！");
                    callback && typeof callback == "function" && callback();
                },
                error: data => {
                    msgFun();
                    message.error("导入失败！");
                }
            });
        }
    };
    return props;
}

export {
    commonBtnOpt, CommonModal, CommonDrawer, ContextMenu, PageContainer, CommonTabs, CommonBtns, CommonForm, CommonTable,
    ChartsTip, CardCommon, FourBorder,
    riskCAirportColumns, riskValueFilter, timeValueFilter,
    riskWarnListColumns,
    getUploadProps
};