import { Switch, Route } from "react-router-dom";
import Bundle from 'common/bundle';
// 异步引入
import FlightRiskModule from 'bundle-loader?lazy&name=cat-[name]!./FlightRisk';
import RiskWarnListModule from 'bundle-loader?lazy&name=cat-[name]!./RiskWarnList';
import FlightListModule from 'bundle-loader?lazy&name=cat-[name]!./FlightList';
// 航班风险、历史航班风险列表
const FlightRisk = () => (
    <Bundle load={FlightRiskModule}>
        {(FlightRisk) => <FlightRisk />}
    </Bundle>
);
// 风险告警列表
const RiskWarnList = () => (
    <Bundle load={RiskWarnListModule}>
        {(RiskWarnList) => <RiskWarnList />}
    </Bundle>
);
// 航班列表（从主页点击图形进入）
const FlightList = () => (
    <Bundle load={FlightListModule}>
        {(FlightList) => <FlightList />}
    </Bundle>
);

const routerConfig = [
    {
        path: "/FlightRisk",
        component: FlightRisk
    },
    {
        path: "/RiskWarnList",
        component: RiskWarnList
    },
    {
        path: "/HistoryFlightRisk",
        component: FlightRisk
    },
    {
        path: "/FlightList",
        component: FlightList
    }
];

class FlightRiskMain extends React.Component {
    render() {
        const { match: { url } } = this.props;
        return (
            <Switch>
                {
                    routerConfig.map( (item, index) => {
                        const { path } = item;
                        return (
                            <Route
                                key = { index }  
                                path = { `${url}` + path }
                                render = { props => <item.component key={props.match.path} {...props} /> }
                            />
                        )
                    })
                }
            </Switch>
        );
    }
}

export default FlightRiskMain;