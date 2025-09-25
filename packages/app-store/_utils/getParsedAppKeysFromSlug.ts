import getAppKeysFromSlug from "./getAppKeysFromSlug";
import type Zod from "zod";

export async function getParsedAppKeysFromSlug(
  slug: string,
  schema: Zod.Schema
) {
  const appKeys = await getAppKeysFromSlug(slug);
  return schema.parse(appKeys);
}

export default getParsedAppKeysFromSlug;
