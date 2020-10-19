const FEATURE : string = 'Feature:';
const SCENARIO : string = 'Scenario:';
const EXAMPLE : string = 'Example:';
const GIVEN : string = 'Given:';
const WHEN : string = 'When:';
const THEN : string = 'Then:';

export class SyntaxNode {
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
      } else if (tokens[0] === SCENARIO || tokens[0] === EXAMPLE) {
        nodes.push(new SyntaxNode(THEN, then_description));
        ParseScenarioExampleNode(tokens, nodes, tokens[0]);
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

const ParseScenarioExampleNode =
  (tokens: Array<string>, nodes: Array<SyntaxNode>, type: string) => {
    if (tokens[0] === SCENARIO || tokens[0] === EXAMPLE) {
      let scenarion_description = '';
      tokens.shift();
      while (true) {
        if (tokens[0] === GIVEN) {
          nodes.push(new SyntaxNode(type, scenarion_description));
          ParseGivenNode(tokens, nodes);
          break;
        } else if (tokens[0] === WHEN) {
          nodes.push(new SyntaxNode(type, scenarion_description));
          ParseWhenNode(tokens, nodes);
          break;
        } else if (tokens[0] === '') {
          throw `Expected "Given" or "When" after "${type}"`;
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
      while (tokens[0] !== SCENARIO && tokens[0] !== EXAMPLE) {
        if (tokens[0] === '') {
          throw 'Expected "Scenario" or "Example" after "Feature"';
        }

        feature_description = (feature_description === '') ? `${tokens.shift()}`
                                : `${feature_description} ${tokens.shift()}`;
      }
      nodes.push(new SyntaxNode(FEATURE, feature_description));
      ParseScenarioExampleNode(tokens, nodes, tokens[0]);
    } else {
      throw 'Feature file must start with "Feature:"';
    }
    return nodes;
  };

export function GenerateSyntaxList(text: string): Array<SyntaxNode> {
  const tokens = text.split(/\s+/);
  const nodes : Array<SyntaxNode>  = [];

  ParseFeatureNode(tokens, nodes);
  return nodes;
}
