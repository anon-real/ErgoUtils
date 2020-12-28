import React, {Fragment} from "react";
import {Route} from "react-router-dom";


import AppHeader from "../../Layout/AppHeader/";
import AppSidebar from "../../Layout/AppSidebar/";
import AppFooter from "../../Layout/AppFooter/";
import DonationModal from "./donationModal";

const DonationPage = ({ match }) => (
  <Fragment>
    <AppHeader />
    <div className="app-main">
      <AppSidebar />
      <div className="app-main__outer">
        <div className="app-main__inner">
          <Route path={`${match.url}`} component={DonationModal} />
        </div>
        <AppFooter />
      </div>
    </div>
  </Fragment>
);

export default DonationPage;