import { access, constants } from "fs/promises";

export async function checkFileExists(filePath: string) {
  try {
    await access(filePath, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}
