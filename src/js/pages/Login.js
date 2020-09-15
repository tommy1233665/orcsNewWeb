import { withRouter } from "react-router-dom";
import { Icon, Form, Input, Row, Col, Button } from 'antd';
import { href, encrypt, setSession } from 'common/commonFn';
import { connect } from 'react-redux'
import { updateUserInfo, updateAuthority, updateCurrentMenu } from 'reduxs/action'
import { post } from "common/http";
const Item = Form.Item;

class Login extends React.Component {
    constructor() {
        super();
        this.state = {
            captchaImg: null,
            msg: "",
            flag: false, // 默认不显示手机号，手机号验证码
            mobile: "",
            ssoToken: ""
        };
        this.timer;
    }

    // 组件渲染后调用
    componentDidMount() {
        this.changeCaptcha();
        this.timer = setInterval( () => {
            this.changeCaptcha();
        }, 90000); // 90s
        //是否需要回显账号
        var list = this.getUserNames();
        if( list.length > 0 ) {
            this.props.form.setFieldsValue({
                username: list[0]
            });
        }
    }

    componentWillUnmount(){
        clearInterval(this.timer);
        this.setState = (state, callback) => {
            return;
        };
    }

    // 获取验证码图片地址
    getCaptcha(){
        return window.g_url + "captcha-image?id=" + Math.random();
    }

    // 改变验证码
    changeCaptcha(){
        this.setState({
            captchaImg: this.getCaptcha()
        });
　　}

    // 发送短信验证码
    sendCode(){
        // 对接发送短信验证码接口
    }

    onChange() {
        if( this.state.msg ) this.setState({msg: ""});
    }

    // 获取保存在localStorage里的orcs-userName的值
    getUserNames() {
        var list = localStorage.getItem('orcs-userName');
        return list ? JSON.parse( list ) : [];
    }

    // 将输入过的username记住
    rememberUserName(userName){
        var list = this.getUserNames();
        var i = list.indexOf(userName);
        if( i > -1 ){
            if( i != 0 ){
                list.splice(i, 1);
                list.unshift(userName);
            }
        }else{
            list.unshift(userName);
        }
        // 存数组的原因：为了以后扩展
        localStorage.setItem('orcs-userName', JSON.stringify(list));
    }

    // 登录
    submit = (event) => {
        var This = this;
        event.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let params = {};
                for(let key in values){
                    params[key] = encrypt(values[key]);
                }
                if( this.state.flag ) params["ssoToken"] = this.state.ssoToken;
                post({
                    url: "doLogin",
                    data: params,
                    success: (data) => {
                        setSession("token", data.signInToken);
                        This.props.updateUserInfo({username:data.userName,userCode:data.userCode});
                        This.props.updateAuthority(data.sysPermission);
                        This.props.updateCurrentMenu({
                            currentMenus: [],
                            currentId: [],
                        });
                        href(This, '/index');
                        This.rememberUserName(data.userCode);
                    },
                    error: (res) => {
                        This.changeCaptcha();
                        This.setState({msg: res.message});
                        if( res.code == 64 ){
                            This.setState({flag: true, mobile: res.data.mobile, ssoToken: res.data.ssoToken});
                        }
                    }
                });
            }
        });
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <div className="login-content">
                <div className="login">
                    <div className="logo-img"></div>
                    <div className="title">运行风险管控系统</div>
                    <div className="sec-title">orcs csair.com</div>
                    <div>
                        <div className="tip">{this.state.msg}</div>
                        <Form onSubmit={this.submit}>
                            <Item>
                                {getFieldDecorator('username', {
                                    rules: [{ required: true, message: '请输入账号！' }],
                                })(
                                    <Input prefix={<Icon type="user" />} placeholder="账号" onChange={this.onChange.bind(this)} />
                                )}
                            </Item>
                            <Item>
                                {getFieldDecorator('password', {
                                    rules: [{ required: true, message: '请输入密码！' }],
                                })(
                                    <Input.Password prefix={<Icon type="lock" />} placeholder="密码" onChange={this.onChange.bind(this)} autoComplete="off" />
                                )}
                            </Item>
                            <Item>
                                {getFieldDecorator('kaptcha', {
                                    rules: [{ required: true, message: '请输入验证码！' }],
                                })(
                                    <Row gutter={16}>
                                        <Col span={16}>
                                            <Input prefix={<Icon type="safety-certificate" />} placeholder="验证码" onChange={this.onChange.bind(this)} autoComplete="off" />
                                        </Col>
                                        <Col span={8} className="code-box">
                                            <div className="code">
                                                <img onClick={this.changeCaptcha.bind(this)} src={this.state.captchaImg}/>
                                            </div>
                                        </Col>
                                    </Row>
                                )}
                            </Item>
                            {
                                this.state.flag &&
                                <Item>
                                    {getFieldDecorator('mobile', {
                                        rules: [{ required: true, message: '请输入手机后5位！' }],
                                    })(
                                        <Input prefix={<Icon type="mobile" />} placeholder="手机后5位" onChange={this.onChange.bind(this)} />
                                    )}
                                </Item>
                            }
                            {
                                this.state.flag &&
                                <Item>
                                    {getFieldDecorator('mobileCode', {
                                        rules: [{ required: true, message: '请输入短信验证码！' }],
                                    })(
                                        <Row gutter={16}>
                                            <Col span={16}>
                                                <Input prefix={<Icon type="safety-certificate" />} placeholder="短信验证码" onChange={this.onChange.bind(this)} />
                                            </Col>
                                            <Col span={8}>
                                                <Button className="login-img" onClick={this.sendCode.bind(this)}>发送</Button>
                                            </Col>
                                        </Row>
                                    )}
                                </Item>
                            }
                            <Item>
                                <Button htmlType="submit" className="login-img">立即登录</Button>
                            </Item>
                        </Form>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return { 
        userInfo: state.userInfo,
        authority: state.authority
    };
}

const mapDispatchToProps = (dispatch) => {
    return {
        updateUserInfo: (userInfo) => dispatch(updateUserInfo(userInfo)),
        updateAuthority: (authority) => dispatch(updateAuthority(authority)),
        updateCurrentMenu: (currentMenu) => dispatch(updateCurrentMenu(currentMenu))
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Form.create({ name: 'Login' })(withRouter(Login)));