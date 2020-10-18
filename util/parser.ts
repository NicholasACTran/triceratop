const FEATURE : string = 'Feature';
const SCENARIO : string = 'Scenario';
const GIVEN : string = 'Given';
const WHEN : string = 'When';
const THEN : string = 'Then';

class SyntaxNode {
  type: String;
  text: String;

  constructor(type: string, text: string) {
    this.type = type;
    this.text = text;
  }
}

const ParseThenNode =
  (tokens: Array<string>, nodes: Array<SyntaxNode>) => {
    nodes.push(new SyntaxNode(THEN, ''));
    tokens.shift();
    if (tokens.length === 0 || tokens[0] === '') {
      return;
    }
    else if (tokens[0] === THEN) {
      ParseThenNode(tokens, nodes);
    } else if (tokens[0] === SCENARIO) {
      ParseScenarioNode(tokens, nodes);
    } else {
      throw 'Expected "Then", "Scenario", or EOF after "Then"';
    }
  }

const ParseWhenNode =
  (tokens: Array<string>, nodes: Array<SyntaxNode>) => {
    nodes.push(new SyntaxNode(WHEN, ''));
    tokens.shift();
    if (tokens[0] === WHEN) {
      ParseWhenNode(tokens, nodes);
    } else if (tokens[0] === THEN) {
      ParseThenNode(tokens, nodes);
    } else {
      throw 'Expected "When" or "Then" after "When"';
    }
  }

const ParseGivenNode =
  (tokens: Array<string>, nodes: Array<SyntaxNode>) => {
    nodes.push(new SyntaxNode(GIVEN, ''));
    tokens.shift();
    if (tokens[0] === GIVEN) {
      ParseGivenNode(tokens, nodes);
    } else if (tokens[0] === WHEN) {
      ParseWhenNode(tokens, nodes);
    } else {
      throw 'Expected "Given" or "When" after "Given"';
    }
  }

const ParseScenarioNode =
  (tokens: Array<string>, nodes: Array<SyntaxNode>) => {
    if (tokens[0] === SCENARIO) {
      nodes.push(new SyntaxNode(SCENARIO, ''));
      tokens.shift();
      if (tokens[0] === GIVEN) {
        ParseGivenNode(tokens, nodes);
      } else if (tokens[0] === WHEN) {
        ParseWhenNode(tokens, nodes);
      } else {
        throw 'Expected "Given" or "When" after "Scenario"';
      }
    } else {
      throw 'Expected "Scenario" after "Feature"';
    }
  };

const ParseFeatureNode =
  (tokens: Array<string>, nodes: Array<SyntaxNode>) : Array<SyntaxNode> => {
    if (tokens[0] === FEATURE) {
      nodes.push(new SyntaxNode(FEATURE, ''));
      tokens.shift();
      ParseScenarioNode(tokens, nodes);
    } else {
      throw 'Feature file must start with "Feature:"';
    }
    return nodes;
  };

const GenerateSyntaxList = (text: string): Array<SyntaxNode> => {
  const tokens = text.split(/\s+/);
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
