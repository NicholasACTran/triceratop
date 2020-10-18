import { SyntaxNode, GenerateSyntaxList } from './syntax.ts';

export async function Parser (feature_file : string) : Promise<string> {
  // TODO: Implement parsing logic
  // TODO: Figure out parsing error when using an incorrect Key term
  const text = await Deno.readTextFile(feature_file);
  const parsed_syntax = GenerateSyntaxList(text);
  return Promise.resolve(text);
}
