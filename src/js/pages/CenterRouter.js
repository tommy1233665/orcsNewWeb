import { Switch, Route } from "react-router-dom";
import { withRouter } from "react-router-dom";
//首页
import Home from "./home/Home";
//航班风险展示
import FlightRiskMain from "./flightRisk/main";
//风险指标维护
import RiskTargetMain from "./riskTarget/main";
//基础数据维护
import ActivityMain from "./activity/main";
//系统管理
import SystemMain from "./system/main";
// 右侧内容主入口路由
class CenterRouter extends React.Component {
  render() {
    const {
      match: { url },
    } = this.props;
    return (
      <div className="main">
        <Switch>
          <Route exact path={`${url}`} component={Home} />
          <Route path={`${url}/flightRisk`} component={FlightRiskMain} />
          <Route path={`${url}/riskTarget`} component={RiskTargetMain} />
          <Route path={`${url}/activity`} component={ActivityMain} />
          <Route path={`${url}/system`} component={SystemMain} />
        </Switch>
      </div>
    );
  }
}

export default withRouter(CenterRouter);
