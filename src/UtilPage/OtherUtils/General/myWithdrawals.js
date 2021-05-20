import React from 'react';
import {Modal, ModalBody, ModalHeader, Table} from 'reactstrap';
import {copyToClipboard, friendlyAddress, getForKey, getTxUrl} from '../../../utils/helpers';
import moment from "moment";

export default class MyWithdrawals extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            withdrawals: []
        };

        this.processReqs = this.processReqs.bind(this)
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.processReqs()
    }

    async processReq(req) {
        return {
            time: req.time,
            value: req.value/1e9,
            txId: req.txs[req.txs.length - 1].id
        }
    }

    processReqs() {
        let reqs = getForKey('doneBoxes')
        let newReqs = reqs.map(req => this.processReq(req))
        Promise.all(newReqs).then(res => {
            this.setState({withdrawals: res.reverse()})
        })
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
                        Your obfuscated withdrawals
                    </span>
                </ModalHeader>
                <ModalBody>
                    {this.state.withdrawals.length === 0 ? (
                        <strong
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100px',
                            }}
                        >
                            No entries yet
                        </strong>
                    ) : (
                        <Table striped className="mb-0 border-0">
                            <thead>
                            <tr>
                                <th className="border-top-0"> Time</th>
                                <th className="border-top-0"> Amount</th>
                                <th className="border-top-0"> Transaction</th>
                            </tr>
                            </thead>
                            <tbody>
                            {this.state.withdrawals.map((req) => {
                                let time = moment(req.time).format('lll');
                                return (
                                    <tr>
                                        <td> {time} </td>
                                        <td> {req.value} ERG </td>
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
