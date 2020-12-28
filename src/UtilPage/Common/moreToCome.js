import React, {Fragment} from 'react';
import Col from "react-bootstrap/lib/Col";
import ResponsiveContainer from "recharts/lib/component/ResponsiveContainer";

export default class MoreToCome extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let msg = this.props.msg
        if (!msg) msg = 'New features will be added to ErgoUtils soon'

        let title = this.props.title
        if (!title) title = 'More to Come'

        let icon = this.props.icon
        if (!icon) icon = 'lnr-hourglass'

        return (
            <Fragment>
                <Col className="disabled opacity-8" md="4" style={{userSelect: "none"}}>
                    <div className="card mb-3 bg-premium-dark widget-chart card-border">
                        <div className="widget-chart-content text-white">
                            <div className="icon-wrapper rounded-circle opacity-7">
                                <div className="icon-wrapper-bg bg-dark opacity-6"/>
                                <i className={icon + " icon-gradient bg-warm-flame"}/>
                            </div>
                            <div className="widget-numbers">
                                {title}
                            </div>
                            <div className="widget-subheading">
                                {msg}
                            </div>
                            <ResponsiveContainer height={50}>
                                <div className="widget-description text-warning">
                                </div>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Col>
            </Fragment>
        );
    }
}
