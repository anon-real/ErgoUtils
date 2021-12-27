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
    ModalHeader,
    Table
} from "reactstrap";
import Row from "react-bootstrap/lib/Row";
import BeatLoader from "react-spinners/BeatLoader";
import ReactTooltip from "react-tooltip";
import {currencyToLong, isFloat, longToCurrency} from "../../../utils/serializer";
import {friendlyAddress, isP2pk, isWalletSaved, showMsg} from "../../../utils/helpers";
import {FormGroup} from "react-bootstrap";
import {override} from "./index";
import SendModal from "../../Common/sendModal";
import InputGroup from "react-bootstrap/lib/InputGroup";
import {getHolders, getTokenInfo} from "../../../utils/explorer";
import {maxOut, minimalErgAmount, txFee} from "../../../utils/consts";
import ProgressBar from "react-bootstrap/lib/ProgressBar";
import {startAddrAirdrop} from "../../../utils/addressAirdrop";
import {startHolderAirdrop} from "../../../utils/holderAirdrop";

export default class ToHolders extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            sendModal: false,
            loading: false,
            addrList: [],
            distErg: '0.1',
            onlyP2s: false,
            holdersToken: {},
            distributeToken: {}
        };

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.okToStart = this.okToStart.bind(this);
        this.initiate = this.initiate.bind(this);
        this.openListModal = this.openListModal.bind(this);
        this.changeToken = this.changeToken.bind(this);
        this.getHolderReceivingAmount = this.getHolderReceivingAmount.bind(this);
        this.airdrop = this.airdrop.bind(this);
    }

    async changeToken(tokenId, key) {
        const state = {
            loading: false,
        }
        try {
            this.setState({
                loading: true
            });
            const info = await getTokenInfo(tokenId)
            state[key] = {
                tokenId: tokenId,
                decimals: info.decimals,
                tokenName: info.name
            }
        } catch (e) {
            state[key] = {
                tokenId: undefined,
                decimals: undefined,
                tokenName: undefined
            }
        } finally {
            this.setState(state)
        }

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
            withToken: false,
            tokenId: undefined,
            tokenQuantity: undefined,
            includingFee: false,
        })
    }

    okToStart() {
        return this.state.holdersToken.tokenId &&
            (this.state.withToken || currencyToLong(this.state.distErg) >= 100000000) &&
            (!this.state.withToken || (this.state.distributeToken && this.state.tokenQuantity > 0)) &&
            !this.state.loading
    }

    getHolderReceivingAmount(addr) {
        const am = this.state.outs[addr].use ? this.state.outs[addr].amount : 0
        const total = this.state.totalHoldings
        const perc = am / total
        const toDis = this.state.withToken ? this.state.tokenQuantity : currencyToLong(this.state.distErg)
        let receives = Math.floor(toDis * perc)
        if (!this.state.withToken && receives < minimalErgAmount) receives = 0
        return receives
    }

    async initiate() {
        this.setState({loading: true, doneBoxes: 0, total: 0})

        let holders = {}
        let offset = 0
        const tokenId = this.state.holdersToken.tokenId
        while (true) {
            const res = await getHolders(tokenId, offset)
            offset += 100
            res.items.forEach(it => {
                for (let i = 0; i < it.assets.length; i++) {
                    const ass = it.assets[i]
                    if (ass.tokenId === tokenId) {
                        if (!holders[it.address]) holders[it.address] = 0
                        holders[it.address] += ass.amount
                        break
                    }
                }
            })
            this.setState({doneBoxes: offset, total: res.total})
            if (res.total <= offset)
                break
        }

        let outs = {}
        let total = 0
        Object.keys(holders).forEach(holder => {
            total += holders[holder]
            outs[holder] = {
                amount: holders[holder],
                use: true,
                isP2pk: isP2pk(holder)
            }
        })
        this.setState({outs: outs, holderModal: true, totalHoldings: total, loading: false})

        // const total = Object.values(holders).reduce((a, b) => a + b, 0)
        // const tokenQnt = this.state.tokenQuantity

        // const ergQnt = ergToNano(this.state.distErg)
        // Object.keys(holders).forEach(addr => {
        //     const perc = (1. * holders[addr]) / total
        //     if (!this.state.withToken) {
        //         const curNumErg = Math.floor(perc * ergQnt)
        //         if (curNumErg >= minimalErgAmount) {
        //             outs[addr] = curNumErg
        //         } else outs[addr] = 0
        //     } else {
        //         const curNumToken = Math.floor(perc * tokenQnt)
        //         outs[addr] = curNumToken
        //     }
        // })
        // const after = Object.values(outs).reduce((a, b) => a + b, 0)
        // console.log('total', qnt, 'after', after)


        return
        // let lst = this.state.addrList.filter(item => item.name === this.state.selected)[0]
        // if (this.state.withToken) {
        //     if (this.state.tokenQuantity % lst.addresses.length) {
        //         showMsg(`Can not equally distribute ${this.state.tokenQuantity} token among ${lst.addresses.length} addresses in the list!`, false, true)
        //         return
        //     }
        // }
        //
        // let tokenId = this.state.tokenId
        // let tokenAmount = this.state.tokenQuantity
        // if (!this.state.withToken) {
        //     tokenId = ''
        //     tokenAmount = 0
        // }
        // getAddrAirdropP2s(lst.addresses, currencyToLong(this.state.distErg), tokenId, parseInt(tokenAmount), this.state.includingFee)
        //     .then(res => {
        //         startAddrAirdrop(res.address, lst, currencyToLong(this.state.distErg), tokenId, parseInt(tokenAmount), this.state.includingFee)
        //             .then(reg => {
        //                 let fee = addrAirdropFee(lst.addresses.length)
        //                 let ergAmount = currencyToLong(this.state.distErg) + (this.state.includingFee ? 0 : fee)
        //                 this.setState({
        //                     sendAddress: res.address,
        //                     sendModal: true,
        //                     ergAmount: ergAmount
        //                 })
        //             }).catch(err => {
        //             showMsg("Could not register request to the assembler", true)
        //         }).finally(_ => {
        //             this.setState({loading: false})
        //         })
        //
        //     }).catch(err => {
        //
        //     showMsg("Could not contact the assembler service", true)
        //     this.setState({loading: false})
        // })
    }

    async airdrop() {
        this.setState({loading: true})
        const addrs = Object.keys(this.state.outs).filter(addr => this.getHolderReceivingAmount(addr) > 0)
        const numTxs = (Math.ceil(addrs.length / maxOut))
        const fee = txFee + txFee * numTxs
        let needErg = fee + addrs.length * minimalErgAmount
        if (!this.state.withToken) needErg = fee + addrs.reduce((a, b) => a + this.getHolderReceivingAmount(b) , 0)
        let leaves = []
        for (let i = 0; i < numTxs; i++) {
            const cur = addrs.slice(i * maxOut, (i + 1) * maxOut)

            const outs = cur.map(addr => {
                let ergAm = this.getHolderReceivingAmount(addr)
                let assets = []
                if (this.state.withToken) {
                    assets = [{
                            tokenId: this.state.distributeToken.tokenId,
                            amount: ergAm
                        }]
                    ergAm = minimalErgAmount
                }
                return {
                    address: addr,
                    value: ergAm,
                    assets: assets,
                }
            })
            const res = await startHolderAirdrop(outs)
            const curOut = {
                address: res.address,
                value: outs.reduce((a, b) => a + b.value, 0) + txFee,
                assets: []
            }
            if (this.state.withToken)
                curOut.assets = [{
                    tokenId: outs[0].assets[0].tokenId,
                    amount: outs.reduce((a, b) => a + b.assets[0].amount, 0)
                }]
            leaves = leaves.concat([curOut])
        }
        const res = await startHolderAirdrop(leaves)
        const state = {
            loading: false,
            sendAddress: res.address,
            sendModal: true,
            ergAmount: needErg,
        }
        if (this.state.withToken)
            state.finalTokenAmount = leaves.reduce((a, b) => a + b.assets[0].amount, 0)
        this.setState(state)
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
                    amount={longToCurrency(this.state.ergAmount)}
                    tokenId={this.state.distributeToken.tokenId}
                    tokenQuantity={this.state.finalTokenAmount}
                    withToken={this.state.withToken}
                    tokenName={this.state.distributeToken.tokenName}
                    decimals={this.state.distributeToken.decimals}
                />
                {/*<MyAddrAirdrops*/}
                {/*    close={() => {*/}
                {/*        this.setState({myAirdrops: false})*/}
                {/*    }}*/}
                {/*    isOpen={this.state.myAirdrops}*/}
                {/*/>*/}
                {/*<Col md="4" style={{pointerEvents: 'none', opacity: '70%'}}>*/}
                <Col md="4">
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
                                To airdrop among token holders
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
                    size="lg"
                    isOpen={this.state.holderModal}
                >
                    <ModalHeader toggle={() => this.setState({holderModal: !this.state.holderModal})}>
                        <ReactTooltip/>
                        <span className="fsize-1 text-muted">
                        Review and modify the holders if you wish
                    </span>
                    </ModalHeader>
                    <ModalBody>
                        <Row>
                            <BeatLoader
                                css={override}
                                size={8}
                                color={'#0b473e'}
                                loading={this.state.loading}
                            />
                        </Row>
                        <Label check>
                            <Input
                                checked={
                                    this.state.excludeP2s
                                }
                                onChange={(e) => {
                                    let outs = this.state.outs
                                    let total = 0
                                    Object.keys(outs).forEach(addr => {
                                        outs[addr].use = isP2pk(addr) && outs[addr].use
                                        if (outs[addr].use) total += outs[addr].amount
                                    })
                                    this.setState({
                                        outs: outs,
                                        excludeP2s: !this.state.excludeP2s,
                                        totalHoldings: total
                                    })
                                }}
                                className="mr-2"
                                addon
                                type="checkbox"
                                label="Exclude P2S addresses"/>
                            Exclude P2S addresses
                        </Label>
                        <br/>

                        <div className='fixTableHead'>
                            <Table striped className="mb-0 border-0">
                                <thead>
                                <tr>
                                    <th className="border-top-0"> #</th>
                                    <th className="border-top-0"> Include</th>
                                    <th className="border-top-0"> Address</th>
                                    <th className="border-top-0"> Holds</th>
                                    <th className="border-top-0"> Share</th>
                                    <th className="border-top-0"> Receives</th>
                                </tr>
                                </thead>
                                <tbody>
                                {this.state.outs && Object.keys(this.state.outs)
                                    .sort((a, b) => this.state.outs[b].amount - this.state.outs[a].amount)
                                    .map((addr, ind) => {
                                        return <tr style={{opacity: this.state.outs[addr].use ? '100%' : '40%'}}>
                                            <td>{ind + 1}</td>
                                            <td>
                                                <Label check>
                                                    <Input
                                                        checked={
                                                            this.state.outs[addr].use
                                                        }
                                                        onChange={(e) => {
                                                            let outs = this.state.outs
                                                            outs[addr].use = e.target.checked
                                                            let total = this.state.totalHoldings
                                                            if (e.target.checked) total += outs[addr].amount
                                                            else total -= outs[addr].amount
                                                            this.setState({outs: outs, totalHoldings: total})
                                                        }}
                                                        className="mr-2"
                                                        addon
                                                        type="checkbox"
                                                    />
                                                </Label>
                                            </td>
                                            <td>{friendlyAddress(addr, 10)}</td>
                                            <td>
                                                {(this.state.outs[addr].amount / (Math.pow(10, this.state.holdersToken.decimals))).toFixed(this.state.holdersToken.decimals)} {this.state.holdersToken.tokenName}
                                            </td>
                                            <td>
                                                {(((this.state.outs[addr].use ? this.state.outs[addr].amount : 0) / this.state.totalHoldings) * 100).toFixed(3)}%
                                            </td>
                                            {!this.state.withToken && <td>
                                                {longToCurrency(this.getHolderReceivingAmount(addr))} ERG
                                            </td>}
                                            {this.state.withToken && <td>
                                                {longToCurrency(this.getHolderReceivingAmount(addr), this.state.distributeToken.decimals)} {this.state.distributeToken.tokenName}
                                            </td>}
                                        </tr>

                                    })}
                                </tbody>
                            </Table>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            className="ml mr-2 btn-transition"
                            color="secondary"
                            disabled={this.state.loading}
                            onClick={() => this.setState({holderModal: false, loading: false})}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="mr-2 btn-transition"
                            color="secondary"
                            onClick={this.airdrop}
                            disabled={this.state.loading}
                        >
                            Airdrop
                        </Button>
                    </ModalFooter>
                </Modal>
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
                            {this.state.total && this.state.doneBoxes < this.state.total &&
                            <ProgressBar label={`${((this.state.doneBoxes / this.state.total) * 100).toFixed(0)}%`}
                                         now={((this.state.doneBoxes / this.state.total) * 100).toFixed(0)}/>
                            }

                            <fieldset disabled={this.state.loading}>
                                <FormGroup>
                                    <Input
                                        value={this.state.holdersToken.tokenId}
                                        onChange={(event) => {
                                            this.changeToken(event.target.value, 'holdersToken')
                                        }}
                                        style={{fontSize: "12px"}}
                                        type="text"
                                        id="tokenId"
                                        invalid={!this.state.holdersToken}
                                    >
                                    </Input>
                                    <FormFeedback invalid>
                                        Specify the token ID
                                    </FormFeedback>
                                    <FormText>
                                        Will airdrop among this token holders proportionately to the amount they hold
                                    </FormText>
                                </FormGroup>
                                <FormGroup>
                                    <CustomInput
                                        type="checkbox"
                                        id="upload"
                                        onChange={(e) => this.setState({withToken: e.target.checked})}
                                        label="Custom Token"/>
                                </FormGroup>
                                {!this.state.withToken &&
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
                                                currencyToLong(this.state.distErg) < 100000000
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
                                </FormGroup>}
                                {this.state.withToken && <Row>
                                    <Col md='8'>
                                        <FormGroup>
                                            <Input
                                                value={this.state.distributeToken.tokenId}
                                                style={{fontSize: "11px"}}
                                                onChange={(event) => {
                                                    this.changeToken(event.target.value, 'distributeToken')
                                                }}
                                                type="text"
                                                id="tokenId"
                                            />
                                            <FormText>
                                                Token ID of the token you want to distribute
                                            </FormText>
                                        </FormGroup>
                                    </Col>
                                    <Col md='4'>
                                        <Input
                                            value={this.state.tokenQuantity}
                                            style={{fontSize: "11px"}}
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
                                            {!this.state.loading && this.state.tokenQuantity > 0 && this.state.distributeToken && this.state.distributeToken.decimals > 0 &&
                                            <b>
                                                ; {(this.state.tokenQuantity / (Math.pow(10, this.state.distributeToken.decimals))).toFixed(this.state.distributeToken.decimals)} of {this.state.distributeToken.tokenName}
                                            </b>}
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
