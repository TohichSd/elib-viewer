import * as React from 'react'
import LoadingPlaceholder from './common/LoadingPlaceholder'
import Library from '../helpers/Library'
import Cookies from 'universal-cookie'

const cookies = new Cookies()

interface IProps {
    bookID: number
}

interface IState {
    page: number
    inputPage: string
    imageBlob: string
    loaded: boolean
    imageHeight: number
}

export default class ViewPage extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props)
        this.state = {
            page: 0,
            inputPage: '1',
            imageBlob: undefined,
            loaded: false,
            imageHeight: parseInt(cookies.get('image-height')) || 800
        }

        this.loadPage = this.loadPage.bind(this)
        this.zoomIn = this.zoomIn.bind(this)
        this.zoomOut = this.zoomOut.bind(this)
        this.nextPage = this.nextPage.bind(this)
        this.previousPage = this.previousPage.bind(this)
        this.setPage = this.setPage.bind(this)
        this.onKeyDown = this.onKeyDown.bind(this)
    }

    private async loadPage(page: number) {
        const blob = await Library.getBookPage(this.props.bookID, page)
        this.setState({ page, inputPage: (page + 1).toString(), imageBlob: URL.createObjectURL(blob) })
    }

    private zoomIn() {
        if (this.state.imageHeight <= 1500) {
            cookies.set('image-height', this.state.imageHeight + 100)
            this.setState({ imageHeight: this.state.imageHeight + 100 })
        }
    }

    private zoomOut() {
        if (this.state.imageHeight >= 600) {
            cookies.set('image-height', this.state.imageHeight - 100)
            this.setState({ imageHeight: this.state.imageHeight - 100 })
        }
    }

    private nextPage() {
        if (this.state.loaded)
            this.setState({
                page: this.state.page + 1,
                loaded: false
            })
    }

    private previousPage() {
        if (this.state.page > 0 && this.state.loaded)
            this.setState({
                page: this.state.page - 1,
                loaded: false
            })
    }

    private setPage(event) {
        if (parseInt(event.target.value) > 0 || event.target.value == '')
            this.setState({
                inputPage: event.target.value
            })
    }

    private onKeyDown(event) {
        if (event.key === 'Enter')
            this.setState({
                page: parseInt(this.state.inputPage) - 1 || 0,
                loaded: false
            })
    }

    componentDidMount() {
        this.loadPage(this.state.page)
            .then(() => {
                this.setState({ loaded: true })
            })
        
        document.addEventListener('keydown', e => {
            if (e.key == 'ArrowLeft')
                this.previousPage()
            else if (e.key == 'ArrowRight')
                this.nextPage()
            else if (e.key == '=' || e.key == '+')
                this.zoomIn()
            else if (e.key == '-')
                this.zoomOut()
        })
    }

    componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>) {
        if (this.state.page != prevState.page)
            this.loadPage(this.state.page)
                .then(() => {
                    this.setState({ loaded: true })
                })
    }

    render() {
        return (
            <div className='container view-container'>
                <div className='page-container'>
                    {this.state.imageBlob &&
                        <div className='controls'>
                            <div>
                                <button className='arrow arrow-left' onClick={this.previousPage}>Предыдущая</button>
                                <button className='arrow arrow-right' onClick={this.nextPage}>Следующая</button>
                                <button className='size-minus' onClick={this.zoomOut}>-</button>
                                <button className='size-plus' onClick={this.zoomIn}>+</button>
                            </div>
                            <div>
                                <p>Страница </p>
                                <input type='number' value={this.state.inputPage} onChange={this.setPage}
                                       onKeyDown={this.onKeyDown} />
                                <p> из 99</p>
                            </div>
                        </div>
                    }
                    <div className={this.state.imageBlob ? 'page' : null}>
                        {this.state.imageBlob
                            ? <img className={this.state.loaded ? null : 'lighten'} src={this.state.imageBlob}
                                   height={this.state.imageHeight + 'px'}
                                   alt='Страница книги' />
                            : <LoadingPlaceholder />
                        }
                    </div>

                </div>
            </div>
        )
    }
}