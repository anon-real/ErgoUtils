import React, {Fragment} from 'react';
import cx from 'classnames';
import TitleComponent2 from '../../../Layout/AppMain/PageTitleExamples/Variation2';
import Col from "react-bootstrap/lib/Col";
import ResponsiveContainer from "recharts/lib/component/ResponsiveContainer";
import AreaChart from "recharts/lib/chart/AreaChart";
import Area from "recharts/lib/cartesian/Area";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Button} from "reactstrap";
import Row from "react-bootstrap/lib/Row";
import SyncLoader from "react-spinners/SyncLoader";
import NewToken from "./newToken";
import ArtWorkNFT from "./artworkNFT";

export default class MoreToCome extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Fragment>
                <Col className="disabled opacity-8" md="4" style={{userSelect: "none"}}>
                    <div className="card mb-3 bg-premium-dark widget-chart card-border">
                        <div className="widget-chart-content text-white">
                            <div className="icon-wrapper rounded-circle opacity-7">
                                <div className="icon-wrapper-bg bg-dark opacity-6"/>
                                <i className="lnr-hourglass icon-gradient bg-warm-flame"/>
                            </div>
                            <div className="widget-numbers">
                                More to Come
                            </div>
                            <div className="widget-subheading">
                                Ergo Utils will add new features
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
