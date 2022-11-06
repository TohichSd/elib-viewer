import * as React from 'react'
import LoadingPlaceholder from './common/LoadingPlaceholder'
import Library from '../helpers/Library'


interface IProps {
    callbackLogin
}

interface IState {
    username: string
    password: string
    error: string
    loading: boolean
}

export default class Login extends React.Component<IProps, IState> {
    constructor(props) {
        super(props)
        this.state = { username: '', password: '', error: undefined, loading: false }

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
        if (this.state.loading) return
        this.setState({ loading: true })

        try {
            if (!await Library.login(this.state.username, this.state.password))
                return this.setState({
                    error: 'Не удалось войти в библиотеку. Возможно вы ввели неверный логин или пароль.'
                })

            this.props.callbackLogin()
        } catch (e) {
            console.error(e)
            this.setState({
                error: 'Произошла непредвиденная ошибка :('
            })
        } finally {
            this.setState({
                password: '',
                loading: false
            })
        }
    }

    render() {
        return (
            <div className='container'>
                <div className='form-login'>
                    <h2>Войдите в библиотеку</h2>
                    {this.state.error &&
                        <div className='error login-error'>
                            <p>{this.state.error}</p>
                        </div>
                    }
                    <input value={this.state.username} type='text' placeholder='Введите логин'
                           onChange={this.updateUsername} />
                    <input value={this.state.password} type='password' placeholder='Введите пароль'
                           onChange={this.updatePassword} />
                    <button disabled={this.state.loading} onClick={this.onLoginClick}>{this.state.loading ?
                        <LoadingPlaceholder /> : 'Войти'}</button>
                </div>
            </div>
        )
    }
}