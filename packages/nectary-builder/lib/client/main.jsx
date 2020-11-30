import React from 'react';
import ReactDom from 'react-dom';

export default (App, Component, context, id) => {
  const state = window[context];
  const mainEl = document.getElementById(id);
  const AppComponent = <App Component={Component} pageProps={state}/>;

  ReactDom.hydrate(AppComponent, mainEl);
};
