/*
 *  代码分割模型，调用该模型的方式如下。
 *  import UserModul from 'bundle-loader?lazy!./system/User.js';
 * 
 *  const User = () => (
 *      <Bundle load={UserModul}> 
 *          {(User) => <User />}
 *      </Bundle>
 *  )
 */

export default class Bundle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mod: null
        }
    }

    componentWillMount() {
        this.load(this.props)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.load !== this.props.load) {
            this.load(nextProps)
        }
    }

    load(props) {
        this.setState({
            mod: null
        })
        props.load((mod) => {
            this.setState({
                mod: mod.default ? mod.default : mod
            })
        })
    }

    render() {
        if (!this.state.mod){
            return false
        }
        return this.props.children(this.state.mod)
    }
}