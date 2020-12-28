import React, {Fragment} from "react";
import {Route} from "react-router-dom";

import Tokenomic from "./General";

import AppHeader from "../../Layout/AppHeader/";
import AppSidebar from "../../Layout/AppSidebar/";
import AppFooter from "../../Layout/AppFooter/";

const TokenomicPage = ({ match }) => (
  <Fragment>
    <AppHeader />
    <div className="app-main">
      <AppSidebar />
      <div className="app-main__outer">
        <div className="app-main__inner">
          <Route path={`${match.url}`} component={Tokenomic} />
        </div>
        <AppFooter />
      </div>
    </div>
  </Fragment>
);

export default TokenomicPage;
