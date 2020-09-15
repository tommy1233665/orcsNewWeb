import { withRouter } from "react-router-dom";
import { CardCommon, CommonTable, riskCAirportColumns, CommonModal } from "common/component";
import { handleInParams, getSession } from "common/commonFn";
import { post } from "common/http";
import PageModel from 'model/pageModel';
import RiskValueTree from 'common/custom/riskValueTree';

class FlightList extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            table: new PageModel(),
            treeParams: {}
        };
        this.columns;
        this.modal;
    }

    componentDidMount(){
        this.columns = riskCAirportColumns({
            detailUrl: "/FlightRiskDetail/", 
            onLook: (data) => {
                this.setState({
                    treeParams: {soflSeqNr: data.flightCode}
                });
                this.modal.show();
            }
        });
        var flightList = getSession("flightList");
        var params = flightList ? JSON.parse(flightList) : {};
        this.getList({params: params});
    }

    componentWillUnmount(){
        this.setState = (state, callback) => {
            return;
        };
    }
    componentDidUpdate(){
		document.addEventListener('keydown',this.onkeydown);
    }
    
    onkeydown = (e)=>{
		if (e.keyCode === 13) {
			this.submit()
		}
	}

    getList = ( obj = {} ) => {
        const table = this.state.table;
        table.setPage(obj);
        let params = handleInParams(table.getParmaData());
        post({
            url: "flitDetail/queryFlitDetailByParam",
            data: params,
            success: res => {
                if( res && res.pages ){
                    let result = res.pages;
                    table.setPage({ dataList: result.list, total: result.total, pageNum: result.pageNum, pageSize: result.pageSize });
                    this.setState({ table });
                }
            }
        });
    }

    render(){
        const { table } = this.state;
        // 航班风险表格参数
        const tableOptions = {
            notCheck: true,
            columns: this.columns,
            table: table,
            onChange: this.getList
        }
        // 模态框参数
        const modalOptions = {
            options: {
                title: "风险值展示",
                footer: null,
                width: "60%"
            },
            onRef: (ref) => {this.modal = ref}
        };
        const isHistory = false, hasAction = true;
        return (
            <CardCommon className="flight-list">
                <div className="flight-list-title">航班详情列表</div>
                <CommonTable options={tableOptions} ></CommonTable>
                <CommonModal {...modalOptions}>
                    <RiskValueTree treeParams={this.state.treeParams} isHistory={isHistory} hasAction={hasAction} />
                </CommonModal>
            </CardCommon>
        );
    }
};

export default withRouter(FlightList);