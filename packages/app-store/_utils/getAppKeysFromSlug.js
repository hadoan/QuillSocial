"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("@quillsocial/prisma"));
async function getAppKeysFromSlug(slug) {
    const app = await prisma_1.default.app.findUnique({ where: { slug } });
    return (app?.keys || {});
}
exports.default = getAppKeysFromSlug;
