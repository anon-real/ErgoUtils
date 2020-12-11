import React, {Fragment} from 'react';
import cx from 'classnames';
import TitleComponent2 from '../../../Layout/AppMain/PageTitleExamples/Variation2';
import Col from "react-bootstrap/lib/Col";
import ResponsiveContainer from "recharts/lib/component/ResponsiveContainer";
import AreaChart from "recharts/lib/chart/AreaChart";
import Area from "recharts/lib/cartesian/Area";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Button, Container} from "reactstrap";
import Row from "react-bootstrap/lib/Row";
import SyncLoader from "react-spinners/SyncLoader";
import NewToken from "./newToken";
import {
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader
} from "reactstrap";
import Clipboard from 'react-clipboard.js';
import {txFee} from "../../../utils/assembler";
import {friendlyAddress, showMsg} from "../../../utils/helpers";

export default class SendModal extends React.Component {
    constructor(props) {
        super(props);
    }

    componentWillReceiveProps(nextProps, nextContext) {
    }

    render() {
        return (
            <Fragment>
                <Modal
                    isOpen={this.props.isOpen}
                    backdrop="static"
                    toggle={this.props.close}
                    className={this.props.className}
                >
                    <ModalHeader>
                        <span className="fsize-1 text-muted">
                            Click on the amount and the address to copy them!
                        </span>
                    </ModalHeader>
                    <ModalBody>
                        <Container>
                            <p>
                                Send{' '}
                                <Clipboard
                                    component="b"
                                    data-clipboard-text={
                                        this.props.amount
                                    }
                                    onSuccess={() => showMsg('Copied!')}
                                >
                                    exactly{' '}
                                    {this.props.amount}{' '}
                                    erg
                                </Clipboard>{' '}
                                to{' '}
                                <Clipboard
                                    component="b"
                                    data-clipboard-text={this.props.address}
                                    onSuccess={() => showMsg('Copied!')}
                                >
                                    {friendlyAddress(this.props.address)}
                                </Clipboard>
                                <b
                                    onClick={() =>
                                        this.copyToClipboard(
                                            this.props.address
                                        )
                                    }
                                ></b>
                                ; the operation will be done automatically afterward.
                            </p>
                            <p>
                                Your funds will be safe; smart contracts are being used to prevent the assembler service to cheat!
                            </p>
                        </Container>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            className="ml-3 mr-3 btn-transition"
                            color="secondary"
                            onClick={this.props.close}
                        >
                            OK
                        </Button>
                    </ModalFooter>
                </Modal>
            </Fragment>
        );
    }
}
