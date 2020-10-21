import { SyntaxNode, GenerateSyntaxList } from './syntax.ts';
import { CreateSemanticText } from './semantic.ts';

export async function Parser (feature_file : string) : Promise<string> {
  // TODO: Implement parsing logic
  // TODO: Figure out parsing error when using an incorrect Key term
  const text = await Deno.readTextFile(feature_file);
  const parsed_syntax : Array<SyntaxNode> = GenerateSyntaxList(text);
  return Promise.resolve(CreateSemanticText(parsed_syntax));
}
