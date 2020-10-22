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

class StackedCharts extends React.Component {
  componentDidMount() {
    //初始化echarts
    var myChart2 = echarts.init(document.getElementById("main"));
    // 显示标题，图例和空的坐标轴
    myChart2.showLoading(); //数据加载完之前先显示一段简单的loading动画
  }
  initChart = (paramsData) => {
    //初始化echarts
    var myChart2 = echarts.init(document.getElementById("main"));
    let params = {
      soflSeqNr: paramsData,
    };
    // console.log(params, "请求数据getData");
    // get({
    // url: "json/fistChart.json",
    post({
      url: "qarInfoController/queryFltOilContrastInfo",
      data: params,
      success: function (data) {
        var categorie2 = []; //类别数组（实际用来盛放X轴坐标值）
        var series1 = [];
        var series2 = [];
        var series3 = [];
        // var series4 = [];
        var series5 = [];
        var series6 = [];
        var series7 = [];
        var result = data.fltOilContrastDtos;
        //请求成功时执行该函数内容，result即为服务器返回的json对象
        if (result.length === 0) {
          myChart2.hideLoading(); //隐藏加载动画
          myChart2.setOption({
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
          //挨个取出类别并填入类别数组
          for (var i = 0; i < result.length; i++) {
            categorie2.push(result[i].fltDt.slice(5) + "-" + result[i].fltNum);
            series1.push(result[i].holdfuel.toFixed(2));
            series2.push(result[i].altnfuel.toFixed(2));
            series3.push(result[i].extrfuel.toFixed(2));
            // series4.push(result[i].taxioutfuel.toFixed(2));
            series5.push(result[i].contfuel.toFixed(2));
            series6.push(result[i].tripfuel.toFixed(2));
            series7.push(result[i].modairfuel.toFixed(2));
          }
          let maxData = Math.max(...series1) + Math.max(...series2) + Math.max(...series3) + Math.max(...series5) + Math.max(...series6)
          let max = parseInt(maxData)
          let minData = Math.min(...series6) - 2
          let min = parseInt(minData)
          // console.log(useMin, '柱子')
          myChart2.hideLoading(); //隐藏加载动画
          myChart2.setOption({
            title: {
              text: "FUEL DATA BASED ON THE LAST 20 FLIGHTS",
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
              formatter: function (params) {
                // console.log(params) //查看数据
                params.reverse()
                let res = '';
                for (let i = 0; i < params.length; i++) {
                  // console.log(params[i].name, params[i].seriesName, params[i].value)
                  var data = '<p>' + params[i].name + '</p>';
                  res += '<p class="padding:10px 0;">' + params[i].marker + params[i].seriesName + '<span style="font-weight:900;float:right;padding-left:15px;">' + params[i].value + '</span>' + '</p>';

                }
                return data + res;
              },
            },
            dataZoom: [
              {
                show: false, //是否显示
                type: "slider", //图表下方的伸缩条
                textStyle: {
                  color: "white",
                },
                // zoomOnMouseWheel: true,
                // moveOnMouseMove: true,
                realtime: true,
                orient: "vertical",
                // startValue: min,//数据窗口范围的起始数值
                // endValue: max,
              },
              {
                yAxisIndex: [0, 1],
                type: "inside", //鼠标滚轮
                zoomOnMouseWheel: false,
                moveOnMouseMove: false,
                realtime: true,
                orient: "vertical",
                startValue: 0,//数据窗口范围的起始数值
                endValue: max,
                // start: min,
                // end: max,
              }
            ],
            //加载数据图表
            legend: {
              textStyle: {
                color: "#a5a7ad", //字体颜色
              },
              data: [
                "HOLD FUEL",
                "ALTERNATE FUEL",
                "EXTRA FUEL",
                // "TAXI OUTF",
                "CONT FUEL",
                "TRIP FUEL",
                "ACTUAL TRIP FUEL",
              ],
            },
            xAxis: [
              // data: categorie2, // X坐标数值
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
                data: categorie2,
              },
            ],
            yAxis: [
              {
                type: "value",
                scale: true,
                name: "实际耗油",
                nameTextStyle: {
                  color: "#fff",
                },
                min: 0,
                minInterval: 0,
                max: max,
                interval: max / 4,
                // boundaryGap: [0.2, 0.2],
                // axisLabel: {
                //   formatter: function (value) {
                //     return value.toFixed(2) + "%";
                //   },
                // },
                axisLabel: {
                  textStyle: {
                    color: "#a5a7ad",
                  },
                },
              },
              {
                type: "value",
                scale: true,
                name: "计划油量",
                nameTextStyle: {
                  color: "#fff",
                },
                min: 0,
                minInterval: 0,
                max: max,
                interval: max / 4,
                // boundaryGap: [0.2, 0.2],
                // splitLine: {
                //   show: false,
                // },
                axisLabel: {
                  textStyle: {
                    color: "#a5a7ad",
                  },
                },
              },
            ],
            series: [
              // {
              //   name: "TAXI OUTF",
              //   type: "bar",
              //   yAxisIndex: 1,
              //   stack: "one",
              //   barWidth: 30, //柱图宽度
              //   barGap: 20,
              //   itemStyle: {
              //     color: "#FFCD99",
              //   },
              //   data: series4,
              // },
              {
                name: "ACTUAL TRIP FUEL",
                type: "line",
                itemStyle: {
                  color: "#7DA603",
                },
                data: series7,
                label: {
                  show: true,
                  // formatter: "{c}",
                  // position: 'bottom'
                  normal: {
                    show: true,
                    position: 'bottom',
                    distance: 40,
                  },
                },
              },
              {
                name: "TRIP FUEL",
                type: "bar",
                yAxisIndex: 1,
                stack: "one",
                barWidth: 30, //柱图宽度
                barGap: 20,
                itemStyle: {
                  color: "#FFFFFF",
                },
                data: series6,
              },
              {
                name: "CONT FUEL",
                type: "bar",
                yAxisIndex: 1,
                stack: "one",
                barWidth: 30, //柱图宽度
                barGap: 20,
                itemStyle: {
                  color: "#7FB2F8",
                },
                data: series5,
              },
              {
                name: "EXTRA FUEL",
                type: "bar",
                yAxisIndex: 1,
                stack: "one",
                barWidth: 30, //柱图宽度
                barGap: 20,
                itemStyle: {
                  color: "#FF0002",
                },
                data: series3,
              },
              {
                name: "ALTERNATE FUEL",
                type: "bar",
                yAxisIndex: 1,
                stack: "one",
                barWidth: 30, //柱图宽度
                barGap: 20,
                itemStyle: {
                  color: "#FEFF00",
                },
                data: series2,
              },
              {
                name: "HOLD FUEL",
                type: "bar",
                yAxisIndex: 1,
                stack: "one",
                // barCategoryGap: "60%" /*多个并排柱子设置柱子之间的间距*/,
                barWidth: 30, //柱图宽度
                barGap: 20,
                itemStyle: {
                  color: "#5A6A89",
                },
                data: series1,
              }
            ],
          });
        }
      },
      error: function (errorMsg) {
        //没做出错处理
        //请求失败时执行该函数
        alert("图表请求数据失败!");
        myChart2.hideLoading();
      },
    });
  };
  render() {
    return <div id="main" style={{ width: "100%", height: 500 }}></div>;
  }
}

export default StackedCharts;
