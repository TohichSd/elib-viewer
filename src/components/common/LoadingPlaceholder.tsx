import * as React from 'react'

export default class LoadingPlaceholder extends React.Component{
    render() {
        return (
            <div className="lds-ellipsis">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        )
    }
}