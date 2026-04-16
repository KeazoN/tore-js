declare module "picomatch" {
  const picomatch: {
    isMatch: (
      input: string,
      pattern: string | string[],
      options?: { dot?: boolean },
    ) => boolean;
  };
  export default picomatch;
}
