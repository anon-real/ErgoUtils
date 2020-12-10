import React, {Fragment} from 'react';
import cx from 'classnames';
import TitleComponent2 from '../../../Layout/AppMain/PageTitleExamples/Variation2';
import Col from "react-bootstrap/lib/Col";
import ResponsiveContainer from "recharts/lib/component/ResponsiveContainer";
import AreaChart from "recharts/lib/chart/AreaChart";
import Area from "recharts/lib/cartesian/Area";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    Button,
    FormFeedback,
    FormText,
    Input,
    InputGroupAddon,
    InputGroupText,
    Modal,
    ModalBody,
    ModalHeader
} from "reactstrap";
import Row from "react-bootstrap/lib/Row";
import SyncLoader from "react-spinners/SyncLoader";
import ReactTooltip from "react-tooltip";
import FormGroup from "react-bootstrap/lib/FormGroup";
import InputGroup from "react-bootstrap/lib/InputGroup";
// import Input from "reactstrap/src/Input";
// import FormFeedback from "reactstrap/src/FormFeedback";
// import FormText from "reactstrap/src/FormText";

export default class NewToken extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            modalLoading: false
        };
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    render() {
        return (
            <Fragment>
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
                                        // onClick={() => this.openMyBids()}
                                        outline
                                        className="btn-outline-light m-2 border-0"
                                        color="primary"
                                    >
                                        <i className="nav-link-icon lnr-layers"> </i>
                                        <span>My Tokens</span>
                                    </Button>
                                    <Button
                                        onClick={() => this.setState({isOpen: true})}
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
                    toggle={() => this.setState({isOpen: !this.state.isOpen})}
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
                                <SyncLoader
                                    // css={override}
                                    size={8}
                                    color={'#0b473e'}
                                    loading={this.state.modalLoading}
                                />
                            </Row>

                            <FormGroup>
                                <InputGroup>
                                    <Input
                                        type="number"
                                        value={this.state.tokenAmount}
                                        invalid={this.state.tokenAmount <= 0}
                                        onChange={(e) => {
                                            this.setState({tokenAmount: e.target.value})
                                        }}
                                        id="tokenAmount"
                                    />
                                    {/*<InputGroupAddon addonType="append">*/}
                                    {/*    <InputGroupText>ERG</InputGroupText>*/}
                                    {/*</InputGroupAddon>*/}
                                    <FormFeedback invalid>
                                        token amount must be a positive amount
                                    </FormFeedback>
                                </InputGroup>
                                <FormText>Token quantity to be issued</FormText>
                            </FormGroup>
                        </div>
                    </ModalBody>
                </Modal>
            </Fragment>
        );
    }
}
