import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { parse } from 'node-html-parser'

import Cookies from 'universal-cookie'

import './stylus/common.styl'
import './stylus/search.styl'
import './stylus/login.styl'
import './stylus/view-page.styl'
import 'react-notifications/lib/notifications.css'

import Library from './helpers/Library'
import { Notify } from 'notiflix/build/notiflix-notify-aio'

const ViewBook = React.lazy(() => import('./components/ViewBook'))
const Header = React.lazy(() => import('./components/common/Header'))
const Search = React.lazy(() => import('./components/Search'))
const BooksList = React.lazy(() => import('./components/BooksList'))
const Login = React.lazy(() => import('./components/Login'))
const Footer = React.lazy(() => import('./components/common/Footer'))

const cookies = new Cookies()

interface IState {
    page: 'search' | 'list' | 'view' | 'login'
    loggedIn: boolean
    checkedLogin: boolean
    fullScreen: boolean
    darkMode: boolean
    query?: string
    bookID?: number
}

class App extends React.Component<unknown, IState> {
    constructor(props) {
        super(props)
        this.state = {
            page: cookies.get('page') || 'search',
            loggedIn: false,
            checkedLogin: false,
            fullScreen: false,
            darkMode: cookies.get('darkMode') || false,
            query: cookies.get('query') || undefined,
            bookID: cookies.get('bookID') || undefined
        }
        this.searchCallback = this.searchCallback.bind(this)
        this.searchIDCallback = this.searchIDCallback.bind(this)
        this.loginCallback = this.loginCallback.bind(this)
        this.logoutCallback = this.logoutCallback.bind(this)
        this.checkLogin = this.checkLogin.bind(this)
        this.backButtonCallback = this.backButtonCallback.bind(this)
        this.fullScreenCallback = this.fullScreenCallback.bind(this)
        this.darkModeCallback = this.darkModeCallback.bind(this)
    }

    private async checkLogin() {
        if (cookies.get('PHPSESSID')) {
            try {
                const dashboard = await Library.getDashboard()
                const parsed = parse(await dashboard.text())
                if (!parsed.querySelector('span.ktLoggedInUser').innerText.includes('Anonymous'))
                    return true
            } catch (e) {
                Notify.failure('Что-то пошло не так :(')
            }
        }
        return false
    }

    private loginCallback() {
        if (!cookies.get('page'))
            cookies.set('page', 'search')
        this.setState({
            page: cookies.get('page'),
            loggedIn: true
        })
    }

    private logoutCallback() {
        cookies.remove('PHPSESSID')
        cookies.remove('cachedRealName')
        cookies.remove('bookID')
        Library.logout().then(() => {
            this.setState({
                loggedIn: false,
                checkedLogin: true,
                bookID: undefined,
                page: 'search'
            })
        })
    }

    private searchIDCallback(id: number) {
        cookies.set('page', 'view')
        cookies.set('bookID', id)
        this.setState({
            page: 'view',
            bookID: id
        })
    }

    /**
     * @deprecated
     * @param query
     * @private
     */
    private searchCallback(query: string) {
        if (query) {
            const parsedQuery = parseInt(query)
            if (parsedQuery.toString() == query) {
                cookies.set('page', 'view')
                cookies.set('bookID', parsedQuery)
                this.setState({
                    page: 'view',
                    bookID: parsedQuery
                })
            } else {
                cookies.set('page', 'list')
                cookies.set('query', query)
                this.setState({
                    page: 'list',
                    query
                })
            }
        }
    }

    private backButtonCallback() {
        cookies.set('page', 'search')
        this.setState({ page: 'search' })
    }

    private fullScreenCallback() {
        this.setState({ fullScreen: !this.state.fullScreen })
    }

    private darkModeCallback() {
        cookies.set('darkMode', !this.state.darkMode)
        this.setState({ darkMode: !this.state.darkMode })
    }

    componentDidMount() {
        this.checkLogin()
            .then(isLoggedIn => {
                if (isLoggedIn) this.setState({ loggedIn: true, checkedLogin: true })
                else this.setState({ loggedIn: false, checkedLogin: true })
            })
    }

    componentDidUpdate(/*prevProps: Readonly<unknown>, prevState: Readonly<IState>, snapshot?: any*/) {
        if (this.state.page == 'view' && !this.state.bookID) this.setState({ page: 'search' })
    }

    render() {
        let pageName = ''

        const context = {
            darkMode: this.state.darkMode,
            fullScreen: this.state.fullScreen,
            loggedIn: this.state.loggedIn
        }

        let main
        if (this.state.checkedLogin) {
            if (this.state.loggedIn) {
                pageName = this.state.page
                if (this.state.page === 'list')
                    main = <BooksList context={context} query={this.state.query} />
                else if (this.state.page === 'view')
                    main = <ViewBook context={context} bookID={this.state.bookID}
                                     fullscreenCallback={this.fullScreenCallback} />
                else main = <Search context={context} cbSearchID={this.searchIDCallback} />
            } else {
                main = <Login context={context} callbackLogin={this.loginCallback} />
                pageName = 'login'
            }
        } else main = <p className='loading'>Загрузка</p>

        return (
            <main className={(this.state.darkMode ? 'dark' : 'light') + ' ' + pageName}>
                <div>
                    <React.Suspense fallback={<p className='loading'>Загрузка</p>}>

                        {(!this.state.fullScreen || this.state.page != 'view') &&
                            <Header context={context}
                                    backButtonCallback={this.state.page != 'search' ? this.backButtonCallback : undefined}
                                    darkModeCallback={this.darkModeCallback}
                                    logoutCallback={this.logoutCallback} />
                        }
                        {main}
                        {(!this.state.fullScreen || this.state.page != 'view') &&
                            <Footer />
                        }
                    </React.Suspense>
                </div>
            </main>
        )
    }
}

const rootDiv = document.createElement('div')
document.body.appendChild(rootDiv)

const root = createRoot(rootDiv)
root.render(<React.StrictMode> <App /> </React.StrictMode>)