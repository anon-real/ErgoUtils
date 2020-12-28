import React, {Component, Fragment} from 'react';
import {withRouter} from 'react-router-dom';

import MetisMenu from 'react-metismenu';

import {AirdropNav, DonationNav, TokenomicNav} from './NavItems';


class Nav extends Component {

    constructor() {
        super();
        this.state = {}
    }

    render() {
        return (
            <Fragment>
                <div className="divider text-muted opacity-2" />
                <MetisMenu content={TokenomicNav} activeLinkFromLocation className="vertical-nav-menu" iconNamePrefix="" classNameStateIcon="pe-7s-angle-down"/>
                <MetisMenu content={AirdropNav} activeLinkFromLocation className="vertical-nav-menu" iconNamePrefix="" classNameStateIcon="pe-7s-angle-down"/>
                <div className="divider text-muted opacity-2" />

                <MetisMenu content={DonationNav} activeLinkFromLocation className="vertical-nav-menu" iconNamePrefix="" classNameStateIcon="pe-7s-angle-down"/>
            </Fragment>
        );
    }

    isPathActive(path) {
        return this.props.location.pathname.startsWith(path);
    }
}

export default withRouter(Nav);