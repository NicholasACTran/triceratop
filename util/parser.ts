import { existsSync } from 'https://deno.land/std@0.74.0/fs/mod.ts';
import { SEP } from 'https://deno.land/std@0.74.0/path/mod.ts';
import { SyntaxNode, GenerateSyntaxList } from './syntax.ts';
import { CreateSemanticText } from './semantic.ts';

async function getDirectory() {
  if (existsSync('./triceratop.json')) {
    //TODO: Create this json automatically
    const data = await Deno.readFile('triceratop.json');
    const decoder = new TextDecoder('utf-8');
    return JSON.parse(decoder.decode(data))['feature-directory'];
  } else {
    return './features';
  }
}

export async function Parser (feature_file : string) : Promise<string> {
  const parsed_syntax : Array<SyntaxNode> = await GenerateSyntaxList(feature_file);
  const featureName = feature_file.substring(feature_file.lastIndexOf(SEP) + 1, feature_file.lastIndexOf('.'));
  return Promise.resolve(CreateSemanticText(featureName, parsed_syntax));
}

export async function ParseNodes (feature_name : string) : Promise<Array<SyntaxNode>> {
  const feature_file = `${await getDirectory()+SEP+feature_name}.feature`;
  return Promise.resolve(await GenerateSyntaxList(feature_file));
}
