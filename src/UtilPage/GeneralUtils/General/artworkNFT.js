import React, {Fragment} from 'react';
import Col from "react-bootstrap/lib/Col";
import ResponsiveContainer from "recharts/lib/component/ResponsiveContainer";
import {
    Button,
    CustomInput,
    FormFeedback,
    FormText,
    Input,
    InputGroupAddon,
    InputGroupText,
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
import {friendlyAddress, getWalletAddress, isAddressValid, isWalletSaved, showMsg} from "../../../utils/helpers";
import {Form} from "react-bootstrap";
import {override} from "./index";
import {getTokenP2s, issueToken} from "../../../utils/issueToken";
import SendModal from "./sendModal";
import {txFee} from "../../../utils/assembler";
import MyTokens from "./myTokens";
import {sha256} from "js-sha256";
import {geArtworkP2s, issueArtworkNFT, issueNFT, uploadArtwork} from "../../../utils/issueArtwork";
import MyArtworks from "./myArtworks";
import Clipboard from "react-clipboard.js";

export default class ArtWorkNFT extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            sendModal: false,
            myArtworks: false,
            loading: false,
            checksum: null,
            ergAmount: "0.1",
            decimals: 0,
            description: "",
            tokenName: "",
        };

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.issue = this.issue.bind(this);
        this.okToIssue = this.okToIssue.bind(this);
        this.hashFile = this.hashFile.bind(this);
        this.setFileChecksum = this.setFileChecksum.bind(this);
    }

    openModal() {
        if (!isWalletSaved()) {
            showMsg('Configure the wallet first', false, true)
            return
        }
        this.setState({
            toAddress: getWalletAddress(),
            isOpen: true,
        })
    }

    closeModal() {
        this.setState({
            isOpen: false,
            sendModal: false,
            myArtworks: false,
            loading: false,
            checksum: null,
            ergAmount: "0.1",
            decimals: 0,
            description: "",
            tokenName: "",
            advanced: false,
            upload: false,
            file: null
        })
    }

    okToIssue() {
        return isAddressValid(this.state.toAddress) &&
            ergToNano(this.state.ergAmount) >= 100000000 &&
            !this.state.loading && this.state.checksum !== null
    }

    issue() {
        this.setState({loading: true})
        geArtworkP2s(this.state.toAddress, ergToNano(this.state.ergAmount), this.state.checksum)
            .then(res => {
                uploadArtwork(this.state.file, this.state.upload).then(uploadRes => {
                    let description = this.state.description
                    let tokenName = this.state.tokenName
                    issueArtworkNFT(ergToNano(this.state.ergAmount), this.state.toAddress,
                        tokenName, description, res.address, this.state.checksum, uploadRes)
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
                })
            }).catch(err => {
            showMsg("Could not contact the assembler service", true)
            this.setState({loading: false})
        })

    }

    setFileChecksum(checksum, file) {
        this.setState({loading: false, checksum: checksum, file: file})
    }

    hashFile(event) {
        if (event.target.files.length === 0) {
            this.setState({checksum: null})
            return
        }
        this.setState({loading: true})
        let file = event.target.files[0]
        let reader = new FileReader()
        let setCS = this.setFileChecksum
        reader.onload = function (e) {
            let checksum = sha256(e.target.result)
            setCS(checksum, file)
        }
        reader.readAsArrayBuffer(file)

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
                <MyArtworks
                    close={() => this.setState({myArtworks: false})}
                    isOpen={this.state.myArtworks}
                />
                <Col md="4">
                    <div className="card mb-3 bg-premium-dark widget-chart card-border">
                        <div className="widget-chart-content text-white">
                            <div className="icon-wrapper rounded-circle opacity-7">
                                <div className="icon-wrapper-bg bg-dark opacity-6"/>
                                <i className="lnr-picture icon-gradient bg-warm-flame"/>
                            </div>
                            <div className="widget-numbers">
                                Artwork NFT
                            </div>
                            <div className="widget-subheading">
                                To issue NFT representing an artwork
                            </div>
                            <ResponsiveContainer height={50}>
                                <div className="widget-description text-warning">
                                    <Button
                                        onClick={() => this.setState({myArtworks: true})}
                                        outline
                                        className="btn-outline-light m-2 border-0"
                                        color="primary"
                                    >
                                        <i className="nav-link-icon lnr-layers"> </i>
                                        <span>My Artworks</span>
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
                        Issuing Artwork NFT
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
                                    <FormGroup>
                                        <Label for="tokenName">Artwork Name</Label>
                                        <InputGroup>
                                            <Input
                                                value={this.state.tokenName}
                                                onChange={(e) => {
                                                    this.setState({tokenName: e.target.value})
                                                }}
                                                id="tokenName"
                                            />
                                        </InputGroup>
                                        <FormText>artwork verbose name</FormText>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="description">Artwork Description</Label>
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
                                        <FormText>description of your artwork; anything to represent it to others, e.g.
                                            link to the artwork</FormText>
                                    </FormGroup>
                                    <Row>
                                        <Col md='6'>
                                            <FormGroup>
                                                <Label for="exampleFile">Artwork File</Label>
                                                <Input onChange={this.hashFile} type="file" name="file"
                                                       style={{overflowY: 'hidden'}}
                                                       id="exampleFile"/>
                                                <FormText color="muted">
                                                    will be only used to calculate the checksum of your artwork locally
                                                </FormText>
                                                {this.state.checksum &&
                                                <p>checksum <Clipboard
                                                    component="b"
                                                    data-clipboard-text={
                                                        this.state.checksum
                                                    }
                                                    onSuccess={() => showMsg('Copied!')}
                                                >
                                                    {friendlyAddress(this.state.checksum, 5)}
                                                </Clipboard>{' '}

                                                </p>}
                                            </FormGroup>
                                        </Col>
                                        <Col md='6'>
                                            <FormGroup>
                                                <CustomInput
                                                    type="checkbox" id="upload"
                                                    onChange={(e) => this.setState({upload: e.target.checked})}
                                                    label="Upload Artwork"/>
                                                <FormText color="muted">
                                                    If enabled, the artwork will be uploaded to imgbb.com; useful for
                                                    presenting artwork in auctioning.
                                                    <br/>
                                                    The size must be less than 32 MB
                                                </FormText>
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    <CustomInput
                                        disabled={this.state.loading}
                                        type="checkbox" id="advanced"
                                        onChange={(e) => this.setState({advanced: e.target.checked})}
                                        label="Advanced configuration"/>


                                    {this.state.advanced && <div>
                                        <div className="divider text-muted bg-premium-dark opacity-1"/>
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
                                                amount of ERG to be sent with the issued NFT
                                            </FormText>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="toAddress">Send To</Label>
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
                                            <FormText>issued NFT and ERG amount will be sent to this address, any P2S
                                                address works</FormText>
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
