import React from 'react';
import ReactDOM from 'react-dom';
// import registerServiceWorker from './registerServiceWorker';
import {unregister} from './registerServiceWorker';

import {HashRouter} from 'react-router-dom';
import './assets/base.css';
import Main from './UtilPage/Main';
import configureStore from './config/configureStore';
import {Provider} from 'react-redux';
import {
    auctionNFT,
    dataInputAddress,
    additionalData,
    handlePendingBids,
    unspentBoxesFor, currentHeight,
} from './utils/explorer';
import {showMsg} from './utils/helpers';
import {bidFollower, reqFollower} from "./utils/assembler";

const store = configureStore();
const rootElement = document.getElementById('root');

const renderApp = (Component) => {
    setInterval(() => {
        reqFollower();
    }, 20000);

    ReactDOM.render(
        <Provider store={store}>
            <HashRouter>
                <Component/>
            </HashRouter>
        </Provider>,
        rootElement
    );
};

renderApp(Main);

if (module.hot) {
    module.hot.accept('./UtilPage/Main', () => {
        const NextApp = require('./UtilPage/Main').default;
        renderApp(NextApp);
    });
}
unregister();

// registerServiceWorker();
