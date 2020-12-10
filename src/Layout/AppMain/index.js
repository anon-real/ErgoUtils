import { Redirect, Route } from 'react-router-dom';
import React, { Fragment, Suspense } from 'react';
import AuctionHistory from '../../UtilPage/AuctionHistory';
import ActiveAuction from '../../UtilPage/GeneralUtils';

import { ToastContainer } from 'react-toastify';
import Homepage from "../../Home";
import FaqPage from "../../Faq";

const AppMain = () => {
    return (
        <Fragment>
            {/* GeneralUtils */}
            <Suspense
                fallback={
                    <div className="loader-container">
                        <div className="loader-container-inner">
                            <h6 className="mt-5">
                                Please wait while we load all the Components
                                examples
                            </h6>
                        </div>
                    </div>
                }
            >
                <Route path="/general" component={ActiveAuction} />
            </Suspense>

            {/* AuctionHistory */}
            <Suspense
                fallback={
                    <div className="loader-container">
                        <div className="loader-container-inner">
                            <h6 className="mt-5">
                                Please wait while we load all the Components
                                examples
                            </h6>
                        </div>
                    </div>
                }
            >
                <Route path="/auction/history" component={AuctionHistory} />
            </Suspense>

            {/* Homepage */}
            <Suspense
                fallback={
                    <div className="loader-container">
                        <div className="loader-container-inner">
                            <h6 className="mt-5">
                                Please wait while we load all the Components
                                examples
                            </h6>
                        </div>
                    </div>
                }
            >
                <Route path="/faq" component={FaqPage} />
            </Suspense>

            <Route
                exact
                path="/"
                render={() => <Redirect to="/general" />}
            />
            <ToastContainer />
        </Fragment>
    );
};

export default AppMain;
