export async function Parser (feature_file : string) : Promise<string> {
  //Todo: Implement parsing logic
  const text = await Deno.readTextFile(feature_file);
  return Promise.resolve(text);
}
