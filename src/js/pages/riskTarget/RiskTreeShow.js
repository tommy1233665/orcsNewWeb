import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import { Charts } from "common/charts";
import { post } from 'common/http';
import { CardCommon, CommonTabs } from "common/component";
import { isAuthority } from "common/commonFn";

const SHOW = "riskTreeShow.show";

class RiskTreeShow extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            authorityShow: isAuthority(SHOW, props.authority),
            tabs: [
                {name: "起飞", checked: true, type: "1"},
                {name: "巡航", checked: false, type: "2"},
                {name: "着陆", checked: false, type: "3"}
            ],
            options: {
                tooltip: {
                    trigger: 'item',
                    triggerOn: 'mousemove'
                },
                series: [
                    {
                        type: 'tree',
                        data: [{}],
                        top: '10px',
                        left: '7%',
                        bottom: '0',
                        right: '14%',
                        symbolSize: 7,
                        initialTreeDepth: -1,
                        roam: "move",
                        itemStyle: {
                            borderColor: "#1890ff"
                        },
                        label: {
                            normal: {
                                position: 'left',
                                verticalAlign: 'middle',
                                align: 'right',
                                color: "#fff"
                            }
                        },
                        lineStyle: {
                            color: "#999"
                        },
                        leaves: {
                            label: {
                                color: "#1890ff",
                                normal: {
                                    position: 'right',
                                    verticalAlign: 'middle',
                                    align: 'left'
                                }
                            }
                        },
                        animationDuration: 550,
                        animationDurationUpdate: 750
                    }
                ]
            }
        }
    }

    componentWillUnmount(){
        this.setState = (state, callback) => {
            return;
        };
    }

    onTab = (tab) => {
        this.getData({type: tab.type});
    }

    getData(params = {}){
        post({
            url: "rmItem/showRmItemRiskTree",
            data: params,
            success: data => {
                var options = this.state.options;
                options.series[0].data[0] = data;
                this.setState({options});
            }
        });
    }

    render(){
        const { authorityShow } = this.state;
        return(
            <CardCommon className="risk-tree-show">
                { authorityShow && <CommonTabs tabs={this.state.tabs} onClick={this.onTab} /> }
                { authorityShow && 
                    <div className="risk-tree-box">
                        <Charts id="tree" options={this.state.options} />
                    </div>
                }
                { !authorityShow && <div className="no-authority-box">无权限查看</div> }
            </CardCommon>            
        );
    }
}

const mapStateToProps = (state) => {
    return {
        authority: state.authority
    };
}

export default connect(
    mapStateToProps
)(withRouter(RiskTreeShow));