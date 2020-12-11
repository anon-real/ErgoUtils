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
import MoreToCome from "./moreToCome";
import {css} from "@emotion/core";
import SendModal from "./sendModal";

export const override = css`
    display: block;
    margin: 0 auto;
`;

export default class ActiveAuctions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tokenModal: false
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
                                <i className="pe-7s-menu icon-gradient bg-night-fade"/>
                            </div>
                            <div>
                                General Utilities
                            </div>
                        </div>
                    </div>
                    <div className="divider text-muted bg-premium-dark opacity-1"/>
                </div>

                <Row>
                    <NewToken/>
                    <ArtWorkNFT/>
                    <MoreToCome/>
                </Row>
            </Fragment>
        );
    }
}
