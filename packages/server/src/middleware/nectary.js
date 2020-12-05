import generateETag from 'etag';
import fresh from 'fresh';
import {pathToRegexp} from 'path-to-regexp';

// clean up un-necessary escaping from regex.source which turns / into \\/
const normalizeRouteRegex = (regex) => regex.replace(/\\\//g, '/');

// get resources key
const getResourcesName = (res, url) => Object.keys(res)
  .filter(name => name !== '_error')
  .find(name => {
    const _name = name
      .replace(new RegExp('/index$'), '')
      .replace(/^index$/, '')
      .replace(/_/g, ':');
    const routeRegex = pathToRegexp(`/${_name}`, [], {
      strict: true,
      sensitive: false,
      delimiter: '/', // default is `/#?`, not pass query info
    });
    const regStr = normalizeRouteRegex(routeRegex.source);
    return (new RegExp(regStr)).test(url);
  });

export default ({serverContext, render}) => async (req, res, next) => {
  const {options} = serverContext;
  const {etag} = options.server || {};

  const resources = serverContext.resources;
  let view = getResourcesName(resources, req.url);
  if (!view) view = '_error';

  const {scripts, styles} = resources[view];
  const html = await render({view, scripts, styles, req, res});

  // Add ETag header
  if (etag) {
    const {hash} = etag;
    const etagVal = hash ? hash(html, etag) : generateETag(html, etag);
    if (fresh(req.headers, {etag: etagVal})) {
      res.statusCode = 304;
      res.end();
      return next();
    }
    res.setHeader('ETag', etagVal);
  }

  // status
  res.statusCode = view === '_error' ? 404 : 200;
  // Send response
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Accept-Ranges', 'none');
  res.setHeader('Content-Length', Buffer.byteLength(html));

  res.end(html, 'utf8');

  next();
}
