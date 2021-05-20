import React from 'react';
import {Modal, ModalBody, ModalHeader, Table} from 'reactstrap';
import {copyToClipboard, friendlyAddress, getForKey} from '../../../utils/helpers';

export default class MyHops extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hops: []
        };

        this.processReqs = this.processReqs.bind(this)
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.processReqs()
    }

    async processReq(req) {
        const res = await import('../../../utils/mixerHop');
        return {
            depositAddr: req.depositAddr,
            numLvls: req.numLvls,
            toAddr: req.toAddr
        }
    }

    processReqs() {
        let reqs = getForKey('hops')
        let newReqs = reqs.map(req => this.processReq(req))
        Promise.all(newReqs).then(res => {
            this.setState({hops: res.reverse()})
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
                        Your obfuscating addresses. Click on addresses to copy!
                    </span>
                </ModalHeader>
                <ModalBody>
                    <p className='font-weight-lighter'>These addresses are permanent and you can use them as much as you
                        wish.</p>
                    <p className='font-weight-lighter'>Withdraw from your mixer to Deposit Address and you will receive
                        your ERGs in Withdraw Address automatically.</p>
                    <p/>
                    {this.state.hops.length === 0 ? (
                        <strong
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100px',
                            }}
                        >
                            You have no obfuscating addresses yet
                        </strong>
                    ) : (
                        <Table striped className="mb-0 border-0">
                            <thead>
                            <tr>
                                <th className="border-top-0"> Deposit Address</th>
                                <th className="border-top-0"> Number of Steps</th>
                                <th className="border-top-0"> Withdraw Address</th>
                            </tr>
                            </thead>
                            <tbody>
                            {this.state.hops.map((req) => {
                                return (
                                    <tr>
                                        <td onClick={() => copyToClipboard(req.depositAddr)}> {friendlyAddress(req.depositAddr, 10)} </td>
                                        <td> {req.numLvls} </td>
                                        <td onClick={() => copyToClipboard(req.toAddr)}> {friendlyAddress(req.toAddr, 10)} </td>
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
