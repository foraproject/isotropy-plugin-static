import { KoaMiddlewareType } from "koa";

type SendOptionsType = { index?: bool | string, root?: string, defer?: bool };

declare module "isotropy-static" {
    declare function exports (root: string, opts?: SendOptionsType) : KoaMiddlewareType;
}
