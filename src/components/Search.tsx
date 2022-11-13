import * as React from 'react'
import Library from '../helpers/Library'
import LoadingPlaceholder from './common/LoadingPlaceholder'
import { Notify } from 'notiflix/build/notiflix-notify-aio'

interface IProps {
    context
    cbSearchID: (id: number) => void
}

interface IState {
    inputValue: string
    userRealName: string
    error: string
    searching: boolean
}

export default class Search extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props)
        this.state = {
            inputValue: '',
            userRealName: undefined,
            error: undefined,
            searching: false
        }

        this.search = this.search.bind(this)
    }

    private async search() {
        this.setState({ searching: true })
        const query = this.state.inputValue
        if (!query) return

        const parsedQuery = parseInt(query)
        if (parsedQuery.toString() == query) {
            if (!await Library.isBookAvailable(parsedQuery)) {
                this.setState({ searching: false })
                Notify.failure('Эта книга не существует или недоступна', 
                    { position: 'center-top' })
                return
            }

            this.props.cbSearchID(parsedQuery)
        } else {
            this.setState({ searching: false })
            Notify.failure('Кажется это не ID', { position: 'center-top' })
            return
        }
    }

    render() {
        return (
            <div className='container'>
                <div className='search-container'>
                    <div className='search-line'>
                        <input type='text' placeholder='ID книги' name='search' required={true}
                               value={this.state.inputValue}
                               onChange={e => this.setState({ inputValue: e.target.value })}
                        />
                        <button onClick={this.search}>{this.state.searching ? <LoadingPlaceholder /> : 'ПОИСК'}</button>
                    </div>
                    {this.state.error &&
                        <div className='error login-error'>
                            <p>{this.state.error}</p>
                        </div>
                    }
                </div>
            </div>
        )
    }
}