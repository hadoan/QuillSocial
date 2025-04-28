import { LRUCache } from "lru-cache";


export { default as add } from "./add";
export { default as callback } from "./callback";
export { default as post } from "./post";
export const CACHE = new LRUCache<string, any>({ max: 1000 });
