import * as React from 'react'
import Library from '../../helpers/Library'
import { parse } from 'node-html-parser'

interface IProps {
    loggedIn: boolean
    backButtonCallback: () => void
}

interface IState {
    userRealName: string
}

export default class Header extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props)
        this.state = { userRealName: undefined }
    }

    private async setUserRealName() {
        const dashboard = await Library.getDashboard()
        const parsed = parse(await dashboard.text())
        this.setState({ userRealName: parsed.querySelector('span.ktLoggedInUser').innerText })
    }

    componentDidMount() {
        this.setUserRealName()
    }
    
    componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>) {
        if (prevProps.loggedIn !== this.props.loggedIn) {
            this.setUserRealName()
        }
    }

    render() {
        return (
            <div className='header'>
                <div className='title'>
                    <p>MPEI</p>
                    <h1>ELIB VIEWER</h1>
                </div>
                {this.props.loggedIn &&
                    <div className='user-real-name'>
                        <p>{'Вы вошли как ' + this.state.userRealName}</p>
                    </div>
                }
                {this.props.backButtonCallback &&
                    <button onClick={this.props.backButtonCallback}>Назад</button>
                }
            </div>
        )
    }
}