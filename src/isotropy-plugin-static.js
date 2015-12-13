/* @flow */
import type KoaAppType from "koa";

import fs from "fs";
import path from "path";
import promisify from "nodefunc-promisify";
import staticHandler from "isotropy-static";

const stat = promisify(fs.stat.bind(fs));

export type StaticSiteType = {
    dir: string,
    type: string,
    path: string
};

export type StaticSiteConfigType = {
    dir: string
};

const getDefaultValues = function(val: Object = {}) : StaticSiteType {
    return {
        type: "static",
        dir: val.dir || "static",
        path: val.path || "/static"
    };
};


const setup = async function(app: StaticSiteType, server: KoaAppType, config: StaticSiteConfigType) : Promise {
    const rootDir = path.join(config.dir, app.dir);
    try {
        const stats = await stat(rootDir);
    } catch (ex) {
        throw ex;
    }
    server.use(staticHandler(rootDir));
};


export default {
    getDefaultValues,
    setup
};