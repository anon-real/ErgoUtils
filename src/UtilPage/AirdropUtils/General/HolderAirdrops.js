import React from 'react';
import {Modal, ModalBody, ModalHeader, Table} from 'reactstrap';
import {friendlyAddress, getForKey, getTxUrl, setForKey, showMsg} from '../../../utils/helpers';
import moment from "moment";
import Clipboard from "react-clipboard.js";
import {decodeString} from "../../../utils/serializer";

export default class HolderAirdrops extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            airdrops: []
        };

        this.compressReqs = this.compressReqs.bind(this)
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.compressReqs()
    }

    async processReq(req) {
        if (req.compressed) return req
        return {
            compressed: true,
            txId: req.id,
            lstName: req.info.lstName,
            ergValue: req.info.ergValue,
            timestamp: req.creationTimestamp,
        }
    }

    compressReqs() {
        let reqs = getForKey('holderAirdrop')
        let toUpdate = reqs.filter(req => !req.compressed)
        let newReqs = reqs.map(req => this.processReq(req))
        Promise.all(newReqs).then(res => {
            if (toUpdate) setForKey(res, 'holderAirdrop')
            this.setState({airdrops: res.reverse()})
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
                        Your airdrops to list of addresses
                    </span>
                </ModalHeader>
                <ModalBody>
                    {this.state.airdrops.length === 0 ? (
                        <strong
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100px',
                            }}
                        >
                            You have no airdrops yet
                        </strong>
                    ) : (
                        <Table striped className="mb-0 border-0">
                            <thead>
                            <tr>
                                <th className="border-top-0"> Airdrop Time</th>
                                <th className="border-top-0"> Airdrop Transaction</th>
                            </tr>
                            </thead>
                            <tbody>
                            {this.state.airdrops.map((req) => {
                                let time = moment(req.timestamp).format('lll');
                                return (
                                    <tr>
                                        <td> {time} </td>
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
