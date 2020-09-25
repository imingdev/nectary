const connect = require('connect');
const connectRoute = require('connect-route');

class Server {
  constructor(nectary) {
    this.nectary = nectary;
    this.options = nectary.options;
    const app = connect();
    this.app = app;
    this.render = app;
    nectary.hook('builder:useMiddleware', (middleware) => {
      if (middleware) app.use(middleware);
    });
    nectary.hook('builder:entryList', (entryList = []) => {
      if (entryList.length) this.setEntryToRouter(entryList);
    });
  }

  setEntryToRouter(entryList) {
    const isEmptyObject = obj => !!Object.keys(obj).length;
    const isFunction = fn => Object.prototype.toString.call(fn) === '[object Function]';

    entryList.forEach(entry => {
      const {url, appServerSideProps, Component, getServerSideProps, pageScripts, pageStyles, renderToString} = entry;
      this.app.use(connectRoute(router => {
        router.get(url, async (req, res) => {
          let appStore = {};
          let pageStore = {};
          if (isFunction(appServerSideProps)) appStore = await appServerSideProps({req, res});
          if (isFunction(getServerSideProps)) pageStore = await getServerSideProps({req, res});
          const store = {...appStore || {}, ...pageStore || {}};
          const content = await renderToString({
            Component,
            store: isEmptyObject(store) ? null : store,
            pageScripts,
            pageStyles
          });
          res.send(content);
        })
      }))
    })
  }
}

module.exports = Server;
