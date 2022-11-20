import * as React from 'react'
import Library from '../../helpers/Library'
import { parse } from 'node-html-parser'
import Cookies from 'universal-cookie'
import LightModeSvg from '../../static/assets/light-mode-20px.svg'
import DarkModeSvg from '../../static/assets/dark-mode-20px.svg'
import PersonSvg from '../../static/assets/person-24px.svg'
import LogoutSvg from '../../static/assets/logout-20px.svg'

const cookies = new Cookies()

interface IProps {
    context
    backButtonCallback: () => void
    darkModeCallback: () => void
    logoutCallback: () => void
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
        const cachedName = cookies.get('cachedRealName')
        if (cachedName)
            this.setState({ userRealName: cachedName })
        else if (this.props.context.loggedIn) {
            const dashboard = await Library.getDashboard()
            const parsed = parse(await dashboard.text())
            const name = parsed.querySelector('span.ktLoggedInUser').innerText
            this.setState({ userRealName: name })
            if (cachedName != name)
                cookies.set('cachedRealName', name)
        } else cookies.remove('cachedRealName')

    }

    componentDidMount() {
        if (this.props.context.loggedIn)
            this.setUserRealName()
    }

    componentDidUpdate(prevProps: Readonly<IProps>) {
        if (prevProps.context.loggedIn !== this.props.context.loggedIn) {
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
                <div className='controls'>
                    <div className='user-real-name'>
                        <PersonSvg />
                        <p>{this.state.userRealName && this.props.context.loggedIn ?
                            this.state.userRealName : 'Войдите чтобы продолжить'}</p>
                    </div>
                    <button className='theme-switch button-secondary'
                            title={`Переключить на ${this.props.context.darkMode ? 'светлую' : 'тёмную'} тему`}
                            onClick={this.props.darkModeCallback}>{this.props.context.darkMode ?
                        <LightModeSvg /> : <DarkModeSvg />}
                    </button>
                    {this.props.context.loggedIn &&
                        <button className='button-secondary logout' onClick={this.props.logoutCallback}>
                            <LogoutSvg />
                        </button>
                    }
                </div>
                {this.props.backButtonCallback &&
                    <button className='button-secondary' onClick={this.props.backButtonCallback}>Назад</button>
                }
            </div>
        )
    }
}