const FEATURE : string = 'Feature:';
const SCENARIO : string = 'Scenario:';
const EXAMPLE : string = 'Example:';
const GIVEN : string = 'Given:';
const WHEN : string = 'When:';
const THEN : string = 'Then:';
const BACKGROUND : string = 'Background';
const AND : string = 'And';

export class SyntaxNode {
  type: String;
  text: String;

  constructor(type: string, text: string) {
    this.type = type;
    this.text = text;
  }
}

const ParseAndNode =
  (tokens: Array<string>, nodes: Array<SyntaxNode>, context: string) => {
    let and_description = '';
    tokens.shift();
    while (true) {
      if (tokens.length === 0 || tokens[0] === '') {
        if (context === THEN) {
          nodes.push(new SyntaxNode(AND, and_description));
          return;
        } else {
          throw `EOF not expected after "And" under context ${context}`;
        }
      }

      if (tokens[0] === THEN) {
        if (context === WHEN) {
          nodes.push(new SyntaxNode(AND, and_description));
          ParseThenNode(tokens, nodes);
          return;
        } else {
          throw `Then not expected after "And" under context ${context}`;
        }
      } else if (tokens[0] === WHEN) {
        if (context === GIVEN) {
          nodes.push(new SyntaxNode(AND, and_description));
          ParseWhenNode(tokens, nodes);
          return;
        } else {
          throw `When not expected after "And" under context ${context}`;
        }
      } else if (tokens[0] === SCENARIO || tokens[0] === EXAMPLE) {
        if (context === THEN) {
          nodes.push(new SyntaxNode(AND, and_description));
          ParseScenarioExampleNode(tokens, nodes, tokens[0]);
          return;
        } else {
          throw `${tokens[0]} not expected after "AND" under context ${context}`;
        }
      } else if (tokens[0] === AND) {
        nodes.push(new SyntaxNode(AND, and_description));
        ParseAndNode(tokens, nodes, context);
        return;
      }

      and_description = (and_description === '') ? `${tokens.shift()}`
                              : `${and_description} ${tokens.shift()}`;
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
      else if (tokens[0] === AND) {
        nodes.push(new SyntaxNode(THEN, then_description));
        ParseAndNode(tokens, nodes, THEN);
        return;
      } else if (tokens[0] === THEN) {
        nodes.push(new SyntaxNode(THEN, then_description));
        ParseThenNode(tokens, nodes);
        return;
      } else if (tokens[0] === SCENARIO || tokens[0] === EXAMPLE) {
        nodes.push(new SyntaxNode(THEN, then_description));
        ParseScenarioExampleNode(tokens, nodes, tokens[0]);
        return;
      }

      then_description = (then_description === '') ? `${tokens.shift()}`
                              : `${then_description} ${tokens.shift()}`;
    }
  };

const ParseWhenNode =
  (tokens: Array<string>, nodes: Array<SyntaxNode>) => {
    let when_description = '';
    tokens.shift();
    while (true) {
      if (tokens[0] === WHEN) {
        nodes.push(new SyntaxNode(WHEN, when_description));
        ParseWhenNode(tokens, nodes);
        return;
      } else if (tokens[0] === AND) {
        nodes.push(new SyntaxNode(WHEN, when_description));
        ParseAndNode(tokens, nodes, WHEN);
        return;
      } else if (tokens[0] === THEN) {
        nodes.push(new SyntaxNode(WHEN, when_description));
        ParseThenNode(tokens, nodes);
        return;
      } else if (tokens[0] === '') {
        throw 'Expected "When" or "Then" after "When"';
      }

      when_description = (when_description === '') ? `${tokens.shift()}`
                              : `${when_description} ${tokens.shift()}`;
    }
  };

const ParseGivenNode =
  (tokens: Array<string>, nodes: Array<SyntaxNode>) => {
    let given_description = '';
    tokens.shift();
    while (true) {
      if (tokens[0] === GIVEN) {
        nodes.push(new SyntaxNode(GIVEN, given_description));
        ParseGivenNode(tokens, nodes);
        return;
      } else if (tokens[0] === AND){
        nodes.push(new SyntaxNode(GIVEN, given_description));
        ParseAndNode(tokens, nodes, GIVEN);
        return;
      } else if (tokens[0] === WHEN) {
        nodes.push(new SyntaxNode(GIVEN, given_description));
        ParseWhenNode(tokens, nodes);
        return;
      } else if (tokens[0] === ''){
        throw 'Expected "Given" or "When" after "Given"';
      }

      given_description = (given_description === '') ? `${tokens.shift()}`
                              : `${given_description} ${tokens.shift()}`;
    }
  };

const ParseBackgroundGivenNode = (tokens: Array<string>) : SyntaxNode => {
    let given_description = '';
    tokens.shift();
    while (true) {
      if (tokens[0] === GIVEN
        || tokens[0] === AND
        || tokens[0] === SCENARIO
        || tokens[0] === EXAMPLE) {
        return (new SyntaxNode(GIVEN, given_description));
      } else if (tokens[0] === ''){
        throw 'Expected "Given" after "Given"';
      }

      given_description = (given_description === '') ? `${tokens.shift()}`
                              : `${given_description} ${tokens.shift()}`;
    }
  };

const ParseScenarioExampleNode =
  (tokens: Array<string>, nodes: Array<SyntaxNode>, type: string) => {
    if (tokens[0] === SCENARIO || tokens[0] === EXAMPLE) {
      let scenarion_description = '';
      tokens.shift();
      while (true) {
        if (tokens[0] === GIVEN) {
          nodes.push(new SyntaxNode(type, scenarion_description));
          ParseGivenNode(tokens, nodes);
          return;
        } else if (tokens[0] === WHEN) {
          nodes.push(new SyntaxNode(type, scenarion_description));
          ParseWhenNode(tokens, nodes);
          return;
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

// TODO: Rework to implement AND and BUT nodes in Background
const ParseBackgroundNode =
  (tokens: Array<string>, nodes: Array<SyntaxNode>) => {
    tokens.shift();
    nodes.push(new SyntaxNode(BACKGROUND, ''));
    if (tokens[0] !== GIVEN) {
      throw 'Expected "Given" after "Background"'
    }
    while (tokens[0] !== SCENARIO && tokens[0] !== EXAMPLE) {
      if (tokens[0] === '') {
        throw 'Expected "Scenario" or "Example" after "GIVEN"';
      }

      nodes.push(ParseBackgroundGivenNode(tokens));
    }
    ParseScenarioExampleNode(tokens, nodes, tokens[0]);
  };

const ParseFeatureNode =
  (tokens: Array<string>, nodes: Array<SyntaxNode>) : Array<SyntaxNode> => {
    if (tokens[0] === FEATURE) {
      let feature_description = '';
      tokens.shift();
      while (tokens[0] !== SCENARIO
              && tokens[0] !== EXAMPLE
              && tokens[0] !== BACKGROUND) {
        if (tokens[0] === '') {
          throw 'Expected "Scenario" or "Example" after "Feature"';
        }

        feature_description = (feature_description === '') ? `${tokens.shift()}`
                                : `${feature_description} ${tokens.shift()}`;
      }
      nodes.push(new SyntaxNode(FEATURE, feature_description));
      if (tokens[0] === BACKGROUND) {
        ParseBackgroundNode(tokens, nodes);
      } else {
        ParseScenarioExampleNode(tokens, nodes, tokens[0]);
      }
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
