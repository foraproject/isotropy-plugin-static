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
  path: string,
  onError?: (req: IncomingMessage, res: ServerResponse, e: any) => void
};

export type StaticSiteConfigType = {
  dir: string
};

export type getDefaultsParamsType = {
  type: string,
  dir?: string,
  path?: string,
  onError?: (req: IncomingMessage, res: ServerResponse, e: any) => void
}

const getDefaults = function(val: getDefaultsParamsType) : StaticSiteType {
  return {
    type: "static",
    dir: val.dir || "static",
    path: val.path || "/static",
    onError: val.onError
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
        server.serve(req, res, function(e) {
          if (!e) {
            resolve();
          } else {
            reject(e);
          }
        });
      }).resume();
    });
  });
};


export default {
  name: "static",
  getDefaults,
  setup
};
