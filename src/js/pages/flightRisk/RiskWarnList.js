import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import { Input, message } from "antd";
import moment from 'moment';
import { CardCommon, CommonTable, CommonForm, riskWarnListColumns, CommonModal } from "common/component";
import { handleInParams, isAuthority } from "common/commonFn";
import { post } from "common/http";
import PageModel from 'model/pageModel';

const { TextArea } = Input;

const LIST = "flightRiskShow.warnList"; // 查询告警列表
const LISTHISTORY = "flightRiskShow.warnListHistory"; // 查询历史告警
const SUREWARN = "flightRiskShow.sureWarn"; // 确认风险告警

class RistWarnList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            tabs: [
                {name: "风险告警列表", status: 0},
                {name: "告警历史查询", status: 1},
            ],
            table: new PageModel(),
            form: {
                fleetGrpList: [], // 性能机型数据
                branchInfoList: [], // 公司下拉数据
                userBelongsToCompany: "" //登录员工属于的公司的三字码
            },
            warningRemark: null,
            currentRiskWarn: null,
            modalOkBtnLoading: false,
            authorityList: isAuthority(LIST, props.authority),
            authorityListHistory: isAuthority(LISTHISTORY, props.authority),
            authoritySure: isAuthority(SUREWARN, props.authority),
        };
        this.currentStatu;
        this.columns;
        this.form;
        this.modal;
    }

    componentDidMount(){
        this.columns = riskWarnListColumns(false, this.onClickSure);
        this.getData();
    }

    componentWillUnmount(){
        this.setState = (state, callback) => {
            return;
        };
    }

    /**
     * 点击确认按钮
     */
    onClickSure = (data) => {
        if( this.state.authoritySure ){
            this.setState({currentRiskWarn: data});
            this.modal.show();
        }else {
            message.info("无权限操作");
        }
    }

    /**
     * 告警确认
     */
    warnSure = () => {
        this.setState({modalOkBtnLoading: true});
        if( !this.state.warningRemark ){
            this.setState({modalOkBtnLoading: false});
            message.info("请输入告警备注");
        }else{
            post({
                url: "rmRiskWarn/update",
                data: {id: this.state.currentRiskWarn.id, warningRemark:this.state.warningRemark},
                btn: () => this.setState({modalOkBtnLoading: false}),
                success: (data) => {
                    message.success("风险告警确认成功");
                    this.modal.hide();
                    this.getList();
                } 
            });
        }
    }

    onSelectTab(tab){
        this.currentStatus = tab.status;
        let isHistory = this.currentStatus == 1 ? true : false;
        this.columns = riskWarnListColumns(isHistory, this.onClickSure);
        this.getList();
    }

    /**
     * 查询公司、机型
     */ 
    getData() {
        post({
            url: "rmRiskWarn/queryRiskWarnAll",
            success: data => {
                this.setState({form: data});
                this.onSelectTab(this.state.tabs[0])
            }
        });
    }

    /**
     * 请求list接口
     */
    getList = ( obj = {} ) => {
        var values = this.form ? this.handleSearchParams(this.form.getFieldsValue()) : {};
        obj.params = Object.assign({}, values, obj.params);
        const table = this.state.table;
        table.setPage(obj);
        let params = table.getParmaData();
        params.warningStatus = this.currentStatus;
        post({
            url: "rmRiskWarn/queryRiskWarnHisByParam",
            data: params,
            success: (res) => {
                let result = res.pages;
                table.setPage({ dataList: result.list, total: result.total, pageNum: result.pageNum, pageSize: result.pageSize });
                this.setState({ table });
            }
        });
    }

    /**
     * 处理查询参数（航班日期范围的特殊处理）
     */
    handleSearchParams(values){
        const params = handleInParams(values);
        for(let key in params){
            if( key == "date" && params[key].length == 2 ){
                params["start"] = moment(params[key][0]).format("YYYY-MM-DD");
                params["end"] = moment(params[key][1]).format("YYYY-MM-DD");
                delete params[key];
            }
            if( key == "latestEqpCds" ){
                params[key] = params[key].value ? params[key].value : params[key];
            }
        }
        return params;
    }

    /**
     * 查询
     */
    submit = () => {
        event.preventDefault();
        this.form.validateFields((err, values) => {
            if( !err ){
                values = this.handleSearchParams(values);
                this.getList({params: values, pageNum: 1});
            }
        });
    }

    /**
     * 重置
     */
    reset = () => {
        this.form.resetFields();
        this.submit();
    }

    /**
     * 获取form表的配置
     */
    getFormOptions(){
        const userBelongsToCompany = this.state.form.userBelongsToCompany;
        const branchInfoList = this.state.form.branchInfoList.filter( item => {
            if( userBelongsToCompany == 'NHZ' ){
                if( item.branchCd != 'CKG' ) return item; { /*滤掉重庆选项*/ }
            }else{
                if( item.branchCd == userBelongsToCompany ) return item;
            }
        }).map((item, index) => {
            return {key: item.branchCd, text: item.branchCd + item.chnDescShort};
        });
        const fleetGrpList = this.state.form.fleetGrpList.map((item) => {
            return { label: item.fleetGrpCd, value: item.fleetGrpCd }
        });
        return [
            {
                type: "RangePicker",
                label: "航班日期",
                name: "date",
                span: 8,
            },
            {
                type: "Select",
                label: "公司",
                name: "comp",
                span: () => {
                    return this.form && this.form.getFieldValue("comp") == "" ? 8 : 5;
                },
                list: branchInfoList,
                isHasAllSelect: false,
                options: {
                    initialValue: userBelongsToCompany
                }
            },
            {
                type: "Select",
                label: "",
                name: "condition",
                span: 3,
                list: [
                    {key: "conditionTailNr", text: "按飞机"},
                    {key: "conditionBranchCode", text: "按航班"},
                    {key: "crew", text: "按机组"},
                ],
                options: {
                    initialValue: "conditionBranchCode"
                },
                isHasAllSelect: false,
                hide: () => {
                    return this.form && this.form.getFieldValue("comp") == "" ? true : false;
                }
            },
            {
                type: "Input",
                label: "航班号",
                name: "fltNr",
                span: 6,
                placeholder: "航班号"
            },
            {
                type: "CheckboxCustom",
                label: "机型组",
                name: "latestEqpCds",
                span: 24,
                list: fleetGrpList,
                options: { initialValue: fleetGrpList.map(item => item.value) },
            },
        ];
    }

    render() {
        // 表单参数
        const formOptions = this.getFormOptions();
        const btnOptions = {
            aligin: "center",
            span: 24,
            list: [
                {text: "查询", options: "queryOpt", event: this.submit},
                {text: "重置", options: "resetOpt", event: this.reset}
            ]
        };

        // 表格参数
        const { table, modalOkBtnLoading, authorityList, authorityListHistory } = this.state;
        const tableOptions = {
            notCheck: true,
            table,
            columns: this.columns,
            onChange: this.getList,
        }

        // 模态框参数
        const modalOptions = {
            options: {
                title: "告警处理备注",
                okButtonProps: { loading: modalOkBtnLoading }
            },
            ok: this.warnSure.bind(this),
            onRef: (ref) => {this.modal = ref}
        };
        
        return (
            <CardCommon>
                <div className="tab-wrap">
                    {
                        this.state.tabs.map( (tab, i) => {
                            return <div key={i} className={tab.status == this.currentStatus ? "active" : ""} onClick={ () => this.onSelectTab(tab) }>{tab.name}</div>
                        })
                    }
                </div>
                {
                    authorityList && this.currentStatus == 0 && 
                    <React.Fragment>
                        <CommonForm options={formOptions} btnOptions={btnOptions} wrappedComponentRef={(form) => { if(form && form.props && form.props.form) this.form = form.props.form;}}></CommonForm>
                        <CommonTable options={tableOptions} onChecked={this.onChecked}></CommonTable>
                        <CommonModal {...modalOptions}>
                            <TextArea rows={4} value={this.state.warningRemark} onChange={ ({ target: { value } }) => this.setState({ warningRemark: value }) } autoComplete="off" ></TextArea>
                        </CommonModal>
                    </React.Fragment>
                }
                { !authorityList && this.currentStatus == 0 && <div className="no-authority-box">无权限查看</div> }
                {
                    authorityListHistory && this.currentStatus == 1 && 
                    <React.Fragment>
                        <CommonForm options={formOptions} btnOptions={btnOptions} wrappedComponentRef={(form) => { if(form && form.props && form.props.form) this.form = form.props.form;}}></CommonForm>
                        <CommonTable options={tableOptions} onChecked={this.onChecked}></CommonTable>
                        <CommonModal {...modalOptions}>
                            <TextArea rows={4} value={this.state.warningRemark} onChange={ ({ target: { value } }) => this.setState({ warningRemark: value }) } autoComplete="off" ></TextArea>
                        </CommonModal>
                    </React.Fragment>
                }
                { !authorityListHistory && this.currentStatus == 1 && <div className="no-authority-box">无权限查看</div> }
                
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
)(withRouter(RistWarnList));