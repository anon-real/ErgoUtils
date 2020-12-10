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

export default class ActiveAuctions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    render() {
        return (
            <Fragment>
                <div className="app-page-title" style={{backgroundColor: '#f1f4f6'}}>
                    <div className="page-title-wrapper">
                        <div className="page-title-heading">
                            <div
                                className={cx('page-title-icon', {
                                    'd-none': false,
                                })}
                            >
                                <i className="pe-7s-menu icon-gradient bg-night-fade" />
                            </div>
                            <div>
                                General Utilities
                            </div>
                        </div>
                    </div>
                    <div className="divider text-muted bg-premium-dark opacity-1"/>
                </div>

                <Row>

                <Col md="4">
                    <div className="card mb-3 bg-premium-dark widget-chart card-border">
                        <div className="widget-chart-content text-white">
                            <div className="icon-wrapper rounded-circle opacity-7">
                                <div className="icon-wrapper-bg bg-dark opacity-6"/>
                                <i className="lnr-diamond icon-gradient bg-warm-flame"/>
                            </div>
                            <div className="widget-numbers">
                                New Token
                            </div>
                            <div className="widget-subheading">
                                To issue new tokens on Ergo
                            </div>

                            <ResponsiveContainer height={50}>
                                <div className="widget-description text-warning">
                                    <Button
                                        // onClick={() => this.openMyBids()}
                                        outline
                                        className="btn-outline-light m-2 border-0"
                                        color="primary"
                                    >
                                        <i className="nav-link-icon lnr-layers"> </i>
                                        <span>My Tokens</span>
                                    </Button>
                                    <Button
                                        // onClick={() => this.showTx(this.props.box.finalTx)}
                                        outline
                                        className="btn-outline-light m-2 border-0"
                                        color="primary"
                                    >
                                        <i className="nav-link-icon lnr-plus-circle"> </i>
                                        <span>New</span>
                                    </Button>
                                </div>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Col>

                <Col md="4">
                    <div className="card mb-3 bg-premium-dark widget-chart card-border">
                        <div className="widget-chart-content text-white">
                            <div className="icon-wrapper rounded-circle opacity-7">
                                <div className="icon-wrapper-bg bg-dark opacity-6"/>
                                <i className="lnr-picture icon-gradient bg-warm-flame"/>
                            </div>
                            <div className="widget-numbers">
                                Artwork NFT
                            </div>
                            <div className="widget-subheading">
                                To issue NFT representing an artwork
                            </div>
                            <ResponsiveContainer height={50}>
                            <div className="widget-description text-warning">
                                <Button
                                    // onClick={() => this.openMyBids()}
                                    outline
                                    className="btn-outline-light m-2 border-0"
                                    color="primary"
                                >
                                    <i className="nav-link-icon lnr-layers"> </i>
                                    <span>My Artworks</span>
                                </Button>
                                <Button
                                    // onClick={() => this.showTx(this.props.box.finalTx)}
                                    outline
                                    className="btn-outline-light m-2 border-0"
                                    color="primary"
                                >
                                    <i className="nav-link-icon lnr-plus-circle"> </i>
                                    <span>New</span>
                                </Button>
                            </div>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Col>

                    <Col className="disabled opacity-8" md="4">
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
                </Row>
            </Fragment>
        );
    }
}
