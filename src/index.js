import React from 'react';
import ReactDOM from 'react-dom';
// import registerServiceWorker from './registerServiceWorker';
import {unregister} from './registerServiceWorker';

import {HashRouter} from 'react-router-dom';
import './assets/base.css';
import Main from './UtilPage/Main';
import configureStore from './config/configureStore';
import {Provider} from 'react-redux';
import {reqFollower} from "./utils/assembler";
import {getInt64Bytes} from "./utils/helpers";

const store = configureStore();
const rootElement = document.getElementById('root');

const renderApp = (Component) => {
    setInterval(() => {
        reqFollower();
    }, 20000);

    import('./utils/mixerHop').then(res => {
        res.handleEntries()
    })

    function handleEnt() {
        import('./utils/mixerHop').then(res => {
            res.handleEntries().then(_ => {
                setTimeout(handleEnt, 20000)
            })
        })
    }

    setTimeout(handleEnt, 0)

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
