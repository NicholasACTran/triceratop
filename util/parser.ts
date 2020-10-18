const FEATURE : string = 'Feature:';
const SCENARIO : string = 'Scenario:';
const GIVEN : string = 'Given:';
const WHEN : string = 'When:';
const THEN : string = 'Then:';

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
    let then_description = '';
    tokens.shift();
    while (true) {
      if (tokens.length === 0 || tokens[0] === '') {
        nodes.push(new SyntaxNode(THEN, then_description));
        return;
      }
      else if (tokens[0] === THEN) {
        nodes.push(new SyntaxNode(THEN, then_description));
        ParseThenNode(tokens, nodes);
      } else if (tokens[0] === SCENARIO) {
        nodes.push(new SyntaxNode(THEN, then_description));
        ParseScenarioNode(tokens, nodes);
      }

      then_description = (then_description === '') ? `${tokens.shift()}`
                              : `${then_description} ${tokens.shift()}`;
    }
  }

const ParseWhenNode =
  (tokens: Array<string>, nodes: Array<SyntaxNode>) => {
    let when_description = '';
    tokens.shift();
    while (true) {
      if (tokens[0] === WHEN) {
        nodes.push(new SyntaxNode(WHEN, when_description));
        ParseWhenNode(tokens, nodes);
        break;
      } else if (tokens[0] === THEN) {
        nodes.push(new SyntaxNode(WHEN, when_description));
        ParseThenNode(tokens, nodes);
        break;
      } else if (tokens[0] === '') {
        throw 'Expected "When" or "Then" after "When"';
      }

      when_description = (when_description === '') ? `${tokens.shift()}`
                              : `${when_description} ${tokens.shift()}`;
    }
  }

const ParseGivenNode =
  (tokens: Array<string>, nodes: Array<SyntaxNode>) => {
    let given_description = '';
    tokens.shift();
    while (true) {
      if (tokens[0] === GIVEN) {
        nodes.push(new SyntaxNode(GIVEN, given_description));
        ParseGivenNode(tokens, nodes);
        break;
      } else if (tokens[0] === WHEN) {
        nodes.push(new SyntaxNode(GIVEN, given_description));
        ParseWhenNode(tokens, nodes);
        break;
      } else if (tokens[0] === ''){
        throw 'Expected "Given" or "When" after "Given"';
      }

      given_description = (given_description === '') ? `${tokens.shift()}`
                              : `${given_description} ${tokens.shift()}`;
    }
  }

const ParseScenarioNode =
  (tokens: Array<string>, nodes: Array<SyntaxNode>) => {
    if (tokens[0] === SCENARIO) {
      let scenarion_description = '';
      tokens.shift();
      while (true) {
        if (tokens[0] === GIVEN) {
          nodes.push(new SyntaxNode(SCENARIO, scenarion_description));
          ParseGivenNode(tokens, nodes);
          break;
        } else if (tokens[0] === WHEN) {
          nodes.push(new SyntaxNode(SCENARIO, scenarion_description));
          ParseWhenNode(tokens, nodes);
          break;
        } else if (tokens[0] === '') {
          throw 'Expected "Given" or "When" after "Scenario"';
        }

        scenarion_description = (scenarion_description === '') ? `${tokens.shift()}`
                                : `${scenarion_description} ${tokens.shift()}`;
      }
    } else {
      throw 'Expected "Scenario" after "Feature"';
    }
  };

const ParseFeatureNode =
  (tokens: Array<string>, nodes: Array<SyntaxNode>) : Array<SyntaxNode> => {
    if (tokens[0] === FEATURE) {
      let feature_description = '';
      tokens.shift();
      while (tokens[0] !== SCENARIO) {
        if (tokens[0] === '') {
          throw 'Expected "Scenario" after "Feature"';
        }

        feature_description = (feature_description === '') ? `${tokens.shift()}`
                                : `${feature_description} ${tokens.shift()}`;
      }
      nodes.push(new SyntaxNode(FEATURE, feature_description));
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
  // TODO: Implement parsing logic
  // TODO: Figure out parsing error when using an incorrect Key term
  const text = await Deno.readTextFile(feature_file);
  const parsed_syntax = GenerateSyntaxList(text);
  return Promise.resolve(text);
}
