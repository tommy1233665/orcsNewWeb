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
      fltExtrOilList: {},
    };
  }
  componentDidMount() {
    // 初始化
    var This = this;
    var myChart = echarts.init(document.getElementById("extraUse"));
    window.addEventListener("resize", function () {
      myChart.resize();
    });
    myChart.clear()
    myChart.on("click", function (params) {
      This.props.showDialog(params, "点击事件");
    });
    myChart.showLoading(); //数据加载完之前先显示一段简单的loading动画
  }
  // 请求接口   TODO
  initChart = (params, name) => {
    // get({
    //   url: "json/test.json",
    // get({
    //   url: "json/test.json",
    post({
      url: "qarInfoController/queryFltExtraOilInfo",
      data: params,
      success: function (data) {
        // TODO 调用post时取下面注释掉的对象结构
        var data = data.fltExtraOilDto.fltExtrOilList;
        var series = [];
        var extrOilSection = [];
        //初始化echarts
        var myChart = echarts.init(document.getElementById("extraUse"));
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
                useType: 1,
              });
            }
          }
          myChart.hideLoading(); //隐藏加载动画
          myChart.setOption({
            title: {
              text: "航程油量偏差分布情况",
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
                show: false, //是否显示
                realtime: true, //
                zoomLock: true,
                bottom: "0",
                start: 0, //数据窗口范围的起始百分比,表示30%, 伸缩条开始位置（1-100），可以随时更改
                end: 100, //数据窗口范围的结束百分比,表示70%
                textStyle: {
                  color: "white",
                },
                showDetail: false,
              },
              {
                type: "inside", //鼠标滚轮
                realtime: true,
                zoomOnMouseWheel: false,
              },
            ],
            legend: {
              show: false,
            },
            xAxis: [
              {
                type: "category",
                boundaryGap: true,
                name: "额外油使用量（吨）",
                nameTextStyle: {
                  color: "#fff",
                  padding: [50, 0, 0, 0],
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
                min: 0,
                name: "航班量",
                nameTextStyle: {
                  color: "#fff",
                },
                boundaryGap: [0.2, 0.2],
                axisLabel: {
                  formatter: function (value) {
                    return value;
                  },
                },
                axisLabel: {
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
    return <div id="extraUse" style={{ width: "100%", height: 500 }}></div>;
  }
}

export default ExtraTimeChart;
