import * as React from 'react'
import { Header } from './Common'
import * as http from 'http'

interface IProps {
    callbackLogin
}

interface IState {
    username: string
    password: string
}

export default class Login extends React.Component<IProps, IState> {
    constructor(props) {
        super(props)
        this.state = { username: '', password: '' }

        this.updateUsername = this.updateUsername.bind(this)
        this.updatePassword = this.updatePassword.bind(this)
        this.onLoginClick = this.onLoginClick.bind(this)
    }

    private updateUsername(event) {
        this.setState({
            username: event.target.value
        })
    }

    private updatePassword(event) {
        this.setState({
            password: event.target.value
        })
    }

    private async onLoginClick() {
        const data = {
            username: this.state.username,
            password: this.state.password,
            language: 'ru_UN',
            action: 'login'
        }

        const urlEncodedData = Object.keys(data)
            .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(data[k])).join('&')

        const res = await fetch('http://localhost:3000/http://elib.mpei.ru/login.php', {
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
            },
            body: urlEncodedData
        })

        console.log(await res.json())
    }

    render() {
        return (
            <div className='container'>
                <Header />
                <div className='form-login'>
                    <h2>Войдите в библиотеку</h2>
                    <input value={this.state.username} type='text' placeholder='Введите логин'
                           onChange={this.updateUsername} />
                    <input value={this.state.password} type='password' placeholder='Введите пароль'
                           onChange={this.updatePassword} />
                    <button onClick={this.onLoginClick}>Войти</button>
                </div>
            </div>
        )
    }
}