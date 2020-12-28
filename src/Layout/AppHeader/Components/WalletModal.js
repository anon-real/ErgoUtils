import React from 'react';
import {friendlyAddress, getWalletAddress, isAddressValid, isWalletSaved, showMsg} from '../../../utils/helpers';

import {
    Button,
    FormFeedback,
    FormGroup,
    FormText,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    TabContent,
    TabPane,
} from 'reactstrap';
import classnames from 'classnames';
import {css} from '@emotion/core';

const override = css`
    display: block;
    margin: 0 auto;
`;

class WalletModal extends React.Component {
    constructor(props) {
        super(props);

        let type = 'assembler'
        let walletState = 'Configure Wallet';
        let addr = ''

        if (isWalletSaved()) {
            addr = getWalletAddress()
            walletState = friendlyAddress(addr, 6);
        }
        this.state = {
            modal: false,
            activeTab: type,
            userAddress: addr,
            walletState: walletState,
        };

        this.toggle = this.toggle.bind(this);
        this.saveWallet = this.saveWallet.bind(this);
        this.clearWallet = this.clearWallet.bind(this);
    }

    toggle() {
        this.setState({
            modal: !this.state.modal,
        });

        let type = 'assembler'
        this.setState({
            activeTab: type,
            processing: false,
            nodeUrl: '',
            apiKey: '',
        });
    }

    toggleTab(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab,
            });
        }
    }

    saveWallet() {
        this.setState({
            processing: true,
        });
        if (this.state.activeTab === 'assembler') {
            localStorage.setItem(
                'wallet',
                JSON.stringify({
                    type: this.state.activeTab,
                    address: this.state.userAddress,
                })
            );
            showMsg('Successfully configured the wallet.');
            this.toggle();
            this.setState({walletState: friendlyAddress(this.state.userAddress, 6)});
        }
    }

    clearWallet() {
        localStorage.removeItem('wallet');
        this.setState({walletState: 'Configure Wallet'});
        showMsg('Successfully cleared wallet info from local storage.');
        this.toggle();
    }

    render() {
        return (
            <span className="d-inline-block mb-2 mr-2">
                {/*{this.walletOk() ? <p>ok</p> : <p>fuck no</p>}*/}
                <Button
                    onClick={this.toggle}
                    outline
                    className="mr-2 btn-transition"
                    color="secondary"
                >
                    <i className="nav-link-icon pe-7s-cash mr-2"/>
                    <span>{this.state.walletState}</span>
                </Button>
                <Modal
                    isOpen={this.state.modal}
                    toggle={this.toggle}
                    className={this.props.className}
                >
                    <ModalHeader toggle={this.toggle}>
                        <div className="btn-actions-pane-right">
                            <Button
                                outline
                                className={
                                    'mr-2 ml-2 btn-wide btn-pill ' +
                                    classnames({
                                        active:
                                            this.state.activeTab ===
                                            'assembler',
                                    })
                                }
                                color="light"
                                onClick={() => {
                                    this.toggleTab('assembler');
                                }}
                            >
                                <span>Any Wallet</span>
                            </Button>
                        </div>
                    </ModalHeader>
                    <ModalBody>
                        <TabContent activeTab={this.state.activeTab}>
                            <TabPane tabId="assembler">
                                <p>
                                    You can use any wallet using the assembler service.
                                </p>
                                <p>
                                    The assembler service is an intermediate
                                    step that you can find out more about{' '}
                                    <a
                                        target="_blank"
                                        href="https://www.ergoforum.org/t/tx-assembler-service-bypassing-node-requirement-for-dapps/443"
                                    >
                                        here
                                    </a>
                                    . Your funds will be safe using smart contracts that prevent the service from cheating!
                                </p>

                                <FormGroup>
                                    <Label for="apiKey">Address</Label>
                                    <Input
                                        style={{fontSize: "12px"}}
                                        value={this.state.userAddress}
                                        type="text"
                                        name="address"
                                        id="address"
                                        invalid={!isAddressValid(this.state.userAddress)}
                                        onChange={(event) =>
                                            this.setState({
                                                userAddress: event.target.value,
                                            })
                                        }
                                        placeholder="Your ergo address"
                                    />
                                    <FormFeedback invalid>
                                        Invalid ergo address.
                                    </FormFeedback>
                                    <FormText>
                                        Your assets will be sent back to this address in case of any failures.
                                    </FormText>
                                </FormGroup>
                            </TabPane>
                        </TabContent>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            disabled={this.state.walletState === 'Configure Wallet'}
                            className="ml-5 mr-2 btn-transition"
                            color="secondary"
                            onClick={this.clearWallet}
                        >
                            Clear wallet info
                        </Button>
                        <Button
                            className="ml mr-2 btn-transition"
                            color="secondary"
                            onClick={this.toggle}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="mr-2 btn-transition"
                            color="secondary"
                            disabled={
                                this.state.activeTab === 'assembler' && !isAddressValid(this.state.userAddress)
                            }
                            onClick={this.saveWallet}
                        >
                            Save {this.state.processing}
                        </Button>
                    </ModalFooter>
                </Modal>
            </span>
        );
    }
}

export default WalletModal;
