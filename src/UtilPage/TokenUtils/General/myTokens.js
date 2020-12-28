import React from 'react';
import {Modal, ModalBody, ModalHeader, Table} from 'reactstrap';
import {friendlyAddress, getForKey, getTxUrl, setForKey, showMsg} from '../../../utils/helpers';
import moment from "moment";
import Clipboard from "react-clipboard.js";

export default class MyTokens extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tokens: []
        };

        this.loadMyTokens = this.loadMyTokens.bind(this)
        this.compressReqs = this.compressReqs.bind(this)
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.loadMyTokens()
    }

    loadMyTokens() {
        this.setState({tokens: this.compressReqs().reverse()})
    }

    compressReqs() {
        let reqs = getForKey('tokenIssuance')
        let toUpdate = false
        let newReqs = reqs.map(req => {
            if (req.compressed) return req
            toUpdate = true
            return {
                compressed: true,
                txId: req.id,
                ergValue: req.outputs[0].value,
                tokenId: req.outputs[0].assets[0].tokenId,
                quantity: req.outputs[0].assets[0].amount,
                timestamp: req.creationTimestamp,
            }
        })
        if (toUpdate) setForKey(newReqs, 'tokenIssuance')
        return newReqs
    }

    render() {
        return (
            <Modal
                size="lg"
                isOpen={this.props.isOpen}
                toggle={this.props.close}
                className={this.props.className}
            >
                <ModalHeader toggle={this.props.close}>
                    <span className="fsize-1 text-muted">
                        Your issued tokens, click on token id to copy
                    </span>
                </ModalHeader>
                <ModalBody>
                    {this.state.tokens.length === 0 ? (
                        <strong
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100px',
                            }}
                        >
                            You have no issued tokens yet
                        </strong>
                    ) : (
                        <Table striped className="mb-0 border-0">
                            <thead>
                            <tr>
                                <th className="border-top-0"> Issuance Time</th>
                                <th className="border-top-0"> Token ID</th>
                                <th className="border-top-0"> Token Quantity</th>
                                <th className="border-top-0"> ERG Value</th>
                                <th className="border-top-0"> Issuance Transaction</th>
                            </tr>
                            </thead>
                            <tbody>
                            {this.state.tokens.map((req) => {
                                let time = moment(req.timestamp).format('lll');
                                return (
                                    <tr>
                                        <td> {time} </td>
                                        <td>
                                            <Clipboard
                                                component="b"
                                                data-clipboard-text={
                                                    req.tokenId
                                                }
                                                onSuccess={() => showMsg('Copied!')}
                                            >
                                                {friendlyAddress(req.tokenId, 5)}
                                            </Clipboard>{' '}
                                        </td>
                                        <td> {req.quantity} </td>
                                        <td> {req.ergValue / 1e9} </td>
                                        <td>
                                            <a
                                                href={getTxUrl(req.txId)}
                                                className="btn-outline-lin m-2 border-0"
                                                target="_blank"
                                                color="primary"
                                            >
                        See Transaction
                                            </a>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </Table>
                    )}
                </ModalBody>
            </Modal>
        );
    }
}
