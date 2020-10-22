import React from "react";
import echarts from "echarts/lib/echarts";
import "echarts/lib/chart/bar";
import "echarts/lib/chart/line";
import "echarts/lib/component/tooltip";
import "echarts/lib/component/title";
import "echarts/lib/component/legend";
import "echarts/lib/component/toolbox";
import "echarts/lib/component/markPoint";
import "echarts/lib/component/markLine";
import { get, post } from "common/http";

class ExtraTimeChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fltExtrTimeDtoData: {},
    };
  }
  componentDidMount() {
    var This = this;
    // 初始化
    var myChart = echarts.init(document.getElementById("extraTime"));
    window.addEventListener("resize", function () {
      myChart.resize();
    });
    myChart.on("click", function (params) {
      This.props.showDialog(params, "点击事件");
    });
    myChart.showLoading(); //数据加载完之前先显示一段简单的loading动画
  }
  // 初始化趋势图
  initChart = (params, name) => {
    // get({
    //   url: "json/timeUseChart.json",
    // get({
    //   url: "json/timeUseChart.json",
    post({
      url: "qarInfoController/queryFltExtraTimeDtoInfo",
      data: params,
      success: (data) => {
        var data = data.fltExtrTimeDto.fltExtrOilList;
        var series = [];
        var extrOilSection = [];
        // 初始化
        var myChart = echarts.init(document.getElementById("extraTime"));
        window.addEventListener("resize", function () {
          myChart.resize();
        });

        if (!data || data === []) {
          myChart.hideLoading(); //隐藏加载动画
          myChart.setOption({
            title: {
              text: '暂无数据',
              x: 'center',
              y: 'center',
              textStyle: {
                color: '#fff',
                fontWeight: 'normal',
                fontSize: 24
              }
            }
          })
        } else {
          if (data) {
            for (var i = 0; i < data.extrOilSection.length; i++) {
              extrOilSection.push(data.extrOilSection[i]);
              series.push({
                value: data.fltAmount[i],
                trueExtrOilSection: data.trueExtrOilSection[i],
                useType: 2,
              });
            }
          }
          myChart.hideLoading(); //隐藏加载动画
          // 绘制图表
          myChart.setOption({
            title: {
              text: "额外油使用时间分布情况",
              top: 30,
              x: "center",
              textStyle: { color: "#9ca0ad", fontSize: "16" },
            },
            tooltip: {
              trigger: "axis",
              axisPointer: {
                type: "cross",
                label: {
                  backgroundColor: "#283b56",
                },
              },
            },
            dataZoom: [
              {
                type: "slider", //图表下方的伸缩条
                show: true, //是否显示
                realtime: true, //
                zoomLock: true,
                bottom: "0",
                start: 0, //数据窗口范围的起始百分比,表示30%, 伸缩条开始位置（1-100），可以随时更改
                end: 100, //数据窗口范围的结束百分比,表示70%
                textStyle: {
                  color: "white",
                },
                // zoomOnMouseWheel: false,
                // id: "dataZoomX",
                // orient: "vertical",
                // startValue: 0, //数据窗口范围的起始数值
                // endValue: 100,
                showDetail: false,
              },
              {
                type: "inside", //鼠标滚轮
                zoomOnMouseWheel: false,
                // realtime: true, //还有很多属性可以设置，详见文档
              },
            ],
            legend: {
              show: false,
            },
            xAxis: [
              {
                type: "category",
                boundaryGap: true,
                name: "额外油使用量时间（分钟）",
                nameTextStyle: {
                  color: "#fff",
                  padding: [30, 0, 0, 0],
                },
                nameLocation: "middle",
                axisLabel: {
                  show: true,
                  textStyle: {
                    color: "#ffffff",
                  },
                  interval: 0,
                  rotate: 20, //角度顺时针计算的
                },
                data: extrOilSection,
              },
            ],
            //主要改这里
            grid: {
              // 控制图的大小，调整下面这些值就可以，
              x: 40,
              x2: 100,
              y2: 100, // y2可以控制 X轴跟Zoom控件之间的间隔，避免以为倾斜后造成 label重叠到zoom上
            },
            yAxis: [
              {
                type: "value",
                scale: true,
                name: "航班量",
                nameTextStyle: {
                  color: "#fff",
                },
                min: 0,
                boundaryGap: [0.2, 0.2],
                axisLabel: {
                  formatter: function (value) {
                    return value;
                  },
                  textStyle: {
                    color: "#a5a7ad",
                  },
                },
              },
            ],
            series: [
              {
                name: "HOLD FUEL",
                type: "bar",
                // yAxisIndex: 1,
                stack: "one",
                barWidth: 20, //柱图宽度
                // barCategoryGap: "60%" /*多个并排柱子设置柱子之间的间距*/,
                barGap: 10,
                itemStyle: {
                  color: "#5A6A89",
                },
                data: series,
              },
            ],
          });
        }
      },
    });
  };
  render() {
    return <div id="extraTime" style={{ width: "100%", height: 500 }}></div>;
  }
}

export default ExtraTimeChart;
