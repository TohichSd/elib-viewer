import * as React from 'react'
import { createRoot } from 'react-dom/client'
import Cookies from 'universal-cookie'

import Search from './components/Search'
import BooksList from './components/BooksList'
import Login from './components/Login'

import './stylus/common.styl'
import './stylus/search.styl'
import './stylus/login.styl'
import './stylus/view-page.styl'
import ViewPage from './components/ViewPage'
import Header from './components/common/Header'
import Library from './helpers/Library'
import { parse } from 'node-html-parser'


const cookies = new Cookies()

interface IState {
    page: 'search' | 'list' | 'view'
    loggedIn: boolean
    checkedLogin: boolean
    query?: string
    bookID?: number

}

class App extends React.Component<any, IState> {
    constructor(props) {
        super(props)
        this.state = {
            page: cookies.get('page') || 'search',
            loggedIn: false,
            checkedLogin: false,
            query: cookies.get('query') || undefined,
            bookID: cookies.get('bookID') || undefined
        }
        this.callbackSearch = this.callbackSearch.bind(this)
        this.callbackLogin = this.callbackLogin.bind(this)
        this.checkLogin = this.checkLogin.bind(this)
        this.backButtonCallback = this.backButtonCallback.bind(this)
    }

    private async checkLogin() {
        if (cookies.get('PHPSESSID')) {
            const dashboard = await Library.getDashboard()
            const parsed = parse(await dashboard.text())
            if (!parsed.querySelector('span.ktLoggedInUser').innerText.includes('Anonymous')) {
                this.setState({ loggedIn: true, checkedLogin: true })
                return
            }
        }
        this.setState({ loggedIn: false, checkedLogin: true })
    }

    private callbackLogin() {
        if (!cookies.get('page'))
            cookies.set('page', 'search')
        this.setState({
            page: cookies.get('page'),
            loggedIn: true
        })
    }

    private callbackSearch(query: string) {
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

    componentDidMount() {
        this.checkLogin()
    }

    render() {
        let main
        if (this.state.checkedLogin) {
            if (this.state.loggedIn) {
                if (this.state.page === 'list') main = <BooksList query={this.state.query} />
                else if (this.state.page === 'search') main = <Search cbSearch={this.callbackSearch} />
                else if (this.state.page === 'view') main = <ViewPage bookID={this.state.bookID} />
            } else main = <Login callbackLogin={this.callbackLogin} />
        } else main = <p>Загрузка</p>

        return (
            <main>
                <Header loggedIn={this.state.loggedIn}
                        backButtonCallback={this.state.page != 'search' ? this.backButtonCallback : undefined} />
                {main}
            </main>
        )
    }
}

const root = createRoot(document.querySelector('#root'))
root.render(<React.StrictMode> <App /> </React.StrictMode>)