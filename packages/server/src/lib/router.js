import {pathToRegexp, match} from 'path-to-regexp';
import fresh from 'fresh';
import Renderer from './renderer';

const isFresh = (req, res) => fresh(req.headers, {
  'etag': res.getHeader('ETag'),
  'last-modified': res.getHeader('Last-Modified')
})

export default class Router {
  constructor(nectary) {
    this.options = nectary.options;

    // all route eg===>[{view: about/_id/index, url: about/:id, urlReg: /xxx/ scripts: [], styles: []}]
    this.routes = [];
    this.render = (new Renderer(nectary)).render;

    this.set = this.set.bind(this);
    this.middleware = this.middleware.bind(this);
  }

  // format url
  formatUrl(name) {
    const _name = name
      .replace(new RegExp('/index$'), '')
      .replace(/^index$/, '')
      .replace(/_/g, ':');

    return `/${_name}`;
  }

  // set
  set(resources) {
    const {formatUrl} = this;
    const errorName = '_error';
    const sortNames = Object.keys(resources).sort((a, b) => a.indexOf(errorName) - b.indexOf(errorName));

    this.routes = sortNames.map(name => {
      const _name = formatUrl(name);
      const isError = name === errorName;
      const url = isError ? /^(.*)$/i : _name;
      const {scripts, styles} = resources[name] || {};

      return {
        view: name,
        url: isError ? '*' : url,
        urlReg: pathToRegexp(url, [], {
          end: true,
          sensitive: false,
          delimiter: '/', // default is `/#?`, not pass query info
        }),
        scripts: scripts || [],
        styles: styles || []
      };
    });
  }

  // middleware
  async middleware(req, res, next) {
    try {
      const {routes, render} = this;
      const reqUrl = req.url;

      const {view, url, scripts, styles} = routes.find(({urlReg}) => urlReg.test(reqUrl));
      const urlMatch = match(url, {decode: decodeURIComponent})(reqUrl) || {};
      req.params = {
        ...req.params || {},
        ...urlMatch.params || {}
      };

      const html = await render({view, scripts, styles, req, res});

      if (isFresh(req, res)) {
        // client has a fresh copy of resource
        res.statusCode = 304;
        res.end();
        return;
      }

      // Send response
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Accept-Ranges', 'none');
      res.setHeader('Content-Length', Buffer.byteLength(html));

      res.end(html, 'utf8');

      next();
    } catch (err) {
      if (err.name === 'URIError') {
        err.statusCode = 400
      }
      next(err);
    }
  }
}
