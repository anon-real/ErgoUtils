import React, {Fragment} from 'react';
import Col from "react-bootstrap/lib/Col";
import ResponsiveContainer from "recharts/lib/component/ResponsiveContainer";
import 'rc-slider/assets/index.css';
import {Button, FormFeedback, FormText, Input, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import ReactTooltip from "react-tooltip";
import {addReq, getForKey, getWalletAddress, isAddressValid, isWalletSaved, showMsg} from "../../../utils/helpers";
import {FormGroup} from "react-bootstrap";
import Slider from "rc-slider/lib/Slider";
import MyHops from "./myHops";
import MyWithdrawals from "./myWithdrawals";

const wrapperStyle = {width: 400, margin: 50};
let numLvls = 3

export default class MixerHops extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            sendModal: false,
            loading: false,
            toAddr: getWalletAddress(),
        };

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.okToStart = this.okToStart.bind(this);
        this.initiate = this.initiate.bind(this);
    }

    openModal() {
        if (!isWalletSaved()) {
            showMsg('Configure the wallet first', false, true)
            return
        }
        this.refreshAddrList()
        this.setState({isOpen: true})
    }

    refreshAddrList() {
        let lst = getForKey('addrList')
        if (lst.length > 0) {
            this.setState({selected: lst[0].name})
        }
        this.setState({addrList: lst})
    }

    closeModal() {
        this.setState({
            isOpen: false,
            sendModal: false,
            loading: false,
            selected: undefined,
            withToken: false,
            tokenId: undefined,
            tokenQuantity: undefined,
            includingFee: false,
        })
    }

    okToStart() {
        return numLvls > 0 &&
            isAddressValid(this.state.toAddr) &&
            !this.state.loading
    }

    async initiate() {
        const res = await import('../../../utils/mixerHop');
        let sec = res.rndSecret()
        let depositAddr = res.secToAddr(sec)
        addReq({secret: sec, numLvls: numLvls, toAddr: this.state.toAddr, depositAddr: depositAddr}, 'hops')
        showMsg('Mixer obfuscating address created successfully. Check it out in My Hops section.')
        this.setState({isOpen: false})
    }

    render() {
        return (
            <Fragment>
                <MyHops
                    close={() => {
                        this.setState({myHops: false})
                    }}
                    isOpen={this.state.myHops}
                />

                <MyWithdrawals
                    close={() => {
                        this.setState({myWithdrawals: false})
                    }}
                    isOpen={this.state.myWithdrawals}
                />
                <Col md="6">
                    <div className="card mb-3 bg-premium-dark widget-chart card-border">
                        <div className="widget-chart-content text-white">
                            <div className="icon-wrapper rounded-circle opacity-7">
                                <div className="icon-wrapper-bg bg-dark opacity-6"/>
                                <i className="lnr-dice icon-gradient bg-warm-flame"/>
                            </div>
                            <div className="widget-numbers">
                                Mixer Hops
                            </div>
                            <div className="widget-subheading">
                                Your mixer withdrawal will go through a bunch of random addresses and you will receive
                                them from an ordinary address
                            </div>
                            <ResponsiveContainer height={80}>
                                <div className="widget-description text-warning">
                                    <Button
                                        onClick={() => this.setState({myWithdrawals: true})}
                                        outline
                                        className="btn-outline-light m-2 border-0"
                                        color="primary"
                                    >
                                        <i className="nav-link-icon lnr-layers"> </i>
                                        <span>My Withdrawals</span>
                                    </Button>
                                    <Button
                                        onClick={() => this.setState({myHops: true})}
                                        outline
                                        className="btn-outline-light m-2 border-0"
                                        color="primary"
                                    >
                                        <i className="nav-link-icon lnr-layers"> </i>
                                        <span>My Hops</span>
                                    </Button>
                                    <Button
                                        onClick={this.openModal}
                                        outline
                                        className="btn-outline-light m-2 border-0"
                                        color="primary"
                                    >
                                        <i className="nav-link-icon lnr-plus-circle"> </i>
                                        <span>New Hop</span>
                                    </Button>
                                </div>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Col>
                <Modal
                    size="md"
                    isOpen={this.state.isOpen}
                    toggle={this.closeModal}
                >
                    <ModalHeader toggle={this.props.close}>
                        <ReactTooltip/>
                        <span className="fsize-1 text-muted">
                        Creating a permanent obfuscating point
                    </span>
                    </ModalHeader>
                    <ModalBody>
                        <div>
                            <FormGroup>
                                <Input
                                    value={this.state.toAddr}
                                    onChange={(event) => {
                                        this.setState({
                                            toAddr: event.target.value
                                        });
                                    }}
                                    style={{fontSize: "12px"}}
                                    type="text"
                                    id="selected"
                                    invalid={!isAddressValid(this.state.toAddr)}
                                />
                                <FormFeedback invalid>
                                    Specify a valid address
                                </FormFeedback>
                                <FormText>
                                    You will receive your withdrawals in this address without anyone knowing it is from
                                    the mixer
                                </FormText>

                            </FormGroup>
                            <FormGroup>
                                <FormText>
                                    Your withdrawals will go through this number of steps
                                </FormText>
                                <Slider min={2} max={7} defaultValue={3}
                                        onChange={(res) => numLvls = res}
                                        marks={{2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7}}/>
                            </FormGroup>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            className="ml mr-2 btn-transition"
                            color="secondary"
                            onClick={this.closeModal}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="mr-2 btn-transition"
                            color="secondary"
                            disabled={!this.okToStart()}
                            onClick={this.initiate}
                        >
                            Create
                        </Button>
                    </ModalFooter>
                </Modal>
            </Fragment>
        );
    }
}
