import { withRouter } from "react-router-dom";
import { Row, Col, message } from "antd";
import { connect } from 'react-redux';
import { updateCurrentMenu } from 'reduxs/action';
import { ChartsTip, CommonTable, CommonTabs, riskCAirportColumns, CardCommon } from "common/component";
import { post } from "common/http";
import { Charts, convertData } from "common/charts";
import { copyObj, href, getCurrentMenu, setSession, isAuthority } from "common/commonFn";

require("common/china");

const BAR = "home.bar"; // 查询各公司高中低风险（柱状图）
const MAP = "home.map"; // 查询各公司高风险航班数（地图）
const ALLTOP10 = "home.allTop10"; // 查询全公司高风险TOP10
const GZTOP10 = "home.gzTop10"; // 查询广州高风险TOP10
const PIE = "home.pie"; // 查询全公司高中低风险（饼图）

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = { tableList: [], loading: true };
        this.tabsBar = [
            { name: "按航班", checked: true, dimension: "flit" },
            { name: "按飞机", checked: false, dimension: "acft" },
            { name: "按机组", checked: false, dimension: "crew" },
            { name: "按机场", checked: false, dimension: "arpt" },
        ];
        this.tabsTable = [
            { name: "广州", id: GZTOP10, checked: true, url: "flight/queryHightFlitCanTop10New" },
            { name: "全公司", id: ALLTOP10, checked: false, url: "flight/queryHightFlitTop10New" },
        ].filter(item => isAuthority(item.id, props.authority));
        if (this.tabsTable.length == 1) this.tabsTable[0].checked = true;

        this.columns;
        this.barChart;
    }

    componentDidMount() {
        this.columns = riskCAirportColumns({
            judge: this.judge
        });
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        };
    }

    judge(record) {
        post({
            url: "flight/querySysRoleBranch",
            success: data => {
                var branchList = data.branchList;
                var flag = false;
                if (branchList.length > 0) {
                    for (var i = 0; i < branchList.length; i++) {
                        if (branchList[i] == record.chnDescShort) {
                            flag = true;
                            break;
                        }
                    }
                }
                if (flag) {
                    var detailUrl = "FlightRiskDetail/";
                    var url = `${window.w_url}${detailUrl}${record.soflSeqNr}`;
                    window.open(url);
                } else {
                    message.info("无权限查看");
                }
            }
        });
    }

    /**
     * 父子组件之间的通信
     */
    onRef = (ref) => {
        this.barChart = ref;
    };

    onTabBar = (tab, i) => {
        this.barChart.getAllHangBili(1, "起飞", tab.dimension);
        this.barChart.getAllHangBili(2, "航巡", tab.dimension);
        this.barChart.getAllHangBili(3, "着陆", tab.dimension);
    }

    onTabTable = (tab) => {
        post({
            url: tab.url,
            success: data => {
                this.setState({
                    tableList: data.map(item => {
                        item.latestDepArpChineseName = item.latestDepArpCd;
                        item.latestArvArpChineseName = item.latestArvArpCd;
                        return item;
                    }),
                    loading: false
                });
            }
        });
    }

    render() {
        const { tableList, loading } = this.state;
        const { authority } = this.props;
        // 列表表格参数
        const tableOptions = {
            table: { dataList: tableList, loading: loading },
            columns: this.columns,
            notCheck: true,
            needPage: false
        }
        return (
            <div className="home">
                <Row gutter={16}>
                    <Col span={14}>
                        <CardCommon title="当日高、中、低风险航班比例（全公司）">
                            <ChartsTip></ChartsTip>
                            <PieCharts parentThis={this} authority={authority} />
                        </CardCommon>
                    </Col>
                    <Col span={10}>
                        <CardCommon title="当日各公司高、中风险航班数">
                            <MapCharts parentThis={this} authority={authority} />
                        </CardCommon>
                    </Col>
                </Row>
                <Row gutter={16} className="bar-charts">
                    <Col span={24}>
                        <CardCommon title="当日高、中、低风险航班比例（全公司）">
                            <ChartsTip></ChartsTip>
                            <BarCharts parentThis={this} onRef={this.onRef} authority={authority} />
                            <CommonTabs tabs={this.tabsBar} onClick={this.onTabBar} />
                        </CardCommon>
                    </Col>
                </Row>
                <Row gutter={16} className="table-div">
                    <Col span={24}>
                        <CardCommon title="当日高风险航班TOP10">
                            <CommonTabs tabs={this.tabsTable} onClick={this.onTabTable} />
                            <ChartsTip height="7.1-10.0" middle="4.1-7.0" low="1.0-4.0"></ChartsTip>
                            {this.tabsTable.length > 0 && <CommonTable options={tableOptions}></CommonTable>}
                            {this.tabsTable.length == 0 && <div className="no-authority-box">无权限查看</div>}
                        </CardCommon>
                    </Col>
                </Row>
            </div>
        )
    }
}

class PieCharts extends React.Component {

    constructor(props) {
        super(props);
        this.pieOptions = {
            title: {
                text: "",
                bottom: 30,
                x: "center",
                textStyle: { color: "#9ca0ad", fontSize: "16" }
            },
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c}架 ({d}%)",
                position: function (pos, params, dom, rect, size) {
                    pos[0] = pos[0] + 30;
                    pos[1] = pos[1] + 20;
                    return pos;
                }
            },
            label: {
                formatter: "{d}%"
            },
            series: [{
                name: '',
                type: 'pie',
                radius: ["45%", "70%"],
                label: {
                    color: "#fff"
                },
                labelLine: {
                    length2: 0
                },
                itemStyle: {
                    normal: {
                        borderWidth: 5,
                        borderColor: '#292b33',
                    },
                },
                hoverOffset: 5,
                data: [
                    { name: "高风险", value: 0, itemStyle: { color: "#fd3636" } },
                    { name: "中风险", value: 0, itemStyle: { color: "#fddd54" } },
                    { name: "低风险", value: 0, itemStyle: { color: "#53e57c" } },
                ]
            }]
        };
        this.state = {
            authorityShow: isAuthority(PIE, props.authority),
            pieOptions1: copyObj(this.pieOptions),
            pieOptions2: copyObj(this.pieOptions),
            pieOptions3: copyObj(this.pieOptions)
        }
    }

    componentDidMount() {
        this.getLevelOfRisk(1, "起飞阶段");
        this.getLevelOfRisk(2, "巡航阶段");
        this.getLevelOfRisk(3, "着陆阶段");
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        };
    }

    handleData(pieOptions, data, name) {
        pieOptions.series[0].data[0].value = data.hight;
        pieOptions.series[0].data[1].value = data.medium;
        pieOptions.series[0].data[2].value = data.low;
        pieOptions.series[0].name = name;
        pieOptions.title.text = name;
        return pieOptions;
    }

    getLevelOfRisk(num, name) {
        let This = this;
        post({
            url: "flight/querylevelOfRisk",
            data: { status: num.toString() },
            success: (data) => {
                switch (num) {
                    case 1:
                        let { pieOptions1 } = this.state;
                        pieOptions1 = This.handleData(pieOptions1, data, name);
                        This.setState({ pieOptions1: pieOptions1 });
                        break;
                    case 2:
                        let { pieOptions2 } = this.state;
                        pieOptions2 = This.handleData(pieOptions2, data, name);
                        This.setState({ pieOptions2: pieOptions2 });
                        break;
                    case 3:
                        let { pieOptions3 } = this.state;
                        pieOptions3 = This.handleData(pieOptions3, data, name);
                        This.setState({ pieOptions3: pieOptions3 });
                        break;
                }

            }
        })
    }

    onClick(params) {
        var type = "pie";
        var riskValue = params.name;
        var flightStatus = params.seriesName;
        if (riskValue == "高风险") {
            riskValue = "H";
        } else if (riskValue == "中风险") {
            riskValue = "M";
        } else if (riskValue == "低风险") {
            riskValue = "L";
        }
        if (flightStatus == "起飞阶段") {
            flightStatus = "flying";
        } else if (flightStatus == "巡航阶段") {
            flightStatus = "cruise";
        } else if (flightStatus == "着陆阶段") {
            flightStatus = "landed";
        }
        var url = `/index/flightRisk/FlightList`;
        var currentMenus = getCurrentMenu(this.props.parentThis.props, url);
        this.props.parentThis.props.updateCurrentMenu({
            currentMenus: currentMenus
        });
        setSession("flightList", JSON.stringify({ riskValue, flightStatus, type }));
        let urlParams = {
            name: currentMenus[currentMenus.length - 1].name,
            key: currentMenus[currentMenus.length - 1].key
        }
        href(this.props.parentThis, url, urlParams);
    }

    render() {
        const { authorityShow } = this.state;
        return (
            <Row gutter={8}>
                <Col span={8}>
                    {authorityShow && <Charts id="pie1" options={this.state.pieOptions1} onClick={params => this.onClick(params)} />}
                    {!authorityShow && <div className="no-authority-box">无权限查看</div>}
                </Col>
                <Col span={8}>
                    {authorityShow && <Charts id="pie2" options={this.state.pieOptions2} onClick={params => this.onClick(params)} />}
                    {!authorityShow && <div className="no-authority-box">无权限查看</div>}
                </Col>
                <Col span={8}>
                    {authorityShow && <Charts id="pie3" options={this.state.pieOptions3} onClick={params => this.onClick(params)} />}
                    {!authorityShow && <div className="no-authority-box">无权限查看</div>}
                </Col>
            </Row>
        )
    }
}

class MapCharts extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            authorityShow: isAuthority(MAP, props.authority),
            mapOptions: {
                textStyle: {
                    color: "#fff"
                },
                tooltip: {
                    trigger: 'item',
                    formatter: function (params) {
                        return params.name + ' : ' + params.value[2];
                    }
                },
                geo: {
                    map: 'china',
                    itemStyle: {
                        areaColor: "#292b33",
                        borderColor: "#eee",
                        emphasis: {
                            areaColor: '#081227'
                        }
                    },
                    label: {
                        emphasis: {
                            show: false
                        }
                    },
                },
                series: [
                    {
                        name: '飞机班数',
                        type: 'scatter',
                        coordinateSystem: "geo",
                        roam: false,
                        symbol: "pin",
                        symbolSize: 50,
                        itemStyle: {
                            color: "#ff2525"
                        },
                        label: {
                            color: "#fff",
                            normal: {
                                show: true,
                                position: 'inside',
                                formatter: '{b}'
                            },
                            emphasis: {
                                show: false
                            }
                        },
                        data: convertData([])
                    }
                ]
            }
        }
    }

    componentDidMount() {
        this.getHightRickNumAll();
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        };
    }

    getHightRickNumAll() {
        const This = this;
        post({
            url: "flight/queryhightRickNumAll",
            success: (data) => {
                let { mapOptions } = This.state;
                mapOptions.series[0].data = convertData(data);
                This.setState({
                    mapOptions: mapOptions,
                    data: data
                });
            }
        })
    }

    onClick(params) {
        if (params.componentType == "series") {
            var type = "map";
            var chnDescShort = params.name;
            var flag = false;
            this.state.data.forEach(item => {
                if (item.branchList && item.branchList == chnDescShort) {
                    flag = true;
                }
            });
            if (flag) {
                var url = `/index/flightRisk/FlightList`;
                var currentMenus = getCurrentMenu(this.props.parentThis.props, url);
                this.props.parentThis.props.updateCurrentMenu({
                    currentMenus: currentMenus
                });
                setSession("flightList", JSON.stringify({ type, chnDescShort }));
                let urlParams = {
                    name: currentMenus[currentMenus.length - 1].name,
                    key: currentMenus[currentMenus.length - 1].key
                }
                href(this.props.parentThis, url, urlParams);
            } else {
                message.error("无权限查看");
            }
        }
    }

    render() {
        const { authorityShow } = this.state;
        return (
            <React.Fragment>
                {authorityShow && <Charts id="map1" options={this.state.mapOptions} onClick={(params) => this.onClick(params)} />}
                { !authorityShow && <div className="no-authority-box">无权限查看</div>}
            </React.Fragment>
        )
    }
}

class BarCharts extends React.Component {

    constructor(props) {
        super(props);
        this.barOptions = {
            title: {
                text: '',
                textAlign: "left",
                textStyle: { color: "#fff", fontSize: "16" }
            },
            offset: 0,
            grid: {
                left: 30,
                right: 0,
            },
            xAxis: {
                axisLine: {
                    lineStyle: {
                        color: "#4e5773"
                    }
                },
                axisTick: {
                    show: false
                },
                data: []
            },
            yAxis: {
                axisLine: {
                    lineStyle: {
                        color: "#4e5773"
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: "#373b45"
                    }
                },
                name: "飞机架数"
            },
            textStyle: {
                color: "#a5a7ad",
            },
            // 三竖
            // series: [
            //     {
            //         name: '低风险',
            //         type: 'bar',
            //         data: [],
            //         itemStyle: { color: "#53e57c" },
            //         label: {
            //             normal: {
            //                 show: true,
            //                 position: 'top'
            //             }
            //         },
            //     },
            //     {
            //         name: '中风险',
            //         type: 'bar',
            //         data: [],
            //         itemStyle: { color: "#fddd54" },
            //         label: {
            //             normal: {
            //                 show: true,
            //                 position: 'top'
            //             }
            //         },
            //     },
            //     {
            //         name: '高风险',
            //         type: 'bar',
            //         barGap: 0,
            //         barCategoryGap: 1,
            //         data: [],
            //         itemStyle: { color: "#fd3636" },
            //         label: {
            //             normal: {
            //                 show: true,
            //                 position: 'top'
            //             }
            //         },
            //     }
            // ],
            // 一竖
            series: [
                {
                    name: '低风险',
                    type: 'bar',
                    stack: "风险",
                    data: [],
                    itemStyle: { color: "#53e57c" },
                    label: {
                        normal: {
                            show: true,
                            position: 'inside',
                            color: "#fff"
                        }
                    },
                },
                {
                    name: '中风险',
                    type: 'bar',
                    stack: "风险",
                    data: [],
                    itemStyle: { color: "#fddd54" },
                    label: {
                        normal: {
                            show: true,
                            position: 'inside',
                            color: "#fff"
                        }
                    },
                },
                {
                    name: '高风险',
                    type: 'bar',
                    stack: "风险",
                    data: [],
                    itemStyle: { color: "#fd3636" },
                    label: {
                        normal: {
                            show: true,
                            position: 'inside',
                            color: "#fff"
                        }
                    },
                }
            ]
        };
        this.state = {
            authorityShow: isAuthority(BAR, props.authority),
            params1: { condition: "", flightStatus: "" },
            params2: { condition: "", flightStatus: "" },
            params3: { condition: "", flightStatus: "" },
            branchList1: [],
            branchList2: [],
            branchList3: [],
            barOptions1: copyObj(this.barOptions),
            barOptions2: copyObj(this.barOptions),
            barOptions3: copyObj(this.barOptions)
        };
    }

    componentDidMount() {
        // 调用父组件方法把当前实例传给父组件
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        };
    }

    handleData(barOptions, data, name) {
        barOptions.series[0].data = data.lowRisk;
        barOptions.series[1].data = data.mediumRisk;
        barOptions.series[2].data = data.hightRick;
        barOptions.xAxis.data = data.companyName;
        barOptions.title.text = name;
        return barOptions;
    }

    getAllHangBili(num, name, dimension) {
        let This = this;
        post({
            url: "flight/queryAllHangBili",
            data: { dimension: dimension, status: num.toString() },
            timeout: 120,
            success: data => {
                switch (num) {
                    case 1:
                        let { barOptions1 } = this.state;
                        barOptions1 = This.handleData(barOptions1, data, name);
                        This.setState({
                            barOptions1: barOptions1,
                            params1: { condition: dimension, flightStatus: name },
                            branchList1: data.branchList
                        });
                        break;
                    case 2:
                        let { barOptions2 } = this.state;
                        barOptions2 = This.handleData(barOptions2, data, name);
                        This.setState({
                            barOptions2: barOptions2,
                            params2: { condition: dimension, flightStatus: name },
                            branchList2: data.branchList
                        });
                        break;
                    case 3:
                        let { barOptions3 } = this.state;
                        barOptions3 = This.handleData(barOptions3, data, name);
                        This.setState({
                            barOptions3: barOptions3,
                            params3: { condition: dimension, flightStatus: name },
                            branchList3: data.branchList
                        });
                        break;
                }
            }
        });
    }

    goto(branchList, riskValue, flightStatus, type, condition, chnDescShort) {
        if (branchList.indexOf(chnDescShort) > -1) {
            var url = `/index/flightRisk/FlightList`;
            var currentMenus = getCurrentMenu(this.props.parentThis.props, url);
            this.props.parentThis.props.updateCurrentMenu({
                currentMenus: currentMenus
            });
            setSession("flightList", JSON.stringify({ riskValue, flightStatus, type, condition, chnDescShort }));
            let urlParams = {
                name: currentMenus[currentMenus.length - 1].name,
                key: currentMenus[currentMenus.length - 1].key
            }
            href(this.props.parentThis, url, urlParams);
        } else {
            message.error("无权限查看");
        }
    }

    onClick(params, obj) {
        var type = "bar";
        var chnDescShort = params.name;
        var riskValue = params.seriesName;
        var condition = obj.condition;
        var flightStatus = obj.flightStatus;
        if (riskValue == "高风险") {
            riskValue = "H";
        } else if (riskValue == "中风险") {
            riskValue = "M";
        } else if (riskValue == "低风险") {
            riskValue = "L";
        }
        if (condition == "flit") {
            condition = "conditionBranchCode";
        } else if (condition == "acft") {
            condition = "conditionTailNr";
        } else if (condition == "crew") {
            condition = "crew";
        } else if (condition == "arpt") {
            condition = "arpt";
        }
        var branchList = [];
        if (flightStatus == "起飞") {
            flightStatus = "flying";
            branchList = this.state.branchList1;
        } else if (flightStatus == "航巡") {
            flightStatus = "cruise";
            branchList = this.state.branchList2;
        } else if (flightStatus == "着陆") {
            flightStatus = "landed";
            branchList = this.state.branchList3;
        }
        this.goto(branchList, riskValue, flightStatus, type, condition, chnDescShort);
    }

    render() {
        const { authorityShow } = this.state;
        return (
            <React.Fragment>
                { authorityShow && <Charts id="bar1" className="mt70" options={this.state.barOptions1} onClick={params => this.onClick(params, this.state.params1)} />}
                { !authorityShow && <div className="no-authority-box mt70">无权限查看</div>}
                { authorityShow && <Charts id="bar2" options={this.state.barOptions2} onClick={params => this.onClick(params, this.state.params2)} />}
                { !authorityShow && <div className="no-authority-box">无权限查看</div>}
                { authorityShow && <Charts id="bar3" options={this.state.barOptions3} onClick={params => this.onClick(params, this.state.params3)} />}
                { !authorityShow && <div className="no-authority-box">无权限查看</div>}
            </React.Fragment>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        permission: state.permission,
        currentMenu: state.currentMenu,
        authority: state.authority
    };
}

const mapDispatchToProps = (dispatch) => {
    return {
        updateCurrentMenu: (currentMenu) => dispatch(updateCurrentMenu(currentMenu))
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(Home));