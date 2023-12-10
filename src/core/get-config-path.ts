export function getConfigPath(argv: string[]): string | undefined {
  try {
    for (let i = 0; i < argv.length; ++i) {
      const arg = argv[i];
      if (arg === "--config") {
        return argv.at(i + 1);
      }
    }
  } catch {
    return undefined;
  }
}
