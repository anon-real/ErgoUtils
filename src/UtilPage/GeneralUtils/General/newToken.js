import React, {Fragment} from 'react';
import Col from "react-bootstrap/lib/Col";
import ResponsiveContainer from "recharts/lib/component/ResponsiveContainer";
import {
    Button,
    CustomInput,
    FormFeedback,
    FormText,
    Input, InputGroupAddon, InputGroupText,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader
} from "reactstrap";
import Row from "react-bootstrap/lib/Row";
import BeatLoader from "react-spinners/BeatLoader";
import ReactTooltip from "react-tooltip";
import FormGroup from "react-bootstrap/lib/FormGroup";
import InputGroup from "react-bootstrap/lib/InputGroup";
import {ergToNano, isFloat, isNatural} from "../../../utils/serializer";
import {getWalletAddress, isAddressValid, isWalletSaved, showMsg} from "../../../utils/helpers";
import {Form} from "react-bootstrap";
import {override} from "./index";
import {getTokenP2s, issueToken} from "../../../utils/issueToken";
import SendModal from "./sendModal";
import {txFee} from "../../../utils/assembler";
import MyTokens from "./myTokens";

export default class NewToken extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            loading: false,
            advanced: false,
            ergAmount: "0.1",
            decimals: 0,
            description: "",
            name: "",
            tokenAmount: 10000,
        };

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.issue = this.issue.bind(this);
        this.okToIssue = this.okToIssue.bind(this);
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    openModal() {
        if (!isWalletSaved()) showMsg('Configure the wallet first', false, true)
        else {
            this.setState({
                toAddress: getWalletAddress(),
                isOpen: true
            })
        }
    }

    closeModal() {
        this.setState({
            isOpen: false,
            loading: false,
            advanced: false,
            ergAmount: "0.1",
            decimals: 0,
            description: "",
            name: "",
            tokenAmount: 10000,
            toAddress: getWalletAddress(),
        });
    }

    okToIssue() {
        return isAddressValid(this.state.toAddress) &&
            ergToNano(this.state.ergAmount) >= 100000000 &&
            this.state.tokenAmount > 0 && !this.state.loading
    }

    issue() {
        this.setState({loading: true})
        getTokenP2s(this.state.toAddress, this.state.tokenAmount, ergToNano(this.state.ergAmount))
            .then(res => {
                let decimals = 0
                let description = ""
                let tokenName = ""
                if (this.state.advanced) {
                    decimals = parseInt(this.state.decimals)
                    description = this.state.description
                    tokenName = this.state.tokenName
                }
                issueToken(this.state.tokenAmount, ergToNano(this.state.ergAmount), this.state.toAddress,
                    tokenName, description, decimals, res.address)
                    .then(regRes => {
                        this.setState({
                            sendAddress: res.address,
                            sendModal: true,
                        })

                    }).catch(err => {
                    showMsg("Could not register request to the assembler", true)
                })
                    .finally(() => {
                        this.setState({loading: false})
                    })
            }).catch(err => {
            showMsg("Could contact the assembler service", true)
            this.setState({loading: false})
        })
    }

    render() {
        return (
            <Fragment>
                <SendModal
                    close={() => {
                        this.setState({sendModal: false})
                        this.closeModal()
                    }}
                    isOpen={this.state.sendModal}
                    address={this.state.sendAddress}
                    amount={(ergToNano(this.state.ergAmount) + txFee) / 1e9}
                />
                <MyTokens
                    close={() => this.setState({myTokens: false})}
                    isOpen={this.state.myTokens}
                />
                <Col md="4">
                    <div className="card mb-3 bg-premium-dark widget-chart card-border">
                        <div className="widget-chart-content text-white">
                            <div className="icon-wrapper rounded-circle opacity-7">
                                <div className="icon-wrapper-bg bg-dark opacity-6"/>
                                <i className="lnr-diamond icon-gradient bg-warm-flame"/>
                            </div>
                            <div className="widget-numbers">
                                New Token
                            </div>
                            <div className="widget-subheading">
                                To issue new tokens on Ergo
                            </div>

                            <ResponsiveContainer height={50}>
                                <div className="widget-description text-warning">
                                    <Button
                                        onClick={() => this.setState({myTokens: true})}
                                        outline
                                        className="btn-outline-light m-2 border-0"
                                        color="primary"
                                    >
                                        <i className="nav-link-icon lnr-layers"> </i>
                                        <span>My Tokens</span>
                                    </Button>
                                    <Button
                                        onClick={this.openModal}
                                        outline
                                        className="btn-outline-light m-2 border-0"
                                        color="primary"
                                    >
                                        <i className="nav-link-icon lnr-plus-circle"> </i>
                                        <span>New</span>
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
                        Issuing new token
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
                                <Form>
                                    <Row>
                                        <Col md="6">
                                            <FormGroup>
                                                <Label for="tokenAmount">Quantity</Label>
                                                <InputGroup>
                                                    <Input
                                                        type="number"
                                                        value={this.state.tokenAmount}
                                                        invalid={this.state.tokenAmount <= 0 || !isNatural(this.state.tokenAmount)}
                                                        onChange={(e) => {
                                                            this.setState({tokenAmount: e.target.value})
                                                        }}
                                                        id="tokenAmount"
                                                    />
                                                    {/*<InputGroupAddon addonType="append">*/}
                                                    {/*    <InputGroupText>ERG</InputGroupText>*/}
                                                    {/*</InputGroupAddon>*/}
                                                    <FormFeedback invalid>
                                                        must be a positive and natural
                                                    </FormFeedback>
                                                </InputGroup>
                                                <FormText>token quantity to be issued</FormText>
                                            </FormGroup>
                                        </Col>
                                        <Col md="6">
                                            <FormGroup>
                                                <Label for="ergAmount">ERG Amount</Label>
                                                <InputGroup>
                                                    <Input
                                                        type="text"
                                                        invalid={
                                                            ergToNano(this.state.ergAmount) < 100000000
                                                        }
                                                        value={
                                                            this.state.ergAmount
                                                        }
                                                        onChange={(e) => {
                                                            if (isFloat(e.target.value)) {
                                                                this.setState({
                                                                    ergAmount:
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
                                                    amount of ERG to be sent with the issued tokens
                                                </FormText>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <FormGroup>
                                        <Label for="toAddress">Address</Label>
                                        <Input
                                            style={{fontSize: "12px"}}
                                            value={this.state.toAddress}
                                            invalid={!isAddressValid(this.state.toAddress)}
                                            onChange={(e) => {
                                                this.setState({toAddress: e.target.value})
                                            }}
                                            id="toAddress"
                                        />
                                        <FormFeedback invalid>
                                            Invalid ergo address.
                                        </FormFeedback>
                                        <FormText>issued tokens and ERG amount will be sent to this address, any P2S
                                            address works</FormText>
                                    </FormGroup>

                                    <CustomInput
                                        disabled={this.state.loading}
                                        type="checkbox" id="advanced"
                                        onChange={(e) => this.setState({advanced: e.target.checked})}
                                        label="Advanced configuration"/>


                                    {this.state.advanced && <div>
                                        <div className="divider text-muted bg-premium-dark opacity-1"/>
                                        <p>You don't need to fill all fields, just fill ones you want.</p>
                                        <Row>
                                            <Col md="6">
                                                <FormGroup>
                                                    {/*<Label for="tokenName">Token Name</Label>*/}
                                                    <InputGroup>
                                                        <Input
                                                            value={this.state.tokenName}
                                                            onChange={(e) => {
                                                                this.setState({tokenName: e.target.value})
                                                            }}
                                                            id="tokenName"
                                                        />
                                                    </InputGroup>
                                                    <FormText>token verbose name</FormText>
                                                </FormGroup>
                                            </Col>
                                            <Col md="6">
                                                <FormGroup>
                                                    {/*<Label for="decimals">Decimals</Label>*/}
                                                    <InputGroup>
                                                        <Input
                                                            type="number"
                                                            value={this.state.decimals}
                                                            defaultValue="0"
                                                            invalid={this.state.decimals < 0 || !isNatural(this.state.decimals)}
                                                            onChange={(e) => {
                                                                this.setState({decimals: e.target.value})
                                                            }}
                                                            id="decimals"
                                                        />
                                                        <FormFeedback invalid>
                                                            must be a whole non-negative
                                                        </FormFeedback>
                                                    </InputGroup>
                                                    <FormText>number of decimals</FormText>
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <FormGroup>
                                            {/*<Label for="description">Description</Label>*/}
                                            <InputGroup>
                                                <Input
                                                    type="textarea"
                                                    value={this.state.description}
                                                    onChange={(e) => {
                                                        this.setState({description: e.target.value})
                                                    }}
                                                    id="description"
                                                />
                                            </InputGroup>
                                            <FormText>token description</FormText>
                                        </FormGroup>
                                    </div>}
                                </Form>
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
                            disabled={!this.okToIssue()}
                            // disabled={}
                            onClick={this.issue}
                        >
                            Issue
                        </Button>
                    </ModalFooter>
                </Modal>
            </Fragment>
        );
    }
}
