import {Redirect, Route} from 'react-router-dom';
import React, {Fragment, Suspense} from 'react';
import TokenomicPage from '../../UtilPage/TokenUtils';

import {ToastContainer} from 'react-toastify';
import AirdropPage from "../../UtilPage/AirdropUtils";
import DonationPage from "../../UtilPage/DonationUtils";

const AppMain = () => {
    return (
        <Fragment>
            {/* TokenUtils */}
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
                <Route path="/token" component={TokenomicPage} />
            </Suspense>

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
                <Route path="/airdrop" component={AirdropPage} />
            </Suspense>

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
                <Route
                    path="/donation"
                    component={DonationPage}
                />
            </Suspense>

            <Route
                exact
                path="/"
                render={() => <Redirect to="/token" />}
            />
            <ToastContainer />
        </Fragment>
    );
};

export default AppMain;
