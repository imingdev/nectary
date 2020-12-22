import path from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {Helmet} from 'react-helmet';

export default class Renderer {
  constructor(nectary) {
    this.nectary = nectary;
    this.options = nectary.options;

    this.render = this.render.bind(this);
    this.requireReactElement = this.requireReactElement.bind(this);
    this.createReactElement = this.createReactElement.bind(this);
    this.renderReactToString = this.renderReactToString.bind(this);
    this.renderReactToStaticMarkup = this.renderReactToStaticMarkup.bind(this);
  }

  async render({view, scripts, styles, req, res}) {
    const {options, requireReactElement, renderReactToString, renderReactToStaticMarkup} = this;

    const {Component: Document} = requireReactElement('_document');
    const {Component: App, getServerSideProps: getAppServerSideProps} = requireReactElement('_app');
    const {Component, getServerSideProps} = requireReactElement(view);

    let state;
    if (getAppServerSideProps && typeof getAppServerSideProps === 'function') {
      state = await getAppServerSideProps({req, res});
    }
    if (getServerSideProps && typeof getServerSideProps === 'function') {
      const pageState = await getServerSideProps({req, res});
      if (state || pageState) {
        state = {...state || {}, ...pageState || {}};
      } else {
        state = pageState;
      }
    }

    // body
    const body = renderReactToString(App, {
      pageProps: state,
      Component
    });
    console.log('body', body)
    // helmet
    const helmet = Helmet.renderStatic();

    // document(body, pageScripts, pageStyles, state, helmet, context, id)
    const content = renderReactToStaticMarkup(Document, {
      body,
      pageScripts: scripts,
      pageStyles: styles,
      state,
      helmet,
      context: options.globals.context,
      id: options.globals.id
    });

    console.log('content', content)

    return `<!doctype html>${content}`
  }

  requireReactElement(viewName) {
    const {default: Component, getServerSideProps} = this.nectary.require.buildServer(`${viewName}.js`);

    return {
      Component,
      getServerSideProps
    };
  }

  createReactElement(Component, locals) {
    return React.createElement(Component, locals);
  }

  renderReactToString(Component, locals) {
    const {createReactElement} = this;

    return ReactDOMServer.renderToString(createReactElement(Component, locals));
  }

  renderReactToStaticMarkup(Component, locals) {
    const {createReactElement} = this;

    return ReactDOMServer.renderToStaticMarkup(createReactElement(Component, locals));
  }
}
