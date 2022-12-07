import * as React from 'react'

export default class Settings extends React.Component {
    render() {
        return (
            <div className='container settings-container'>
                <div className='form-settings'>
                    <label>
                        <p>Прокси-сервер</p>
                        <input type='text' />
                    </label>
                </div>
            </div>
        )
    }
}