import * as React from 'react'
import { Header } from './Common'

interface IProps {
    cbSearch: (query: string) => void
}

interface IState {
    inputValue: string
}

export default class Search extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props)
        this.state = { inputValue: '' }
    }

    render() {
        return (
            <div className='container'>
                <Header />
                <div className='search-container'>
                    <div className='search-line'>
                        <input type='text' placeholder='Название книги' name='search' required={true}
                               value={this.state.inputValue}
                               onChange={e => this.setState({ inputValue: e.target.value })}
                        />
                        <button onClick={() => this.props.cbSearch(this.state.inputValue)}>ПОИСК</button>
                    </div>
                </div>
            </div>
        )
    }
}