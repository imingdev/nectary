import path from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {Helmet} from 'react-helmet';

export default class Renderer {
  constructor(nectary) {
    this.nectary = nectary;
    this.options = nectary.options;

    this.render = this.render.bind(this);
    this.loadServerViewPath = this.loadServerViewPath.bind(this);
    this.requireServerViewPath = this.requireServerViewPath.bind(this);
    this.requireReactElement = this.requireReactElement.bind(this);
    this.createReactElement = this.createReactElement.bind(this);
    this.renderReactToString = this.renderReactToString.bind(this);
    this.renderReactToStaticMarkup = this.renderReactToStaticMarkup.bind(this);
  }

  async render({view, scripts, styles, req, res}) {
    const {options, requireServerViewPath, renderReactToString, renderReactToStaticMarkup} = this;
    const {Component: Document} = requireServerViewPath('_document');
    const {Component: App, getServerSideProps: getAppServerSideProps} = requireServerViewPath('_app');
    const {Component, getServerSideProps} = requireServerViewPath(view);

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

    return `<!doctype html>${content}`
  }

  loadServerViewPath(p) {
    const {rootDir = process.cwd(), buildDir, build} = this.options;
    return path.join(rootDir, buildDir, build.dir.server, `${p}.js`);
  }

  requireServerViewPath(p) {
    return this.requireReactElement(this.loadServerViewPath(p));
  }

  requireReactElement(filePath) {
    const {dev} = this.options;
    if (dev) delete require.cache[filePath];

    const {default: Component, getServerSideProps} = require(filePath);
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
