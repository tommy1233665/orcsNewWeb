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

class FlightHeightChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    // this.initChart();
  }

  // 显示全部数据
  showAllData(e) {
    var myChart = echarts.init(document.getElementById("flightHeight"));
    myChart.setOption({
      dataZoom: [
        {
          end: 100,
        },
      ],
    });
  }
  // 初始化数据
  initChart = (params) => {
    // 初始化
    var myChart = echarts.init(document.getElementById("flightHeight"));
    window.addEventListener("resize", function () {
      myChart.resize();
    });
    myChart.showLoading(); //数据加载完之前先显示一段简单的loading动画
    post({
      url: "qarInfoController/queryPostFltWaypointDtosInfo",
      data: params,
      success: function (data) {
        var data = data.resultList;
        var category = [];
        var flyStraightRate = [];
        var saveTime = [];
        var flyAroundRate = [];
        var moreTime = [];
        var avgEfl = [];
        var digitAfl = [];
        var medianPosndis = []; // 偏离计划距离
        var medianEfr = []; //实际剩油中位数
        var medianAfr = []; //计划剩油中位数
        var medianFrDevt = []; //剩油偏差中位数
        var medianZtmdif = []; //到上一个点的时间偏差中位数
        if (data) {
          for (var i = 0; i < data.length; i++) {
            category.push(data[i].posnName);
            avgEfl.push(data[i].avgEfl.toFixed(2));
            digitAfl.push(data[i].digitAfl.toFixed(2));
            flyStraightRate.push(data[i].flyStraightRate);
            saveTime.push((data[i].saveTime || 0).toFixed(0));
            moreTime.push((data[i].moreTime || 0).toFixed(0));
            flyAroundRate.push((data[i].flyAroundRate || 0).toFixed(2));
            medianPosndis.push((data[i].medianPosndis || 0).toFixed(2));
            medianEfr.push((data[i].medianEfr || 0).toFixed(2));
            medianAfr.push((data[i].medianAfr || 0).toFixed(2));
            medianFrDevt.push((data[i].medianFrDevt || 0).toFixed(2));
            medianZtmdif.push((data[i].medianZtmdif || 0).toFixed(0));
          }
          //默认显示20条数据（当数据多余20条时）s
          if (digitAfl.length > 9) {
            var dataZoom_end = (9 / digitAfl.length) * 100;
          } else {
            var dataZoom_end = 100;
          }
        }
        myChart.showLoading(); //数据加载完之前先显示一段简单的loading动画
        // 绘制图表
        myChart.setOption({
          title: {
            text: "",
            // bottom: 30,
            // x: "center",
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
            formatter: function (params, ticket, callback) {
              var htmlStr = "";
              for (var i = 0; i < params.length; i++) {
                var param = params[i];
                var xName = param.name; //x轴的名称
                var seriesName = param.seriesName; //图例名称
                var value = param.value; //y轴值
                var color = param.color; //图例颜色

                if (i === 0) {
                  htmlStr += xName + "<br/>"; //x轴的名称
                }
                htmlStr += "<div>";
                // 具体显示的数据【字段名称：seriesName，值：value】
                // 这里判断一下name，如果是我们需要特殊处理的，就处理
                if (seriesName === "直飞概率" || seriesName === "绕飞概率") {
                  // 前面一条线，后面一条线【具体样式自己写】
                  htmlStr +=
                    '<span style="margin-right:5px;display:inline-block;width:10px;height:10px;border-radius:5px;background-color:' +
                    color +
                    ';"></span>';
                  htmlStr += seriesName + "：" + value + " " + "%";
                } else if (
                  seriesName === "平均节约" ||
                  seriesName === "平均多飞" ||
                  seriesName === "到上一个点的时间偏差中位数"
                ) {
                  htmlStr +=
                    '<span style="margin-right:5px;display:inline-block;width:10px;height:10px;border-radius:5px;background-color:' +
                    color +
                    ';"></span>';
                  htmlStr += seriesName + "：" + value + " " + "分钟";
                } else if (seriesName === "偏离计划距离") {
                  htmlStr +=
                    '<span style="margin-right:5px;display:inline-block;width:10px;height:10px;border-radius:5px;background-color:' +
                    color +
                    ';"></span>';
                  htmlStr += seriesName + "：" + value + " " + "公里";
                } else if (
                  seriesName === "实际剩油中位数" ||
                  seriesName === "计划剩油中位数" ||
                  seriesName === "剩油偏差中位数"
                ) {
                  htmlStr +=
                    '<span style="margin-right:5px;display:inline-block;width:10px;height:10px;border-radius:5px;background-color:' +
                    color +
                    ';"></span>';
                  htmlStr += seriesName + "：" + value + " " + "吨";
                } else {
                  // 正常显示的数据，走默认
                  htmlStr +=
                    '<span style="margin-right:5px;display:inline-block;width:10px;height:10px;border-radius:5px;background-color:' +
                    color +
                    ';"></span>';
                  htmlStr += seriesName + "：" + value + " " + "英尺";
                }

                htmlStr += "</div>";
              }
              return htmlStr;
            },
          },
          dataZoom: [
            {
              type: "slider", //图表下方的伸缩条
              show: false, //是否显示
              start: 0,
              end: dataZoom_end,
              textStyle: {
                color: "white",
              },
              zoomOnMouseWheel: true,
              moveOnMouseMove: true,
            },
            {
              type: "inside", //鼠标滚轮
              zoomOnMouseWheel: true,
              moveOnMouseMove: true,
              realtime: true,
              // start: 10,
              // end: 10,
            },
          ],
          legend: {
            textStyle: {
              color: "#a5a7ad",
            },
            data: ["分析数据(70%航班达到的飞行高度)", "计划数据"],
          },
          xAxis: [
            {
              type: "category",
              boundaryGap: true,
              axisLabel: {
                show: true,
                textStyle: {
                  color: "#ffffff",
                },
                interval: 0,
                rotate: 20, //角度顺时针计算的
              },
              data: category,
            },
          ],
          yAxis: [
            {
              type: "value",
              scale: true,
              name: "分析数据",
              nameTextStyle: {
                color: "#fff",
              },
              // max: 300,
              min: 0,
              splitNumber: 10,
              minInterval: 0,
              // boundaryGap: [0.2, 0.2],
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
              name: "分析数据(70%航班达到的飞行高度)",
              type: "line",
              itemStyle: {
                color: "#3D9AD1",
              },
              data: digitAfl,
              label: {
                show: true,
                formatter: "{c}",
                // formatter: function (value) {
                //   return value
                // },
              },
            },
            {
              name: "计划数据",
              type: "line",
              itemStyle: {
                color: "#7FBD17",
              },
              data: avgEfl,
              label: {
                show: true,
                formatter: "{c}",
              },
            },
            {
              name: "直飞概率",
              type: "line",
              itemStyle: {
                color: "pink",
              },
              symbolSize: 0, // symbol的大小设置为0
              showSymbol: false, // 不显示symbol
              lineStyle: {
                width: 0, // 线宽是0
                color: "rgba(0, 0, 0, 0)", // 线的颜色是透明的
              },
              data: flyStraightRate,
              // label: {
              //   show: true,
              //   formatter: "{c}%",
              // },
            },
            {
              name: "平均节约",
              type: "line",
              itemStyle: {
                color: "#B93BE6",
              },
              symbolSize: 0, // symbol的大小设置为0
              showSymbol: false, // 不显示symbol
              lineStyle: {
                width: 0, // 线宽是0
                color: "rgba(0, 0, 0, 0)", // 线的颜色是透明的
              },
              data: saveTime,
            },
            {
              name: "绕飞概率",
              type: "line",
              itemStyle: {
                color: "#FFCD43",
              },
              symbolSize: 0, // symbol的大小设置为0
              showSymbol: false, // 不显示symbol
              lineStyle: {
                width: 0, // 线宽是0
                color: "rgba(0, 0, 0, 0)", // 线的颜色是透明的
              },
              data: flyAroundRate,
            },
            {
              name: "平均多飞",
              type: "line",
              itemStyle: {
                color: "#DD5245",
              },
              symbolSize: 0, // symbol的大小设置为0
              showSymbol: false, // 不显示symbol
              lineStyle: {
                width: 0, // 线宽是0
                color: "rgba(0, 0, 0, 0)", // 线的颜色是透明的
              },
              data: moreTime,
            },
            {
              name: "偏离计划距离",
              type: "line",
              itemStyle: {
                color: "red",
              },
              symbolSize: 0, // symbol的大小设置为0
              showSymbol: false, // 不显示symbol
              lineStyle: {
                width: 0, // 线宽是0
                color: "rgba(0, 0, 0, 0)", // 线的颜色是透明的
              },
              data: medianPosndis,
            },
            {
              name: "实际剩油中位数",
              type: "line",
              itemStyle: {
                color: "yellow",
              },
              symbolSize: 0, // symbol的大小设置为0
              showSymbol: false, // 不显示symbol
              lineStyle: {
                width: 0, // 线宽是0
                color: "rgba(0, 0, 0, 0)", // 线的颜色是透明的
              },
              data: medianEfr,
            },
            {
              name: "计划剩油中位数",
              type: "line",
              itemStyle: {
                color: "black",
              },
              symbolSize: 0, // symbol的大小设置为0
              showSymbol: false, // 不显示symbol
              lineStyle: {
                width: 0, // 线宽是0
                color: "rgba(0, 0, 0, 0)", // 线的颜色是透明的
              },
              data: medianAfr,
            },
            {
              name: "剩油偏差中位数",
              type: "line",
              itemStyle: {
                color: "green",
              },
              symbolSize: 0, // symbol的大小设置为0
              showSymbol: false, // 不显示symbol
              lineStyle: {
                width: 0, // 线宽是0
                color: "rgba(0, 0, 0, 0)", // 线的颜色是透明的
              },
              data: medianFrDevt,
            },
            {
              name: "到上一个点的时间偏差中位数",
              type: "line",
              itemStyle: {
                color: "blue",
              },
              symbolSize: 0, // symbol的大小设置为0
              showSymbol: false, // 不显示symbol
              lineStyle: {
                width: 0, // 线宽是0
                color: "rgba(0, 0, 0, 0)", // 线的颜色是透明的
              },
              data: medianZtmdif,
            },
          ],
        });
      },
    });
  };
  render() {
    return <div id="flightHeight" style={{ width: "100%", height: 500 }}></div>;
  }
}

export default FlightHeightChart;