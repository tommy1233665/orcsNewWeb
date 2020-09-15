import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import { message } from 'antd';
import { CardCommon, CommonForm } from "common/component";
import { handleInParams, isAuthority } from "common/commonFn";
import { post } from 'common/http';

const EDIT = "rmItemFunPoint.edit"; // 修改
const LIST = "rmItemFunPoint.list"; // 查询

class RmItemFunPoint extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            formValues: {},
            authorityEdit: isAuthority(EDIT, props.authority),
            authorityList: isAuthority(LIST, props.authority)
        };
    }

    componentDidMount() {
        this.getData();
    }

    componentWillUnmount(){
        this.setState = (state, callback) => {
            return;
        };
    }

    getData = () => {
        post({
            url: "rmItemFunPoint/queryFunPoints",
            success: data => {
                var formValues = {};
                data.forEach(item => {
                    switch(item.level){
                        case "L":
                            formValues.minL = item.minValue;
                            formValues.maxL = item.maxValue;
                            break;
                        case "M":
                            formValues.minM = item.minValue;
                            formValues.maxM = item.maxValue;
                            break;
                        case "H":
                            formValues.minH = item.minValue;
                            formValues.maxH = item.maxValue;
                            break;
                    }
                });
                this.setState({formValues});
            }
        });
    }

    submit = () => {
        if( this.state.authorityEdit ){
            this.form.validateFields((err, values) => {
                if( !err ){
                    values = handleInParams(values);
                    var funPoints = [Number(values.minL), Number(values.maxL), Number(values.minM), Number(values.maxM), Number(values.minH), Number(values.maxH)];
                    post({
                        url: "rmItemFunPoint/update",
                        data: {funPoints: funPoints},
                        success: data => {
                            message.success("保存成功");
                            this.getData();
                        }
                    });
                }
            });
        }else{
            message.info("无权限修改");
        }
    }

    reset = () => {
        if( this.state.authorityEdit ){
            this.form.resetFields();
        }else{
            message.info("无权限重置");
        }
    }
 
    /**
     * 获取form表的配置
     */
    getFormOptions(){
        var datas = this.state.formValues;
        return [
            {
                type: "Input",
                name: "minL",
                span: 2,
                options: {
                    initialValue: datas.minL
                }
            },
            {
                type: "Input",
                name: "maxL",
                span: 2,
                options: {
                    initialValue: datas.maxL
                }
            },
            {
                type: "Input",
                name: "minM",
                span: 2,
                options: {
                    initialValue: datas.minM
                }
            },
            {
                type: "Input",
                name: "maxM",
                span: 2,
                options: {
                    initialValue: datas.maxM
                }
            },
            {
                type: "Input",
                name: "minH",
                span: 2,
                options: {
                    initialValue: datas.minH
                }
            },
            {
                type: "Input",
                name: "maxH",
                span: 2,
                options: {
                    initialValue: datas.maxH
                }
            }
        ];
    }

    render(){
        const { authorityList} = this.state;
        const formOptions = this.getFormOptions();
        const btnOptions = {
            aligin: "left",
            span: 12,
            list: [
                {text: "保存", options: "saveOpt", event: this.submit },
                {text: "重置", options: "resetOpt", event: this.reset }
            ]
        };
        return(
            <CardCommon className="rmItem-fun-point">
                { authorityList && <CommonForm 
                    options={formOptions} 
                    btnOptions={btnOptions}
                    wrappedComponentRef={(form) => { if(form && form.props && form.props.form) this.form = form.props.form;}}
                />}
                { !authorityList && <div className="no-authority-box">无权限查看</div> }
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
)(withRouter(RmItemFunPoint));