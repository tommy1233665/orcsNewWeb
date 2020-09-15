import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import { Modal, message, Tree } from 'antd';
import { isAuthority } from "common/commonFn";
import { post } from "common/http";

const { confirm } = Modal;
const { TreeNode, DirectoryTree } = Tree;

const COUNT = "flightRiskShow.countLeaf"; // 重新计算终端风险节点风险值 

class RiskValueTree extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            treeData: [],
            parentIds: [],
            authorityCount: isAuthority(COUNT, props.authority),
        };
    }

    componentDidMount(){
        this.getRiskValue("root", data => this.setState({treeData: data}));
        this.getHightRiskValueParentIds();
    }

    componentWillUnmount(){
        this.setState = (state, callback) => {
            return;
        };
    }

    getHightRiskValueParentIds(){
        post({
            url: "airLineRisk/queryHightRiskValueParentIds",
            data: {soflSeqNr: this.props.treeParams.soflSeqNr},
            success: data => {
                if( !data ) data = [];
                this.setState({parentIds: data});
            }
        });
    }

    getRiskValue(parentId, callback){
        const { treeParams, isHistory } = this.props;
        if( treeParams && treeParams.soflSeqNr ){
            var params = {parentId: parentId, soflSeqNr: treeParams.soflSeqNr};
            if( treeParams.batchNum ) params.batchNum = treeParams.batchNum;
            let url = isHistory ? treeParams.batchNum ? "airLineRisk/queryRiskValuesForHis" : "airLineRisk/queryRiskValueHisNew" : treeParams.batchNum ? "airLineRisk/queryHisRiskValue" : "airLineRisk/queryRiskValue";
            post({
                url: url,
                data: params,
                success: data => {
                    var arr = data.map(item => {
                        var obj = {};
                        obj.title = item.riskValue || item.riskValue == 0 ? item.name + "：" + item.riskValue : item.name + "：";
                        obj.key = item.id;
                        obj.isLeaf = item.isLeaf == "N" ? false : true;
                        obj.datas = item;
                        obj.datas.soflSeqNr = treeParams.soflSeqNr;
                        return obj;
                    });
                    callback && typeof callback == "function" && callback(arr);
                }
            });
        }
    }
  
    onLoadData = treeNode => new Promise(resolve => {
        if (treeNode.props.children) {
            resolve();
            return;
        }
        this.getRiskValue(treeNode.props.dataRef.key, data => {
            treeNode.props.dataRef.children = data;
            this.setState({treeData:  [...this.state.treeData]});
            resolve();
        });
    });

    treeReplace(list, data, parentId){
        list.map( item => {
            if( item.key == parentId ){
                item.children = data;
            }else if( item.children ){
                item.children = this.treeReplace(item.children, data, item.parentId);
            }
        });
        return list;
    }

    onMathRmItem(item){
        if( this.state.authorityCount ){
            var This = this;
            confirm({
                title: "是否开始计算？",
                onOk() {
                    post({
                        url: "droolsEngine/mathRmItem",
                        data: {soflSeqNr: item.soflSeqNr, rmItemId: item.id, batchNum: item.batchNum},
                        success: data => {
                            if( data.success ){
                                confirm({
                                    title: "计算风险完毕！是否需要节点风险值？",
                                    onOk() {
                                        This.getRiskValue(item.parentId, data => {
                                            let treeData = This.treeReplace(This.state.treeData, data, item.parentId);
                                            This.setState(treeData);
                                        });
                                    }
                                });
                            }else{
                                message.error("计算风险失败");
                            }
                        }
                    });
                }
            });
        }else{
            message.info("没有权限操作");
        }
    }
  
    renderTreeNodes = data => data.map(item => {
        var title = <TreeTittle hasAction={this.props.hasAction} parentIds={this.state.parentIds} {...item} onClick={this.onMathRmItem.bind(this, item.datas)} />;
        if (item.children) {
            return (
                <TreeNode title={title} key={item.key} isLeaf={item.isLeaf} dataRef={item}>
                    {this.renderTreeNodes(item.children)}
                </TreeNode>
            );
        }
        return <TreeNode title={title} key={item.key} isLeaf={item.isLeaf} dataRef={item}/>;
    });

    render() {
        return <DirectoryTree loadData={this.onLoadData}>{this.renderTreeNodes(this.state.treeData)}</DirectoryTree>;
    }

}

class TreeTittle extends React.Component {

    constructor(props) {
        super(props);
        this.state = { isFlag: false };
    }

    componentDidMount(){
        this.getFlag(this.props.parentIds);
    }

    componentWillReceiveProps(nextProps){
        this.getFlag(nextProps.parentIds);
    }

    getFlag(parentIds){
        parentIds.forEach( item => {
            if( item == this.props.datas.id){
                this.setState({
                    isFlag: true
                });
            }
            return;
        });
    }

    handleClick(e) {
        e.stopPropagation();
        this.props.onClick();
    }

    render() {
        return (
            <React.Fragment>
                <span className={this.props.datas.riskValue > 7 ? "text-danger" : this.state.isFlag ? "text-warning" : ""}>{this.props.title}</span>
                {
                    this.props.isLeaf && this.props.hasAction &&
                    <span className="tree-btn" onClick={this.handleClick.bind(this)}>重新计算</span>
                }
                
            </React.Fragment>
        );
    }

};

const mapStateToProps = (state) => {
    return {
        authority: state.authority
    };
}

export default connect(
    mapStateToProps
)(withRouter(RiskValueTree));
//export default RiskValueTree;