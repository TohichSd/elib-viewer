import React from 'react'
import LoadingPlaceholder from './common/LoadingPlaceholder'
import Library from '../helpers/Library'
import Cookies from 'universal-cookie'
import config from '../../config.json'
import ZoomInSvg from '../static/assets/zoom-in-20px.svg'
import ZoomOutSvg from '../static/assets/zoom-out-20px.svg'
import NextSvg from '../static/assets/next-20px.svg'
import PreviousSvg from '../static/assets/previous-20px.svg'
import FullscreenSvg from '../static/assets/fullscreen-20px.svg'
import { Notify } from 'notiflix/build/notiflix-notify-aio'
import { BrowserView, isMobile } from 'react-device-detect'

const cookies = new Cookies()

interface IProps {
    context
    bookID: number
    fullscreenCallback: () => void
}

interface IState {
    page: number
    inputPage: string
    imageBlob?: string
    loaded: boolean
    imageWidth: number
    pagesCount: number
    // Хранит промисы, возвращающие кэшированные страницы
    cachedPages: { [page: number]: Promise<string> }
    error?: string
}

export default class ViewBook extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props)
        const defaultImageWidth = isMobile
            ? document.body.scrollWidth * 0.95
            : document.body.scrollWidth * 0.4
        this.state = {
            page: 0,
            inputPage: '1',
            loaded: false,
            imageWidth: parseInt(cookies.get('image-width')) || defaultImageWidth,
            pagesCount: 0,
            cachedPages: {}
        }

        this.loadPage = this.loadPage.bind(this)
        this.zoomIn = this.zoomIn.bind(this)
        this.zoomOut = this.zoomOut.bind(this)
        this.nextPage = this.nextPage.bind(this)
        this.previousPage = this.previousPage.bind(this)
        this.setPage = this.setPage.bind(this)
        this.onKeyDown = this.onKeyDown.bind(this)
        this.cachePage = this.cachePage.bind(this)
        this.toggleFullscreen = this.toggleFullscreen.bind(this)

        document.addEventListener('keyup', e => {
            if (e.key == 'ArrowLeft' || e.key == 'Left')
                this.previousPage()
            else if (e.key == 'ArrowRight' || e.key == 'Right')
                this.nextPage()
            else if (e.key == '=' || e.key == '+')
                this.zoomIn()
            else if (e.key == '-')
                this.zoomOut()
            else if (e.key == 'Escape' || e.key == 'Esc')
                if (this.props.context.fullScreen)
                    this.toggleFullscreen()
        })
    }

    // Кэшировать страницу если она ещё не кэширована
    private cachePage(page: number): void {
        if (!this.state.cachedPages[page]) {
            this.state.cachedPages[page] = Library.getBookPage(this.props.bookID, page)
                .then(URL.createObjectURL)
        }
    }

    private async loadPage(page: number) {
        if (!this.state.cachedPages[page])
            this.cachePage(page)
        const cachedPage = await this.state.cachedPages[page]

        this.setState({ page, inputPage: (page + 1).toString(), imageBlob: cachedPage })
    }

    private zoomIn() {
        if (this.state.imageWidth <= 1500) {
            cookies.set('image-height', this.state.imageWidth + 100)
            this.setState({ imageWidth: this.state.imageWidth + 100 })
        }
    }

    private zoomOut() {
        if (this.state.imageWidth >= 800) {
            cookies.set('image-height', this.state.imageWidth - 100)
            this.setState({ imageWidth: this.state.imageWidth - 100 })
        }
    }

    private nextPage() {
        if (this.state.loaded && this.state.page < this.state.pagesCount - 1)
            this.setState({
                page: this.state.page + 1,
                loaded: false
            })
    }

    private previousPage() {
        if (this.state.loaded && this.state.page > 0)
            this.setState({
                page: this.state.page - 1,
                loaded: false
            })
    }

    private setPage(event) {
        if ((parseInt(event.target.value) > 0
                && parseInt(event.target.value) <= this.state.pagesCount)
            || event.target.value == '')
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

    private toggleFullscreen() {
        this.props.fullscreenCallback()
    }

    componentDidMount() {
        // Количество страниц
        Library.getBookInfo(this.props.bookID)
            .then(info => {
                this.setState({ pagesCount: info.pagesCount })
            })

        this.loadPage(this.state.page)
            .then(() => {
                this.setState({ loaded: true })
            })
    }

    componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>) {
        if (this.state.page != prevState.page) {
            this.loadPage(this.state.page)
                .then(() => {
                    this.setState({ loaded: true })
                })
                .catch(() => {
                    Notify.failure('Не удалось загрузить страницу', {
                        position: 'center-top'
                    })
                    this.setState({ page: prevState.page, inputPage: prevState.inputPage })
                })

            // При загрузке каждой страницы кэшируется следующая и предыдущая
            this.cachePage(this.state.page + 1)
            if (this.state.page > 0)
                this.cachePage(this.state.page - 1)

            // Проверка [и инвалидация] кэша
            // Если число кэшированных страниц превышает допустимое, удалить одну кэшированную страницу с начала или с конца
            const cachedCount = Object.keys(this.state.cachedPages).length
            if (cachedCount > config.cachePages) {
                let element
                if (this.state.page > prevState.page) {
                    element = Object.keys(this.state.cachedPages)[0]
                } else if (this.state.page < prevState.page) {
                    element = Object.keys(this.state.cachedPages)[cachedCount - 1]
                }
                this.state.cachedPages[element]
                    .then(URL.revokeObjectURL)
                delete this.state.cachedPages[element]
            }
        }
    }

    render() {
        return (
            <div className='container view-container'>
                {(this.props.context.darkMode && !this.props.context.fullScreen) &&
                    <p className='warning'>Внимание! В ночном режиме некоторые страницы могут отображаться
                        некорректно!</p>
                }
                <div
                    className={'page-container ' +
                        (this.props.context.darkMode ? 'dark ' : '') +
                        (this.props.context.fullScreen ? 'fullscreen ' : '')}>
                    {this.state.imageBlob &&
                        <div className='controls'>
                            <div>
                                <button className='arrow arrow-left button-secondary'
                                        onClick={this.previousPage}>
                                    <PreviousSvg />
                                </button>
                                <button className='arrow arrow-right button-secondary'
                                        onClick={this.nextPage}>
                                    <NextSvg />
                                </button>
                                <BrowserView>
                                    <button className='size-minus button-secondary' onClick={this.zoomOut}>
                                        <ZoomOutSvg />
                                    </button>
                                    <button className='size-plus button-secondary' onClick={this.zoomIn}>
                                        <ZoomInSvg />
                                    </button>
                                </BrowserView>
                                <button className='fullscreen button-secondary'
                                        onClick={this.toggleFullscreen}>
                                    <FullscreenSvg />
                                </button>
                            </div>
                            <div>
                                <p>Страница </p>
                                <input type='number' value={this.state.inputPage} onChange={this.setPage}
                                       onKeyDown={this.onKeyDown} />
                                <p> из {this.state.pagesCount}</p>
                            </div>
                        </div>
                    }
                    <div className={this.state.imageBlob ? 'page' : ''}>
                        {this.state.imageBlob
                            ? <img
                                className={this.state.loaded ? '' : 'loading'}
                                src={this.state.imageBlob}
                                width={this.state.imageWidth + 'px'}
                                alt='Страница книги' />
                            : <LoadingPlaceholder />
                        }
                    </div>
                </div>
            </div>
        )
    }
}