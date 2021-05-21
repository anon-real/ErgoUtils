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
import {unspentBoxesFor} from "./utils/explorer";

const store = configureStore();
const rootElement = document.getElementById('root');

const renderApp = (Component) => {
    let x = [
  {
    "secret":"4aee4fa972e791c02e5811cc9065f92eb4e141cdb6d8c7ca2189f67f6fdfb407",
    "numLvls":5,
    "toAddr":"9gsePpxBLhtvud2RuqrCQ9N8dGNZu1af4FVJ7BdGGffuD41AxHR",
    "depositAddr":"9hgdVmZRwUCKzBDb4vHFc8R7MdQGrJWdFkyx9Ffz7YL3VR1vcqJ",
    "name": "yoroi1"
  },
  {
    "secret":"87f649a06363887e9a24adbac3e3d7a2d5e8bd0b99624fab3f7334db38be5559",
    "numLvls":3,
    "toAddr":"9eiiXzUHQ18mfjY7exNiXKxvp9FAAWMhNN6jKKBF4P2ABxbpj2j",
    "depositAddr":"9fYSLo6NibUcz8C92fkmNvXRXzfvSG7EfvBrE5imoFWGvxDtWrZ",
    "name": "deadit-yoroi"
  }
]
    console.log(JSON.stringify(x))
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
