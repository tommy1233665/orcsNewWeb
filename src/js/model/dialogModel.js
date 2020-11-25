import { Modal, Table, Button, Spin } from "antd";
import { post } from "common/http";
import { downloadFile } from "common/commonFn";
const { confirm } = Modal;

class dialogModel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      loading: false,
      tableData: [],
      params: {},
      selectedRows: [],
      spinning: false
    };
  }
  // 导出全部
  exportAll = () => {
    const This = this;
    This.setState({ loading: true });
    confirm({
      title: "确定导出全部航线吗？",
      onOk() {
        post({
          url: "qarInfoController/exportFltExtraOilInfo",
          data: This.state.params,
          success: (data) => {
            downloadFile(data, "额外油航班明细");
            This.setState({ loading: false });
          },
          error: (data) => {
            console.log("11111");
          },
        });
      },
    });
  };
  componentDidMount() {
    //通过pros接收父组件传来的方法
    this.props.onRef(this);
  }
  showModal = (data, paramsData) => {
    // 后台数据修改后，切除 （~）取值
    var str = data.data.useType === 1 ? data.data.trueExtrOilSection : data.data.trueAirTimeDevtSection;
    var newStr = [];
    newStr = str.split("~");
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
      spinning: true,
      tableData: []
    });
    post({
      url: "qarInfoController/queryFltExtraSectionDetailInfo",
      data: params,
      success: (data) => {
        this.setState({
          tableData: data.fltExtraSectionDetailList,
          spinning: false
        });
      },
    });
  };

  handleOk = (e) => {
    this.setState({
      visible: false,
    });
  };

  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
  };

  render() {
    const columns = [
      {
        title: "航班号",
        dataIndex: "fltNum",
        width: 200,
      },
      {
        title: "机尾号",
        dataIndex: "tailNum",
        width: 200,
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
        width: 200,
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

    const { loading } = this.state;
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
        <Spin spinning={this.state.spinning}>
          <div>
            <div style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                onClick={this.exportAll}
                loading={loading}
              >
                导出全部Excel
            </Button>
            </div>
            <Table
              bordered
              // sticky
              columns={columns}
              key="name"
              dataSource={this.state.tableData}
              pagination={paginationProps}
              scroll={{ x: 1600 }}
            />
          </div>
        </Spin>
      </Modal>
    );
  }
}

export default dialogModel;
