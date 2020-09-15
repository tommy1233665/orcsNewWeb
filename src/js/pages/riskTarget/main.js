import { Switch, Route } from "react-router-dom";
import Bundle from 'common/bundle';
// 异步引入
import RiskTargetModule from 'bundle-loader?lazy&name=cat-[name]!./RiskTarget';
import RelateRiskTargetModule from 'bundle-loader?lazy&name=cat-[name]!./RelateRiskTarget';
import DailyRiskTargetModule from 'bundle-loader?lazy&name=cat-[name]!./DailyRiskTarget';
import RiskTreeShowModule from 'bundle-loader?lazy&name=cat-[name]!./RiskTreeShow';
// 风险配置
const RiskTarget = () => (
    <Bundle load={RiskTargetModule}>
        {(RiskTarget) => <RiskTarget />}
    </Bundle>
);
//关联风险配置
const RelateRiskTarget = () => (
    <Bundle load={RelateRiskTargetModule}>
        {(RelateRiskTarget) => <RelateRiskTarget />}
    </Bundle>
);
//日常风险配置
const DailyRiskTarget = () => (
    <Bundle load={DailyRiskTargetModule}>
        {(DailyRiskTarget) => <DailyRiskTarget />}
    </Bundle>
);
//风险树展示
const RiskTreeShow = () => (
    <Bundle load={RiskTreeShowModule}>
        {(RiskTreeShow) => <RiskTreeShow />}
    </Bundle>
);

class RiskTargetMain extends React.Component {
    render() {
        const { match: { url } } = this.props;
        return (
            <Switch>
                <Route path={`${url}/RiskTarget`} component={RiskTarget} />
                <Route path={`${url}/RelateRiskTarget`} component={RelateRiskTarget} />
                <Route path={`${url}/RiskTreeShow`} component={RiskTreeShow} />
                <Route path={`${url}/DailyRiskTarget`} component={DailyRiskTarget} />
            </Switch>
        );
    }
}

export default RiskTargetMain;