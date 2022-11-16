import * as React from 'react'
import LoadingPlaceholder from './common/LoadingPlaceholder'
import Library from '../helpers/Library'
import Cookies from 'universal-cookie'
import { Notify } from 'notiflix/build/notiflix-notify-aio'

const cookies = new Cookies()

interface IProps {
    context
    callbackLogin: () => void
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
            if (!await Library.login(this.state.username, this.state.password)) {
                Notify.failure('Не удалось войти в библиотеку. Возможно вы ввели неверный логин или пароль.',
                    { position: 'center-top' })
                return
            }

            this.props.callbackLogin()
        } catch (e) {
            console.error(e)
            Notify.failure('Что-то пошло не так :(',
                { position: 'center-top' })
        } finally {
            this.setState({
                password: '',
                loading: false
            })
        }
    }

    componentDidMount() {
        cookies.remove('cachedRealName')
    }
    
    render() {
        return (
            <div className='container'>
                <div className='form-login'>
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