/* @flow */

import fs from "fs";
import path from "path";
import Router from "isotropy-router";
import nodeStatic from "node-static";
import promisify from "nodefunc-promisify";

import type { IncomingMessage, ServerResponse } from "./flow/http";

const stat = promisify(fs.stat.bind(fs));

export type StaticSiteType = {
  dir: string,
  type: string,
  path: string
};

export type StaticSiteConfigType = {
  dir: string
};

export type getDefaultsParamsType = {
  type: string,
  dir?: string,
  path?: string
}

const getDefaults = function(val: getDefaultsParamsType) : StaticSiteType {
  return {
    type: "static",
    dir: val.dir || "static",
    path: val.path || "/static"
  };
};


const setup = async function(app: StaticSiteType, router: Router, config: StaticSiteConfigType) : Promise {
  const rootDir = path.join(config.dir, app.dir);

  try {
    const stats = await stat(rootDir);
  } catch (ex) {
    throw ex;
  }

  const server = new nodeStatic.Server(rootDir);

  router.when(() => true, (req, res) => {
    return new Promise(function(resolve, reject) {
      req.addListener('end', () => {
        server.serve(req, res, () => resolve());
      }).resume();
    });
  });
};


export default {
  getDefaults,
  setup
};
