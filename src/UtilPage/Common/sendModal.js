import React, {Fragment} from 'react';
import {Button, Container, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import Clipboard from 'react-clipboard.js';
import {friendlyAddress, friendlyToken, showMsg} from "../../utils/helpers";

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
                                {this.props.withToken && <Clipboard
                                    component="b"
                                    data-clipboard-text={
                                        this.props.tokenId
                                    }
                                    onSuccess={() => showMsg('Copied!')}
                                >
                                    and {' '}
                                    {this.props.tokenQuantity}{' '}
                                    of {friendlyAddress(this.props.tokenId, 10)} token
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
