class SyntaxNode {
  type: String;
  text: String;

  constructor(type: string, text: string) {
    this.type = type;
    this.text = text;
  }
}

const ParseFeatureNode =
  (tokens: Array<string>, nodes: Array<SyntaxNode>) : Array<SyntaxNode> => {
    if (tokens[0] === 'Feature:') {
      nodes.push(new SyntaxNode('Feature', ''));
    } else {
      throw 'Feature file must start with "Feature:"';
    }
    return nodes;
  }

const GenerateSyntaxList = (text: string): Array<SyntaxNode> => {
  const tokens = text.split(' ');
  console.log(tokens);
  const nodes : Array<SyntaxNode>  = [];

  ParseFeatureNode(tokens, nodes);
  return nodes;
}

export async function Parser (feature_file : string) : Promise<string> {
  //Todo: Implement parsing logic
  const text = await Deno.readTextFile(feature_file);
  const parsed_syntax = GenerateSyntaxList(text);
  return Promise.resolve(text);
}
