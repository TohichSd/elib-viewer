import * as React from 'react'
import Library from '../helpers/Library'

interface IProps {
    cbSearch: (query: string) => void
}

interface IState {
    inputValue: string
    userRealName: string
    image?: any
}

export default class Search extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props)
        this.state = {
            inputValue: '',
            userRealName: undefined,
        }
    }
    
    componentDidMount() {
        Library.getBookPage(8829, 0)
            .then(image => {
                this.setState({ image })
            })
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
                        <button onClick={() => this.props.cbSearch(this.state.inputValue)}>ПОИСК</button>
                    </div>
                </div>
            </div>
        )
    }
}