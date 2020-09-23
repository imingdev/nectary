import React from 'react';
import ReactDom from 'react-dom';

export default (Component, App, globalId) => {
  // eslint-disable-next-line
  const state = window.__INITIAL_STATE__;
  const mainEl = document.getElementById(globalId);
  const AppComponent = <App Component={Component} pageProps={state}/>;

  if (state) {
    ReactDom.hydrate(AppComponent, mainEl);
  } else {
    ReactDom.render(AppComponent, mainEl);
  }
};
