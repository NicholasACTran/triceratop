import { readLine } from './readline.ts';

const FEATURE : string = 'Feature:';
const SCENARIO : string = 'Scenario:';
const EXAMPLE : string = 'Example:';
const GIVEN : string = 'Given';
const WHEN : string = 'When';
const THEN : string = 'Then';
const BACKGROUND : string = 'Background:';
const AND : string = 'And';
const BUT : string = 'But';
const OUTLINE : string = 'Outline';
const SCENARIO_OUTLINE : string = 'Scenario Outline:';

const headers = [
  FEATURE,
  BACKGROUND,
  SCENARIO,
  EXAMPLE,
  SCENARIO_OUTLINE
]

export class SyntaxNode {
  type: string;
  text: string;

  constructor(type: string, text='') {
    this.type = type;
    this.text = text;
  }
}

/**
^ Parses lines that will generate functions (Given, When, Then, And, But)
*
* @param line line to parse
* @param type type of node
*/

const ParseFunctionNode = (line: string, type: string) : SyntaxNode => {
 return new SyntaxNode(type, line.substring(line.indexOf(' ')));
};

/**
* Parses lines that are defined as a header (Feature, Scenario, Example Scenario Outline)
*
* @param line line to parse
* @param type type of node
*/
const ParseHeaderNode = (line: string, type: string) : SyntaxNode => {
  return new SyntaxNode(type, line.substring(line.indexOf(' ')));
};

/**
* Given a feature file name, return a list of Syntax nodes that represent the
* feature file. Following typical Gherkin rules
* TODO: Add context checking at the parsing level

* @param feature_file the path to the feature file to parse
*/
export async function GenerateSyntaxList(feature_file: string): Promise<Array<SyntaxNode>> {
  const nodes : Array<SyntaxNode>  = [];
  // Context tuplet that tracks the previous relevent node
  // Index 0: The most recent header node
  // Index 1: The most recent, relevant function node (Given, When, Then)
  let context: [string, string] = ['', ''];
  for await (const line of readLine(feature_file)) {
    switch(line.split(' ')[0]) {
      case FEATURE:
        if (context[0] === '') {
            nodes.push(ParseHeaderNode(line, FEATURE));
            context[0] = FEATURE;
        } else throw 'Only 1 Feature per .feature file';
        break;
      case BACKGROUND:
        if (context[0] === FEATURE) {
            nodes.push(new SyntaxNode(BACKGROUND));
            context[0] = BACKGROUND;
        } else throw '"Background" expected to follow "Feature"';
        break;
      case SCENARIO:
        if ([FEATURE, BACKGROUND].includes(context[0]) ||
            (headers.includes(context[0]) &&
              (context[1] === THEN || context[1] === ''))) {
            nodes.push(ParseHeaderNode(line, SCENARIO));
            context[0] = SCENARIO;
            context[1] = '';
        } else throw '"SCENARIO" expected to follow "Feature", "Background", or "Then"';
        break;
      case EXAMPLE:
        if ([FEATURE, BACKGROUND].includes(context[0]) ||
            (headers.includes(context[0]) &&
              (context[1] === THEN || context[1] === ''))) {
            nodes.push(ParseHeaderNode(line, EXAMPLE));
            context[0] = EXAMPLE;
            context[1] = '';
        } else throw '"SCENARIO" expected to follow "Feature", "Background", or "Then"';
        break;
      case GIVEN:
        if (context[0] === BACKGROUND ||
            ([SCENARIO, SCENARIO_OUTLINE, EXAMPLE].includes(context[0]) &&
              [GIVEN, ''].includes(context[1]))) {
            nodes.push(ParseFunctionNode(line, GIVEN));
            context[1] = GIVEN;
          } else throw '"Given" expected to follow "Given", "Background", "Scenario"';
        break;
      case WHEN:
        if ([SCENARIO, SCENARIO_OUTLINE, EXAMPLE].includes(context[0]) &&
            [GIVEN, WHEN].includes(context[1])) {
              nodes.push(ParseFunctionNode(line, WHEN));
              context[1] = WHEN;
            } else throw '"When" expected to follow "Given", "Scenario"';
        break;
      case THEN:
        if ([SCENARIO, SCENARIO_OUTLINE, EXAMPLE].includes(context[0]) &&
            [THEN, WHEN].includes(context[1])) {
              nodes.push(ParseFunctionNode(line, THEN));
              context[1] = THEN;
            } else throw '"Then" expected to follow "Given", "Scenario"';
        break;
      case AND:
        if ([GIVEN, WHEN, THEN].includes(context[1])) {
          nodes.push(ParseFunctionNode(line, AND));
        } else throw '"And" expected to follow "Given", "When", "Then"';
        break;
      case BUT:
        if ([GIVEN, WHEN, THEN].includes(context[1])) {
          nodes.push(ParseFunctionNode(line, BUT));
        } else throw '"But" expected to follow "Given", "When", "Then"';
        break;
      default:
        break;
    }
  }

  return Promise.resolve(nodes);
}
