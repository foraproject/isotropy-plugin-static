import __polyfill from "babel-polyfill";
import should from 'should';
import http from "http";
import promisify from "nodefunc-promisify";
import querystring from "querystring";
import Router from "isotropy-router";
import staticModule from "../isotropy-plugin-static";

describe("Isotropy Plugin Static", () => {

  const makeRequest = (host, port, path, method, headers, _postData) => {
    return new Promise((resolve, reject) => {
      const postData = (typeof _postData === "string") ? _postData : querystring.stringify(_postData);
      const options = { host, port, path, method, headers };

      let result = "";
      const req = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(data) { result += data; });
        res.on('end', function() { resolve({ result, res }); });
      });
      req.on('error', function(e) { reject(e); });
      req.write(postData);
      req.end();
    });
  };

  let server, router;

  before(async () => {
    server = http.createServer((req, res) => router.doRouting(req, res));
    const listen = promisify(server.listen.bind(server));
    await listen(0);
  });

  beforeEach(() => {
    router = new Router();
  });

  it(`Should get default configuration values`, () => {
    const config = { type: "static" };
    const completedConfig = staticModule.getDefaults(config);
    completedConfig.type.should.equal("static");
    completedConfig.dir.should.equal("static");
    completedConfig.path.should.equal("/static");
  });


  it(`Should serve a static site`, async () => {
    const isotropyConfig = { dir: __dirname };
    const completedConfig = staticModule.getDefaults({});
    await staticModule.setup(completedConfig, router, isotropyConfig);
    const { result } = await makeRequest("localhost", server.address().port, "/hello.txt", "GET", { 'Content-Type': 'application/x-www-form-urlencoded' }, {});
    result.should.equal("hello, world\n");
  });
});
