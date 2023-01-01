import React, {Fragment} from 'react';
import {Button, Container, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import Clipboard from 'react-clipboard.js';
import {friendlyAddress, friendlyToken, showMsg} from "../../utils/helpers";
import QRCode from "react-qr-code";
import {longToCurrency} from "../../utils/serializer";

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
                                {!this.props.ignoreErg && <Clipboard
                                    component="b"
                                    data-clipboard-text={
                                        this.props.amount
                                    }
                                    onSuccess={() => showMsg('Copied!')}
                                >
                                    exactly{' '}
                                    {this.props.amount}{' '}
                                    ERG
                                </Clipboard>}{' '}
                                {this.props.withToken && <Clipboard
                                    component="b"
                                    data-clipboard-text={
                                        this.props.tokenId
                                    }
                                    onSuccess={() => showMsg('Copied!')}
                                >
                                    {!this.props.ignoreErg && <span>and {' '}</span>}
                                    {longToCurrency(this.props.tokenQuantity, this.props.decimals)}{' '}
                                    {this.props.tokenName}
                                </Clipboard>}{' '}
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
                            {this.props.withToken && <p>
                                Send <b>0.01 ERG</b> alongside the token.
                            </p>}
                            <p>
                                Your funds will be safe. Smart contracts are being used to prevent the intermediate service from cheating!
                            </p>
                            <QRCode value={"https://explorer.ergoplatform.com/payment-request?address=" + this.props.address +
                            "&amount=" + this.props.amount + `&${this.props.tokenId}=${this.props.tokenQuantity}`}/>
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
