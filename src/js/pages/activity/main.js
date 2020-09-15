import { Switch, Route } from "react-router-dom";
import Bundle from 'common/bundle';
// // 异步引入
import AcfDataModule from 'bundle-loader?lazy&name=cat-[name]!./AcfData';
import RmArptRiskParamModule from 'bundle-loader?lazy&name=cat-[name]!./RmArptRiskParam';
import RmRiskArptModule from 'bundle-loader?lazy&name=cat-[name]!./RmRiskArpt';
import RmSpecialAirLineModule from 'bundle-loader?lazy&name=cat-[name]!./RmSpecialAirLine';
import C0059HandBookModule from 'bundle-loader?lazy&name=cat-[name]!./C0059HandBook';
import ThreeNewModule from 'bundle-loader?lazy&name=cat-[name]!./ThreeNew';
import WindLimitStandardModule from 'bundle-loader?lazy&name=cat-[name]!./WindLimitStandard';
import RwyRuleModule from 'bundle-loader?lazy&name=cat-[name]!./RwyRule';
import V2500ReformModule from 'bundle-loader?lazy&name=cat-[name]!./V2500Reform';
import NdTailModule from 'bundle-loader?lazy&name=cat-[name]!./NdTail';
import RmItemFunPointModule from 'bundle-loader?lazy&name=cat-[name]!./RmItemFunPoint';
import WeatherModule from 'bundle-loader?lazy&name=cat-[name]!./Weather';

// 飞机风险数据库
const AcfData = () => (
    <Bundle load={AcfDataModule}>
        {(AcfData) => <AcfData />}
    </Bundle>
);

//机场风险参数库
const RmArptRiskParam = () => (
    <Bundle load={RmArptRiskParamModule}>
        {(RmArptRiskParam) => <RmArptRiskParam />}
    </Bundle>
);

//机场风险数据库
const RmRiskArpt = () => (
    <Bundle load={RmRiskArptModule}>
        {(RmRiskArpt) => <RmRiskArpt />}
    </Bundle>
);

//特殊航线
const RmSpecialAirLine = () => (
    <Bundle load={RmSpecialAirLineModule}>
        {(RmSpecialAirLine) => <RmSpecialAirLine />}
    </Bundle>
);

//手册规章数据库
const C0059HandBook = () => (
    <Bundle load={C0059HandBookModule}>
        {(C0059HandBook) => <C0059HandBook />}
    </Bundle>
);

//三新风险维护
const ThreeNew = () => (
    <Bundle load={ThreeNewModule}>
        {(ThreeNew) => <ThreeNew />}
    </Bundle>
);

//各机型风限制标准维护
const WindLimitStandard = () => (
    <Bundle load={WindLimitStandardModule}>
        {(WindLimitStandard) => <WindLimitStandard />}
    </Bundle>
);

//跑道规则
const RwyRule = () => (
    <Bundle load={RwyRuleModule}>
        {(RwyRule) => <RwyRule />}
    </Bundle>
);

//待改造V2500发动机
const V2500Reform = () => (
    <Bundle load={V2500ReformModule}>
        {(V2500Reform) => <V2500Reform />}
    </Bundle>
);

//ND数据维护
const NdTail = () => (
    <Bundle load={NdTailModule}>
        {(NdTail) => <NdTail />}
    </Bundle>
);

// 隶属节点维护
const RmItemFunPoint = () => (
    <Bundle load={RmItemFunPointModule}>
        {(RmItemFunPoint) => <RmItemFunPoint />}
    </Bundle>
);

//气象标准
const Weather = () => (
    <Bundle load={WeatherModule}>
        {(Weather) => <Weather />}
    </Bundle>
);

class ActivityMain extends React.Component {
    render() {
        const { match: { url } } = this.props;
        return (
            <Switch>
                <Route path={`${url}/AcfData`} component={AcfData} />
                <Route path={`${url}/RmArptRiskParam`} component={RmArptRiskParam} />
                <Route path={`${url}/RmRiskArpt`} component={RmRiskArpt} />
                <Route path={`${url}/RmSpecialAirLine`} component={RmSpecialAirLine} />
                <Route path={`${url}/C0059HandBook`} component={C0059HandBook} />
                <Route path={`${url}/ThreeNew`} component={ThreeNew} />
                <Route path={`${url}/WindLimitStandard`} component={WindLimitStandard} />
                <Route path={`${url}/RwyRule`} component={RwyRule} />
                <Route path={`${url}/V2500Reform`} component={V2500Reform} />
                <Route path={`${url}/NdTail`} component={NdTail} />
                <Route path={`${url}/RmItemFunPoint`} component={RmItemFunPoint} />
                <Route path={`${url}/Weather`} component={Weather} />
          </Switch>
        );
    }
}

export default ActivityMain;