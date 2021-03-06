import React, {Fragment} from 'react';
import cx from 'classnames';
import Row from "react-bootstrap/lib/Row";
import NewToken from "./newToken";
import PictureNFT from "./pictureNFT";
import MoreToCome from "../../Common/moreToCome";
import {css} from "@emotion/core";
import AudioNFT from "./audioNFT";

export const override = css`
    display: block;
    margin: 0 auto;
`;

export default class Tokenomic extends React.Component {
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
                                <i className="pe-7s-server icon-gradient bg-night-fade"/>
                            </div>
                            <div>
                                Token Related Utilities
                            </div>
                        </div>
                    </div>
                    <div className="divider text-muted bg-premium-dark opacity-1"/>
                </div>

                <Row>
                    <NewToken/>
                    <PictureNFT/>
                    <AudioNFT/>
                    {/*<MoreToCome/>*/}
                </Row>
            </Fragment>
        );
    }
}
