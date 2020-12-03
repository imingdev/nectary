import React from 'react';
import ReactDom from 'react-dom';

import App from '<%=appPath%>';
import Component from '<%=componentPath%>';

const state = window['<%=context%>'];
const mainEl = document.getElementById('<%=id%>');
const AppComponent = <App Component={Component} pageProps={state}/>;

ReactDom.hydrate(AppComponent, mainEl);

if (module.hot) module.hot.accept();
