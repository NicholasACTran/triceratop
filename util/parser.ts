import { SyntaxNode, GenerateSyntaxList } from './syntax.ts';
import { CreateSemanticText } from './semantic.ts';

export async function Parser (feature_file : string) : Promise<string> {
  const parsed_syntax : Array<SyntaxNode> = await GenerateSyntaxList(feature_file);
  console.log(parsed_syntax);
  return Promise.resolve(CreateSemanticText(parsed_syntax));
}
