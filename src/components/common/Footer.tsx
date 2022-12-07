import * as React from 'react'

export default class Footer extends React.Component {
    render() {
        return (
            <footer>
                <div className='links'>
                    <a href='https://github.com/TohichSd/elib-viewer'>О проекте</a>
                    <a href='http://elib.mpei.ru'>Сайт библиотеки</a>
                </div>
            </footer>
        )
    }
}