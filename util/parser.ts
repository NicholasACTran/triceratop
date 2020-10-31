import { SEP } from 'https://deno.land/std@0.74.0/path/mod.ts';
import { SyntaxNode, GenerateSyntaxList } from './syntax.ts';
import { CreateSemanticText } from './semantic.ts';

export async function Parser (feature_file : string) : Promise<string> {
  const parsed_syntax : Array<SyntaxNode> = await GenerateSyntaxList(feature_file);
  const featureName = feature_file.substring(feature_file.lastIndexOf(SEP) + 1, feature_file.lastIndexOf('.'));
  return Promise.resolve(CreateSemanticText(featureName, parsed_syntax));
}
