"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParsedAppKeysFromSlug = getParsedAppKeysFromSlug;
const getAppKeysFromSlug_1 = __importDefault(require("./getAppKeysFromSlug"));
async function getParsedAppKeysFromSlug(slug, schema) {
    const appKeys = await (0, getAppKeysFromSlug_1.default)(slug);
    return schema.parse(appKeys);
}
exports.default = getParsedAppKeysFromSlug;
