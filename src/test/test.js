import __polyfill from "babel-polyfill";
import should from 'should';
import http from "http";
import koa from "koa";
import querystring from "querystring";
import staticModule from "../isotropy-plugin-static";

describe("Isotropy Plugin Static", () => {

    let defaultInstance: KoaAppType;

    const makeRequest = (host, port, path, method, headers, _postData, cb, onErrorCb) => {
        const postData = (typeof _postData === "string") ? _postData : querystring.stringify(_postData);
        const options = { host, port, path, method, headers };

        let result = "";
        const req = http.request(options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function(data) { result += data; });
            res.on('end', function() { cb(result); });
        });
        req.on('error', function(e) { onErrorCb(e); });
        req.write(postData);
        req.end();
    };


    before(function() {
        defaultInstance = new koa();
        defaultInstance.listen(8080);
    });


    it(`Should get default configuration values`, () => {
        const config = {};
        const completedConfig = staticModule.getDefaultValues(config);
        completedConfig.type.should.equal("static");
        completedConfig.dir.should.equal("static");
        completedConfig.path.should.equal("/static");
    });


    it(`Should serve a static site`, () => {
        const isotropyConfig = { dir: __dirname };
        const completedConfig = staticModule.getDefaultValues({});
        const promise = new Promise((resolve, reject) => {
            staticModule.setup(completedConfig, defaultInstance, isotropyConfig).then(() => {
                makeRequest("localhost", 8080, "/hello.txt", "GET", { 'Content-Type': 'application/x-www-form-urlencoded' }, {}, resolve, reject);
            }, reject);
        });

        return promise.then((data) => {
            data.should.equal("hello, world\n");
        });
    });
});
