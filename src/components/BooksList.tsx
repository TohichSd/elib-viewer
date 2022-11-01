import * as React from 'react'

interface IProps {
    query: string
}

export default class BooksList extends React.Component<IProps> {
    constructor(props: IProps) {
        super(props)
    }
    
    render() {
        return (
            <div>{this.props.query}</div>
        )
    }
}