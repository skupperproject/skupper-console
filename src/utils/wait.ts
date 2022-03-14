export function wait(ms: number, message: string): Promise<string> {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms, message);
  });
}
