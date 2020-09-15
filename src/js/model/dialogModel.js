import { Modal, Table, Button } from "antd";
// import { CardCommon, CommonTable } from "common/component";
import { post } from "common/http";
import { downloadFile } from "common/commonFn";
const { confirm } = Modal;

class dialogModel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      // selectedRowKeys: [], // Check here to configure the default column
      loading: false,
      tableData: [],
      params: {},
    };
  }

  start = () => {
    this.setState({ loading: true });
    // this.exportAll()
    // ajax request after empty completing
    setTimeout(() => {
      this.setState({
        // selectedRowKeys: [],
        loading: false,
      });
    }, 1000);
  };
  // 导出全部
  exportAll = (callback) => {
    console.log("导出全部");
    const This = this;
    confirm({
      title: "确定导出全部航线吗？",
      onOk() {
        post({
          url: "qarInfoController/exportFltExtraOilInfo",
          data: This.state.params,
          // btn: callback,
          success: (data) => {
            downloadFile(data, "导出全部航路");
            console.log("导出");
          },
          error: (data) => {
            console.log("11111");
            message.error("导出失败！");
          },
        });
      },
      // onCancel: callback
    });
  };

  componentDidMount() {
    //通过pros接收父组件传来的方法
    this.props.onRef(this);
  }
  showModal = (data, paramsData) => {
    // TODO 后台数据修改后，切除 （~）取值
    // console.log(data, paramsData, "弹窗请求, 1111");
    var str = "-4.2750006~-1.7808338";
    var newStr = [];
    newStr = str.split("~");
    console.log(data, "我是弹窗柱子点击");
    let params = {
      soflSeqNr: paramsData.soflSeqNr,
      time: paramsData.time,
      useType: data.data.useType,
      min: newStr[0],
      max: newStr[1],
    };
    this.setState({
      visible: true,
      params: params,
    });
    post({
      url: "qarInfoController/queryFltExtraSectionDetailInfo",
      data: params,
      success: (data) => {
        // console.log(data, "弹窗请求");
        this.setState({
          tableData: data.fltExtraSectionDetailList,
        });
      },
    });
  };

  handleOk = (e) => {
    // console.log(e);
    this.setState({
      visible: false,
    });
  };

  handleCancel = (e) => {
    // console.log(e);
    this.setState({
      visible: false,
    });
  };

  render() {
    // const data = [];
    // for (let i = 0; i < 46; i++) {
    //   data.push({
    //     key: i,
    //     name: `Edward King ${i}`,
    //     age: 32,
    //     address: `London, Park Lane no. ${i}`,
    //   });
    // }
    const columns = [
      {
        title: "航班号",
        dataIndex: "fltNum",
        width: 500,
      },
      {
        title: "机尾号",
        dataIndex: "tailNum",
        width: 250,
      },
      {
        title: "计划起飞时间",
        dataIndex: "schDepDt",
        width: 250,
      },
      {
        title: "航程油量偏差值",
        dataIndex: "airFuelDevt",
        width: 250,
      },
      {
        title: "空中时间偏差值",
        dataIndex: "airTimeDevt",
        width: 250,
      },
      {
        title: "高度偏差值",
        dataIndex: "htDevt",
        width: 250,
      },
      {
        title: "平均高度",
        dataIndex: "fl",
        width: 250,
      },
      {
        title: "最大飞行高度",
        dataIndex: "cruiseMaxHeight",
        width: 250,
      },
      {
        title: "业载偏差",
        dataIndex: "wtDevt",
        width: 250,
      },
      {
        title: "额外油",
        dataIndex: "extrFuel",
        width: 250,
      },
      {
        title: "额外时间",
        dataIndex: "extrTime",
        width: 250,
      },
      {
        title: "计划落地油",
        dataIndex: "targetArrFuel",
        width: 250,
      },
      {
        title: "实际落地油",
        dataIndex: "flandonBeginOil",
        width: 250,
      },
      {
        title: "地速偏差",
        dataIndex: "landSpeedDevt",
        width: 250,
      },
      {
        title: "地面距离偏差",
        dataIndex: "frouteMileDevt",
        width: 250,
      },
    ];

    const { loading, selectedRowKeys } = this.state;
    const paginationProps = {
      pageSize: 5, // 每页条数
    };
    return (
      <Modal
        title="航班明细表格"
        visible={this.state.visible}
        onOk={this.handleOk}
        width="1600px"
        onCancel={this.handleCancel}
      >
        <div>
          <div style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              // onClick={this.start}
              onClick={this.exportAll}
              // disabled={!hasSelected}
              loading={loading}
            >
              导出全部Excel
            </Button>
          </div>
          <Table
            bordered
            // sticky
            columns={columns}
            dataSource={this.state.tableData}
            pagination={paginationProps}
            scroll={{ x: 1600 }}
          />
        </div>
      </Modal>
    );
  }
}

export default dialogModel;
