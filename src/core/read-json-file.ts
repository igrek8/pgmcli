import { readFile } from "fs/promises";

export async function readJSONFile(filePath: string) {
  return JSON.parse(await readFile(filePath, { encoding: "utf-8" }));
}
