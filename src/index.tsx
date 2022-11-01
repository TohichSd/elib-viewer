import * as React from 'react'
import { createRoot } from 'react-dom/client'

import Search from './components/Search'
import BooksList from './components/BooksList'
import Login from './components/Login'

import './stylus/common.styl'
import './stylus/search.styl'
import './stylus/login.styl'

import config from '../config.json'

interface IState {
    page: 'search' | 'list' | 'view'
    loggedIn: boolean
    query?: string
}

class App extends React.Component<any, IState> {
    constructor() {
        super({})
        this.state = {
            page: 'search',
            loggedIn: false
        }
        this.callbackSearch = this.callbackSearch.bind(this)
    }

    private callbackLogin() {
        
    }
    
    private callbackSearch(query: string) {
        if (query) {
            this.setState({
                page: 'list',
                query
            })
        }
    }

    render() {
        if (this.state.loggedIn) {
            if (this.state.page === 'list') return <BooksList query={this.state.query} />
            else return <Search cbSearch={this.callbackSearch} />
        }
        else return <Login callbackLogin={this.callbackLogin}/>
    }
}

const root = createRoot(document.querySelector('#root'))
root.render(<React.StrictMode> <App /> </React.StrictMode>)