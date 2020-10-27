import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { updateCurrentMenu } from "reduxs/action";
import { CardCommon, CommonTable } from "common/component";
import { Form, Row, Col, Select, Button, Slider, Modal } from "antd";
// 计划油量与实际耗油图
import StackedCharts from "../common/stackedBarChart/stackedCharts";
// 额外油使用时间
import ExtraTimeChart from "../common/stackedBarChart/extraTimeChart";
// 额外油使用量图
import ExtraUse from "../common/stackedBarChart/extraUse";
// 飞行高度图
import FlightHeightChart from "../common/stackedBarChart/flightHeightChart";
// 使用油弹窗明细
import DialogModel from "../model/dialogModel";
import { get, post } from "common/http";
import { downloadFile } from "common/commonFn";
const { confirm } = Modal;

class QarOilAnalysis extends React.Component {
  // 初始化表单数据
  constructor(props) {
    super(props);

    // 用来实时更新表格中风险详情值
    this.state = {
      flyRmArptRiskList: [],
      authority: false,
      sliderDisabled: false,
      fltExtraOilDto: {},
      fltExtraDetailDto: {},
      postFltTimeDevtDtos: {},
      cruise: {},
      DES: {},
      CLB: {},
      flightCode: props.match.params.flightCode,
      listData: [],
      fltExtrTimeDtoData: {},
      time: 1,
      flightRouteNo: "",
      truncationRatio: 50,
      disabled: true
    };
    this.modal;
  }

  // 初始化chart成功才可以操作
  disableFlightHeightSelect = (obj) => {
    this.setState({
      disabled: obj,
      sliderDisabled: obj
    })
  }
  // 航路代号选择
  getQueryfindFlightRouteNoData = () => {
    let params = {
      soflSeqNr: this.state.flightCode,
    };
    post({
      url: "qarInfoController/queryfindFlightRouteNo",
      data: params,
      success: (data) => {
        var res = data.flightRouteNo;
        this.setState({
          listData: res,
          flightRouteNodDefaultValue: res,
        });
        // 初始化航路代号高度趋势图
        this.initFlightHeight();
      },
    });
  };

  // 统计时间选择
  statisticsHandleChange = (data) => {
    this.setState({
      time: data,
    });
    let params = {
      soflSeqNr: this.state.flightCode,
      time: data || 1,
    };
    this.myChildExtraUse.initChart(params, "额外油使用量");
    this.myChildExtraTimeChart.initChart(params, "额外油使用时间");
    this.queryFltExtraOilInfo(params);
    this.queryFltExtraTimeDtoInfo(params);
  };
  // 显示全部高度图数据
  showFHCallData = () => {
    this.myChildFlightHeightChart.showAllData();
  };
  //定义一个拿子组件返回值this的函数
  onRef = (ref) => {
    this.child = ref;
  };
  // 柱子图的点击柱子事件
  showDialog = (data) => {
    let params = {
      soflSeqNr: this.state.flightCode,
      time: this.state.time,
      useType: "",
    };
    this.child.showModal(data, params);
  };
  // 航路代号选择
  flightHandleChange = (data) => {
    this.setState({
      flightRouteNo: data,
      flightRouteNodDefaultValue: data
    });
    let params = {
      soflSeqNr: this.state.flightCode,
      flightRouteNo: data,
      truncationRatio: this.state.truncationRatio,
    };
    // console.log(params, this.state.listData);
    this.myChildFlightHeightChart.initChart(params, "航路代号选择");
  };
  // 滑动块事件
  sliderOnAfterChange = (e) => {
    this.setState({
      sliderDisabled: true,
      truncationRatio: e,
    });
    let params = {
      soflSeqNr: this.state.flightCode,
      flightRouteNo: this.state.flightRouteNo || this.state.listData[0],
      truncationRatio: e || this.state.truncationRatio,
    };
    this.myChildFlightHeightChart.initChart(params);
    setTimeout(() => {
      this.setState({
        sliderDisabled: false,
      });
    }, 1000);
  };

  // 初始化航路代号高度趋势图
  initFlightHeight = () => {
    let params = {
      soflSeqNr: this.state.flightCode,
      flightRouteNo: this.state.listData[0],
      truncationRatio: this.state.truncationRatio,
    };
    this.myChildFlightHeightChart.initChart(params, "航路代号选择");
  };

  // 导出全部航路代号选择
  exportAll = () => {
    const This = this;
    confirm({
      title: "确定导出全部航线吗？",
      onOk() {
        var params = {
          soflSeqNr: This.state.flightCode,
          flightRouteNo: This.state.flightRouteNo || This.state.listData[0],
        };
        post({
          url: "qarInfoController/exportPostWaypointInfo",
          data: params,
          success: (data) => {
            downloadFile(data, "导出全部航路");
          },
          error: (data) => {
            message.error("导出失败！");
          },
        });
      },
    });
  };


  // 相关油使用量
  queryFltExtraOilInfo = (params) => {
    // let params = {
    //   soflSeqNr: this.state.flightCode,
    //   time: 2,
    //   // useType: 2
    // };
    post({
      url: "qarInfoController/queryFltExtraOilInfo",
      data: params,
      success: (data) => {
        var data = data.fltExtraOilDto;
        this.setState({
          fltExtraOilDto: data,
        });
      },
    });
  };

  // 相关油量使用时间
  queryFltExtraTimeDtoInfo = (obj = {}) => {
    let params = {
      soflSeqNr: this.state.flightCode,
      time: this.state.time,
    };
    post({
      url: "qarInfoController/queryFltExtraTimeDtoInfo",
      data: params,
      success: (data) => {
        var data = data.fltExtrTimeDto;
        this.setState({
          fltExtrTimeDtoData: data,
        });
      },
    });
  };

  // 相关油量数据表格
  fltExtraDetailDto = (obj = {}) => {
    let params = {
      soflSeqNr: this.state.flightCode,
      time: this.state.time,
    };
    post({
      url: "qarInfoController/queryFltExtraDetailDtoInfo",
      data: params,
      success: (data) => {
        var data = data.fltExtraDetailDto;
        this.setState({
          fltExtraDetailDto: data,
        });
      },
    });
  };

  // 时间偏差数据表格
  queryPostFltTimeDevtDtoInfo = (obj = {}) => {
    let params = {
      soflSeqNr: this.state.flightCode,
    };
    // get({
    // url: "json/postFltTimeDevtDtos.json",
    post({
      url: "qarInfoController/queryPostFltTimeDevtDtoInfo",
      data: params,
      success: (data) => {
        var res = data.postFltTimeDevtDtos;
        var CRUISE = {};
        var DES = {};
        var CLB = {};
        res.map((item) => {
          if (item.fltPhase === "CRUISE") {
            CRUISE.avgTimeDevt = item.avgTimeDevt;
            CRUISE.moreFiveRate = item.moreFiveRate;
            CRUISE.moreFifteenRate = item.moreFifteenRate + ' %';
            CRUISE.lessFiveRate = item.lessFiveRate + ' %';
            CRUISE.lessTenRate = item.lessTenRate + ' %';
            CRUISE.moreTenRate = item.moreTenRate + ' %';
          }
          if (item.fltPhase === "DES") {
            DES.avgTimeDevt = item.avgTimeDevt;
            DES.moreFiveRate = item.moreFiveRate;
            DES.moreFifteenRate = item.moreFifteenRate + ' %';
            DES.lessFiveRate = item.lessFiveRate + ' %';
            DES.lessTenRate = item.lessTenRate + ' %';
            DES.moreTenRate = item.moreTenRate + ' %';
          }
          if (item.fltPhase === "CLB") {
            CLB.avgTimeDevt = item.avgTimeDevt;
            CLB.moreFiveRate = item.moreFiveRate;
            CLB.moreFifteenRate = item.moreFifteenRate + ' %';
            CLB.lessFiveRate = item.lessFiveRate + ' %';
            CLB.lessTenRate = item.lessTenRate + ' %';
            CLB.moreTenRate = item.moreTenRate + ' %';
          }
        });
        this.setState({
          cruise: CRUISE,
          DES: DES,
          CLB: CLB,
        });
      },
    });
  };

  componentWillMount() {
    // 获取航路代号选择数据
    this.getQueryfindFlightRouteNoData()
  }

  componentDidMount() {
    let params = {
      soflSeqNr: this.state.flightCode,
      time: this.state.time,
    };
    // 初始化航路代号高度趋势图
    // this.initFlightHeight();
    // 初始化计划油量与实际耗油图（第一个趋势图）
    this.myChildStackedCharts.initChart(params.soflSeqNr);
    // 相关油量使用时间
    this.queryFltExtraTimeDtoInfo();
    // 相关油量使用时间表格
    this.fltExtraDetailDto();
    // 时间偏差数据表格
    this.queryPostFltTimeDevtDtoInfo();
    // 初始化相关油量数据图表
    this.myChildExtraUse.initChart(params);
    this.myChildExtraTimeChart.initChart(params);
    this.queryFltExtraOilInfo(params);
  }
  render() {
    // const { authority } = this.props;
    const authority = "1";
    const flyRmArptRiskList = [
      {
        medianAirFuelDevt: this.state.fltExtraDetailDto.medianAirFuelDevt,
        medianAirTimeDevt: this.state.fltExtraDetailDto.medianAirTimeDevt,
        medianFlDevt: this.state.fltExtraDetailDto.medianFlDevt,
        medianHtDevt: this.state.fltExtraDetailDto.medianHtDevt,
        medianWtDevt: this.state.fltExtraDetailDto.medianWtDevt,
        medianFlandonBeginOil: this.state.fltExtraDetailDto
          .medianFlandonBeginOil,
        medianWtDevt: this.state.fltExtraDetailDto.medianWtDevt,
        medianExtrFuel: this.state.fltExtraDetailDto.medianExtrFuel,
        medianExtrTime: this.state.fltExtraDetailDto.medianExtrTime,
        medianTargetArrFuel: this.state.fltExtraDetailDto.medianTargetArrFuel,
        medianLandSpeedDevtRate: this.state.fltExtraDetailDto
          .medianLandSpeedDevtRate,
        medianFrouteMileDevt: this.state.fltExtraDetailDto.medianFrouteMileDevt,
        fltVolume: this.state.fltExtraDetailDto.fltVolume,
      },
    ];
    const timeRiskList = [
      {
        itemNum: "爬升",
        avgTimeDevt: this.state.CLB.avgTimeDevt,
        moreFiveRate: this.state.CLB.moreFiveRate,
        moreFiveRate: this.state.CLB.moreFiveRate,
        moreFifteenRate: this.state.CLB.moreFifteenRate,
        lessFiveRate: this.state.CLB.lessFiveRate,
        lessTenRate: this.state.CLB.lessTenRate,
        moreTenRate: this.state.CLB.moreTenRate,
      },
      {
        itemNum: "巡航",
        avgTimeDevt: this.state.cruise.avgTimeDevt,
        moreFiveRate: this.state.cruise.moreFiveRate,
        moreFiveRate: this.state.cruise.moreFiveRate,
        moreFifteenRate: this.state.cruise.moreFifteenRate,
        lessFiveRate: this.state.cruise.lessFiveRate,
        lessTenRate: this.state.cruise.lessTenRate,
        moreTenRate: this.state.cruise.moreTenRate,
      },
      {
        itemNum: "下降",
        avgTimeDevt: this.state.DES.avgTimeDevt,
        moreFiveRate: this.state.DES.moreFiveRate,
        moreFiveRate: this.state.DES.moreFiveRate,
        moreFifteenRate: this.state.DES.moreFifteenRate,
        lessFiveRate: this.state.DES.lessFiveRate,
        lessTenRate: this.state.DES.lessTenRate,
        moreTenRate: this.state.DES.moreTenRate,
      },
    ];

    const { Option } = Select;
    const FormItem = Form.Item;

    const marks = {
      0: "0",
      10: "10",
      20: "20",
      30: "30",
      40: "40",
      50: "50",
      60: "60",
      70: "70",
      80: "80",
      90: "90",
      100: "100",
    };
    const OilTableColumns = [
      { title: "航程油量偏差中值", dataIndex: "medianAirFuelDevt", width: 100 },
      { title: "空中时间偏差中值", dataIndex: "medianAirTimeDevt", width: 100 },
      { title: "高度偏差中值", dataIndex: "medianFlDevt", width: 100 },
      { title: "最大高度与计划差中值", dataIndex: "medianHtDevt", width: 120 },
      { title: "业载偏差中值", dataIndex: "medianWtDevt", width: 100 },
      { title: "额外油中值", dataIndex: "medianExtrFuel", width: 100 },
      { title: "额外时间中值", dataIndex: "medianExtrTime", width: 100 },
      { title: "计划落地油中值", dataIndex: "medianTargetArrFuel", width: 100 },
      {
        title: "实际落地油中值",
        dataIndex: "medianFlandonBeginOil",
        width: 100,
      },
      {
        title: "地速偏差中值",
        dataIndex: "medianLandSpeedDevtRate",
        width: 100,
      },
      {
        title: "地面距离偏差中值",
        dataIndex: "medianFrouteMileDevt",
        width: 100,
      },
      { title: "总航班量", dataIndex: "fltVolume", width: 100 },
    ];
    const TimeTableColumns = [
      { title: "阶段", dataIndex: "itemNum", width: 100 },
      { title: "平均时间偏差", dataIndex: "avgTimeDevt", width: 100 },
      { title: "超5分钟概率", dataIndex: "moreFiveRate", width: 100 },
      { title: "超10分钟概率", dataIndex: "moreTenRate", width: 100 },
      { title: "超15分钟概率", dataIndex: "moreFifteenRate", width: 100 },
      { title: "少5分钟概率", dataIndex: "lessFiveRate", width: 100 },
      { title: "少10分钟概率", dataIndex: "lessTenRate", width: 100 },
    ];

    let OilTableOptions = {
      notCheck: true,
      bordered: false,
      scroll: { x: 1000, y: 350 },
      columns: OilTableColumns,
      table: { dataList: flyRmArptRiskList, loading: false },
      needPage: false,
    };
    let TimeTableOptions = {
      notCheck: true,
      bordered: false,
      scroll: { x: 1000, y: 350 },
      columns: TimeTableColumns,
      table: { dataList: timeRiskList, loading: false },
      needPage: false,
    };
    return (
      <div className="flight-risk-detail">
        <Row gutter={16} className="bar-charts">
          <Col span={24}>
            <CardCommon title="计划油量与实际耗油图">
              <StackedCharts
                ref={(childStackedCharts) => {
                  this.myChildStackedCharts = childStackedCharts;
                }}
                parentThis={this}
              />
            </CardCommon>
          </Col>
        </Row>
        <CardCommon title="相关油量数据图表">
          <FormItem
            label="统计时间"
            labelCol={{ span: 1 }}
            wrapperCol={{ span: 23 }}
            required
          >
            <Select
              // labelInValue
              // allowClear
              defaultValue="自然月"
              style={{ width: 120 }}
              onChange={this.statisticsHandleChange}
            >
              <Option value={1}>自然月</Option>
              <Option value={2}>前30天</Option>
              <Option value={3}>前60天</Option>
              <Option value={4}>前365天</Option>
            </Select>
          </FormItem>
          <Row gutter={16} className="extraTime-bar-charts">
            <Col span={12}>
              <div className="extra-time-summary-content">
                <div className="extraTimeSummary">
                  <p>中位数：{this.state.fltExtraOilDto.medianFltExtrOil} kg</p>
                  <p>最大值：{this.state.fltExtraOilDto.maxFltExtrOil} kg</p>
                  <p>最小值：{this.state.fltExtraOilDto.minFltExtrOil} kg</p>
                </div>
                <div className="extraTimeSummary">
                  <p>
                    90%航班
                    {` < ` + this.state.fltExtraOilDto.tenPercentFltExtrOil} kg
                  </p>
                  <p>
                    99%航班
                    {` < ` + this.state.fltExtraOilDto.onePercentFltExtrOil} kg
                  </p>
                </div>
                <div className="extraTimeSummary">
                  <p>额外油使用率</p>
                  <p className="otherIol">
                    {this.state.fltExtraOilDto.fltExtrOilRate} %
                  </p>
                </div>
              </div>
              <ExtraUse
                ref={(childExtraUse) => {
                  this.myChildExtraUse = childExtraUse;
                }}
                showDialog={this.showDialog}
              ></ExtraUse>
            </Col>
            <Col span={12}>
              <div className="extra-time-summary-content">
                <div className="extraTimeSummary">
                  <p>
                    中位数：{this.state.fltExtrTimeDtoData.medianFltExtrOil} min
                  </p>
                  <p>
                    最大值：{this.state.fltExtrTimeDtoData.maxFltExtrOil} min
                  </p>
                  <p>
                    最小值：{this.state.fltExtrTimeDtoData.minFltExtrOil} min
                  </p>
                </div>
                <div className="extraTimeSummary">
                  <p>
                    90%航班{" < "}
                    {this.state.fltExtrTimeDtoData.tenPercentFltExtrOil} min
                  </p>
                  <p>
                    99%航班{" < "}
                    {this.state.fltExtrTimeDtoData.onePercentFltExtrOil}
                    min
                  </p>
                </div>
              </div>
              <ExtraTimeChart
                ref={(childExtraTimeChart) => {
                  this.myChildExtraTimeChart = childExtraTimeChart;
                }}
                showDialog={this.showDialog}
              ></ExtraTimeChart>
              <DialogModel onRef={this.onRef} />
            </Col>
          </Row>
          <CommonTable options={OilTableOptions}></CommonTable>
        </CardCommon>
        <Row gutter={16} className="table-div">
          <Col span={24}>
            <CardCommon title="时间偏差表格">
              <CommonTable options={TimeTableOptions}></CommonTable>
            </CardCommon>
          </Col>
        </Row>
        <Row gutter={16} className="flightHeightChartStyle">
          <Col span={24}>
            <CardCommon title="航路点飞行高度图">
              <FormItem
                label="航路代号选择"
                labelCol={{ span: 2 }}
                wrapperCol={{ span: 22 }}
                required
              >
                <Select
                  // labelInValue
                  // defaultValue={this.state.flightRouteNodDefaultValue}
                  value={this.state.flightRouteNodDefaultValue}
                  style={{ width: 120 }}
                  onChange={this.flightHandleChange.bind(this)}
                >
                  {this.state.listData.map((item, index) => {
                    return (
                      <Option value={item} key={index}>
                        {item}
                      </Option>
                    );
                  })}
                </Select>
                <Button
                  style={{ marginLeft: 16 }}
                  type="primary"
                  onClick={this.exportAll}
                  disabled={this.state.disabled}
                >
                  导出Excel
                </Button>
                <Button
                  style={{ marginLeft: 16 }}
                  type="primary"
                  onClick={this.showFHCallData}
                  disabled={this.state.disabled}
                >
                  显示全部
                </Button>
              </FormItem>
              <div className="sliderStyleLabel">截断比</div>
              <FlightHeightChart
                disableFlightHeightSelect={this.disableFlightHeightSelect}
                ref={(childFlightHeightChart) => {
                  this.myChildFlightHeightChart = childFlightHeightChart;
                }}
              ></FlightHeightChart>
              <Slider
                className="sliderStyle"
                vertical
                marks={marks}
                step={null}
                dots={false}
                defaultValue={50}
                disabled={this.state.sliderDisabled}
                onAfterChange={this.sliderOnAfterChange}
              />
            </CardCommon>
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    authority: state.authority,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateCurrentMenu: (currentMenu) =>
      dispatch(updateCurrentMenu(currentMenu)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(QarOilAnalysis));
