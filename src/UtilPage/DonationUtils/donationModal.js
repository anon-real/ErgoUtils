import React, {Fragment} from 'react';
import {Button, Container, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import Clipboard from 'react-clipboard.js';
import {friendlyAddress, showMsg} from "../../utils/helpers";
import {withRouter} from 'react-router-dom';
import QRCode from "react-qr-code";

class DonationModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: true
        }
        this.close = this.close.bind(this)
    }

    close() {
        this.setState({isOpen: false})
        this.props.history.push('/token')
    }

    render() {
        return (
            <Fragment>
                <Modal
                    isOpen={this.state.isOpen}
                    backdrop="static"
                    toggle={this.close}
                    className={this.props.className}
                >
                    <ModalHeader>
                        <span className="fsize-1 text-muted">
                            Click on the address to copy!
                        </span>
                    </ModalHeader>
                    <ModalBody
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center',
                        }}
                    >
                        <Container
                        >
                            <p>
                                I've been contributing to the Ergo ecosystem by developing {' '}
                                <a target='_blank' href='https://ergoauctions.org'>Ergo Auction House</a>, {' '}
                                <a target='_blank' href='https://ergoutils.org'>Ergo Utils</a> {' '}
                                and {' '}
                                <a target='_blank' href='https://github.com/anon-real/DistributedSigsClient'>Zero
                                    Knowledge Treasury</a>
                                {' '} on top of Ergo.
                                <br/>
                                <br/>
                                Any amount of donation is appreciated and will help me to continue contributing to
                                the
                                ecosystem.
                                Please send your desired amount to this address: <Clipboard
                                component="b"
                                data-clipboard-text={
                                    '9ho3quMB1Vs6ejycB4t3tNw5oTkiu2ZSGT9VfBFshxb21baT3ex'
                                }
                                onSuccess={() => showMsg('Copied!')}
                            >
                                <br/>
                                9ho3quMB1Vs6ejycB4t3tNw5oTkiu2ZSGT9VfBFshxb21baT3ex
                            </Clipboard>
                            </p>

                            <QRCode value="9ho3quMB1Vs6ejycB4t3tNw5oTkiu2ZSGT9VfBFshxb21baT3ex"/>
                        </Container>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            className="ml-3 mr-3 btn-transition"
                            color="secondary"
                            onClick={this.close}
                        >
                            OK
                        </Button>
                    </ModalFooter>
                </Modal>
            </Fragment>
        );
    }
}

export default withRouter(DonationModal);