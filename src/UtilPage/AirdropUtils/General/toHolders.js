import React, {Fragment} from 'react';
import Col from "react-bootstrap/lib/Col";
import ResponsiveContainer from "recharts/lib/component/ResponsiveContainer";
import {
    Button, CustomInput,
    FormFeedback,
    FormText,
    Input,
    InputGroupAddon, InputGroupText,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader
} from "reactstrap";
import Row from "react-bootstrap/lib/Row";
import BeatLoader from "react-spinners/BeatLoader";
import ReactTooltip from "react-tooltip";
import {ergToNano, isFloat} from "../../../utils/serializer";
import {getForKey, isWalletSaved, showMsg} from "../../../utils/helpers";
import {Form, FormGroup} from "react-bootstrap";
import {override} from "./index";
import SendModal from "../../Common/sendModal";
import {txFee} from "../../../utils/assembler";
import AddrList from "./listModal";
import InputGroup from "react-bootstrap/lib/InputGroup";
import {addrAirdropFee, getAddrAirdropP2s, startAddrAirdrop} from "../../../utils/addressAirdrop";
import MyAddrAirdrops from "./myAddrAirdrops";

export default class ToHolders extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            sendModal: false,
            loading: false,
            addrList: [],
            distErg: '0.1',
        };

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.okToStart = this.okToStart.bind(this);
        this.initiate = this.initiate.bind(this);
        this.openListModal = this.openListModal.bind(this);
    }

    openModal() {
        if (!isWalletSaved()) {
            showMsg('Configure the wallet first', false, true)
            return
        }
        this.setState({isOpen: true})
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
        return this.state.selected &&
            ergToNano(this.state.distErg) >= 100000000 &&
            (!this.state.withToken || (this.state.tokenId && this.state.tokenQuantity > 0)) &&
            !this.state.loading
    }

    initiate() {
        let lst = this.state.addrList.filter(item => item.name === this.state.selected)[0]
        if (this.state.withToken) {
            if (this.state.tokenQuantity % lst.addresses.length) {
                showMsg(`Can not equally distribute ${this.state.tokenQuantity} token among ${lst.addresses.length} addresses in the list!`, false, true)
                return
            }
        }

        let tokenId = this.state.tokenId
        let tokenAmount = this.state.tokenQuantity
        if (!this.state.withToken) {
            tokenId = ''
            tokenAmount = 0
        }
        this.setState({loading: true})
        getAddrAirdropP2s(lst.addresses, ergToNano(this.state.distErg), tokenId, parseInt(tokenAmount), this.state.includingFee)
            .then(res => {
                startAddrAirdrop(res.address, lst, ergToNano(this.state.distErg), tokenId, parseInt(tokenAmount), this.state.includingFee)
                    .then(reg => {
                        let fee = addrAirdropFee(lst.addresses.length)
                        let ergAmount = ergToNano(this.state.distErg) + (this.state.includingFee ? 0 : fee)
                        this.setState({
                            sendAddress: res.address,
                            sendModal: true,
                            ergAmount: ergAmount
                        })
                    }).catch(err => {
                    showMsg("Could not register request to the assembler", true)
                }).finally(_ => {
                    this.setState({loading: false})
                })

            }).catch(err => {

            showMsg("Could not contact the assembler service", true)
            this.setState({loading: false})
        })
    }

    openListModal(add = false) {
        if (add) {
            this.setState({
                listModal: true,
                toUpdateName: '',
                toUpdateAddr: []
            })
        } else {
            this.setState({
                listModal: true,
                toUpdateName: this.state.selected,
                toUpdateAddr: this.state.addrList.filter(item => item.name === this.state.selected)[0].addresses
            })
        }
    }

    render() {
        let tokenQuantity = this.state.tokenQuantity
        if (!tokenQuantity) tokenQuantity = 0
        let tokenId = this.state.tokenId
        if (!tokenId) tokenId = ''

        return (
            <Fragment>
                <SendModal
                    close={() => {
                        this.setState({sendModal: false})
                        this.closeModal()
                    }}
                    isOpen={this.state.sendModal}
                    address={this.state.sendAddress}
                    amount={this.state.ergAmount / 1e9}
                    tokenId={tokenId}
                    tokenQuantity={tokenQuantity}
                    withToken={this.state.withToken}
                />
                {/*<MyAddrAirdrops*/}
                {/*    close={() => {*/}
                {/*        this.setState({myAirdrops: false})*/}
                {/*    }}*/}
                {/*    isOpen={this.state.myAirdrops}*/}
                {/*/>*/}
                <Col md="4" style={{pointerEvents: 'none', opacity: '70%'}}>
                    <div className="card mb-3 bg-premium-dark widget-chart card-border">
                        <div className="widget-chart-content text-white">
                            <div className="icon-wrapper rounded-circle opacity-7">
                                <div className="icon-wrapper-bg bg-dark opacity-6"/>
                                <i className="lnr-list icon-gradient bg-warm-flame"/>
                            </div>
                            <div className="widget-numbers">
                                To Holders
                            </div>
                            <div className="widget-subheading">
                                To airdrop among a specific token holders
                            </div>
                            <ResponsiveContainer height={50}>
                                <div className="widget-description text-warning">
                                    <Button
                                        onClick={() => this.setState({myAirdrops: true})}
                                        outline
                                        className="btn-outline-light m-2 border-0"
                                        color="primary"
                                    >
                                        <i className="nav-link-icon lnr-layers"> </i>
                                        <span>My Airdrops</span>
                                    </Button>
                                    <Button
                                        onClick={this.openModal}
                                        outline
                                        className="btn-outline-light m-2 border-0"
                                        color="primary"
                                    >
                                        <i className="nav-link-icon lnr-plus-circle"> </i>
                                        <span>Airdrop</span>
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
                        Airdropping among token holders
                    </span>
                    </ModalHeader>
                    <ModalBody>
                        <div>
                            <Row>
                                <BeatLoader
                                    css={override}
                                    size={8}
                                    color={'#0b473e'}
                                    loading={this.state.loading}
                                />
                            </Row>

                            <fieldset disabled={this.state.loading}>
                                <FormGroup>
                                    <Input
                                        value={this.state.selected}
                                        onChange={(event) => {
                                            this.setState({
                                                selected: event.target.value
                                            });
                                        }}
                                        style={{fontSize: "12px"}}
                                        type="text"
                                        id="selected"
                                        invalid={!this.state.selected}
                                    >
                                        {this.state.addrList.map(
                                            (item) => {
                                                return <option>{item.name}</option>;
                                            }
                                        )}
                                    </Input>
                                    <FormFeedback invalid>
                                        Specify the token ID
                                    </FormFeedback>
                                    <FormText>
                                        Will airdrop among this token holders proportionately to the amount they hold
                                    </FormText>
                                </FormGroup>
                                <Row>
                                    <Col md='8'>
                                        <FormGroup>
                                            <InputGroup>
                                                <InputGroupAddon addonType="prepend">
                                                    <InputGroupText style={{backgroundColor: "white"}}>
                                                        <Label check>
                                                            <Input
                                                                checked={
                                                                    this.state.includingFee
                                                                }
                                                                onChange={(e) =>
                                                                    this.setState(
                                                                        {
                                                                            includingFee: e.target.checked,
                                                                        }
                                                                    )
                                                                }
                                                                className="mr-2"
                                                                addon
                                                                type="checkbox"
                                                                aria-label="Checkbox for following text input"
                                                            />
                                                            Including Fee
                                                        </Label>
                                                    </InputGroupText>
                                                </InputGroupAddon>
                                                <Input
                                                    type="text"
                                                    invalid={
                                                        ergToNano(this.state.distErg) < 100000000
                                                    }
                                                    value={
                                                        this.state.distErg
                                                    }
                                                    onChange={(e) => {
                                                        if (isFloat(e.target.value)) {
                                                            this.setState({
                                                                distErg:
                                                                e.target.value,
                                                            });
                                                        }
                                                    }}
                                                    id="ergAmount"
                                                />
                                                <InputGroupAddon addonType="append">
                                                    <InputGroupText style={{backgroundColor: "white"}}>
                                                        ERG
                                                    </InputGroupText>
                                                </InputGroupAddon>
                                                <FormFeedback invalid>
                                                    Must be at least 0.1 ERG
                                                </FormFeedback>
                                            </InputGroup>
                                            <FormText>
                                                ERG amount to be distributed; the "Including Fee" option is useful
                                                if
                                                sending via mixer
                                            </FormText>
                                        </FormGroup>
                                    </Col>
                                    <Col md='4'>
                                        <FormGroup>
                                            <CustomInput
                                                type="checkbox"
                                                id="upload"
                                                onChange={(e) => this.setState({withToken: e.target.checked})}
                                                label="Include Token"/>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                {this.state.withToken && <Row>
                                    <Col md='8'>
                                        <FormGroup>
                                            <Input
                                                value={this.state.tokenId}
                                                style={{fontSize: "11px"}}
                                                onChange={(event) => {
                                                    this.setState({
                                                        tokenId: event.target.value
                                                    });
                                                }}
                                                type="text"
                                                id="tokenId"
                                            />
                                            <FormText>
                                                Token ID
                                            </FormText>
                                        </FormGroup>
                                    </Col>
                                    <Col md='4'>
                                        <Input
                                            value={this.state.tokenQuantity}
                                            onChange={(event) => {
                                                this.setState({
                                                    tokenQuantity: event.target.value
                                                });
                                            }}
                                            type="number"
                                            id="tokenQuantity"
                                        />
                                        <FormText>
                                            Token quantity
                                        </FormText>
                                    </Col>
                                </Row>}
                            </fieldset>

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
                            Initiate
                        </Button>
                    </ModalFooter>
                </Modal>
            </Fragment>
        );
    }
}
