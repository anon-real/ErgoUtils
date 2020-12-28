import React from 'react';
import {Button, FormFeedback, FormGroup, FormText, Input, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';
import TagsInput from 'react-tagsinput'

import 'react-tagsinput/react-tagsinput.css'
import {getForKey, isAddressValid, setForKey, showMsg} from "../../../utils/helpers";

const KeyCodes = {
    comma: 188,
    enter: 13,
};

export default class AddrList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tags: [],
            name: ''
        }
        this.handleChange = this.handleChange.bind(this)
        this.saveList = this.saveList.bind(this)
        this.close = this.close.bind(this)
    }

    handleChange(tags) {
        if (tags.length > 0 && !isAddressValid(tags[tags.length - 1])) showMsg('Invalid address', false, true)
        else this.setState({tags})
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({
            tags: nextProps.addresses,
            name: nextProps.name
        })
    }

    close() {
        this.props.close()
        this.setState({
            tags: [],
            name: ''
        })
    }

    saveList() {
        let lst = getForKey('addrList')
        lst = lst.filter(item => item.name !== this.props.name && item.name !== this.state.name)
        lst = lst.concat([{
            name: this.state.name,
            addresses: this.state.tags
        }])
        setForKey(lst, 'addrList')
        showMsg('Address list saved successfully')
        this.close()
    }

    render() {

        return (
            <Modal
                isOpen={this.props.isOpen}
                toggle={this.close}
                className={this.props.className}
            >
                <ModalHeader toggle={this.close}>
                    <span className="fsize-1 text-muted">
                        You can view, remove or add addresses in the list
                    </span>
                </ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <Input
                            value={this.state.name}
                            type="text"
                            name="name"
                            id="name"
                            invalid={!this.state.name}
                            onChange={(event) =>
                                this.setState({
                                    name: event.target.value,
                                })
                            }
                            placeholder="List Name"
                        />
                        <FormFeedback invalid>
                            List name can not be empty.
                        </FormFeedback>
                        <FormText>
                            You can later identify this list with this name, e.g. Ecosystem Contributors
                        </FormText>
                    </FormGroup>

                    <TagsInput
                        value={this.state.tags}
                        addOnPaste={true}
                        inputProps={
                            {
                                className: 'my-tagsinput-input',
                                placeholder: 'Paste Address Here'
                            }
                        }
                        onChange={this.handleChange}/>
                </ModalBody>
                <ModalFooter>
                    <Button
                        className="ml mr-2 btn-transition"
                        color="secondary"
                        onClick={this.close}
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={!this.state.name || this.state.tags.length === 0}
                        className="btn-transition"
                        color="secondary"
                        onClick={this.saveList}
                    >
                        Save List
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }
}
