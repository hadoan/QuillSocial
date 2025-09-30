"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getInstalledAppPath;
const enums_1 = require("@quillsocial/prisma/enums");
const zod_1 = __importDefault(require("zod"));
const variantSchema = zod_1.default.nativeEnum(enums_1.AppCategories);
function getInstalledAppPath({ variant, slug }, locationSearch = "") {
    if (!variant)
        return `/apps/installed${locationSearch}`;
    const parsedVariant = variantSchema.safeParse(variant);
    if (!parsedVariant.success)
        return `/apps/installed${locationSearch}`;
    if (!slug)
        return `/apps/installed/${variant}${locationSearch}`;
    return `/apps/installed/${variant}?hl=${slug}${locationSearch && locationSearch.slice(1)}`;
}
