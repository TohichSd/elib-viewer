import * as React from 'react'

interface IProps {
    query: string,
    context: object
}

export default class BooksList extends React.Component<IProps, any> {
    constructor(props: IProps) {
        super(props)
    }
    
    render() {
        return (
            <div>{this.props.query}</div>
        )
    }
}