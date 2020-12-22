import path from 'path';

export default class Resolve {
  constructor(nectary) {
    this.nectary = nectary;
    this.options = nectary.options;

    this.root = this.root.bind(this);
    this.src = this.src.bind(this);
    this.page = this.page.bind(this);
    this.build = this.build.bind(this);
    this.buildServer = this.buildServer.bind(this);
  }

  root(_p) {
    const _paths = Array.isArray(_p) ? _p : [_p];
    const args = [this.options.dir.root].concat(_paths).filter(Boolean);
    return path.join.apply(path, args);
  }

  src(p) {
    const {root, options} = this;

    return root(options.dir.src, p);
  }

  page(p) {
    const {src, options} = this;

    return src(options.dir.page, p);
  }

  build(p) {
    const {root, options} = this;
    return root(options.dir.build, p);
  }

  buildServer(p) {
    const {build, options} = this;

    return build(options.build.dir.server, p);
  }
}
