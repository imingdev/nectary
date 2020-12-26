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

    this.srcDir = this.root(nectary.options.dir.src);
    this.pageDir = this.src(nectary.options.dir.page);
    this.globPageDir = this.src(nectary.options.dir.page, nectary.options.pattern);

    this.buildDir = this.root(nectary.options.dir.build);
    this.buildManifest = this.build(nectary.options.build.dir.manifest);
    this.buildStaticDir = this.build(nectary.options.build.dir.static);
    this.buildServerDir = this.build(nectary.options.build.dir.server);
  }

  root(..._p) {
    const {options} = this;

    return path.join.apply(path, [options.dir.root].concat(_p));
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
