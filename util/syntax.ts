// deno-lint-ignore-file no-explicit-any
import { readLine } from './readline.ts';

const FEATURE = 'Feature:';
const SCENARIO = 'Scenario:';
const EXAMPLE = 'Example:';
const EXAMPLES = 'Examples:';
const GIVEN = 'Given';
const WHEN = 'When';
const THEN = 'Then';
const BACKGROUND = 'Background:';
const AND = 'And';
const BUT = 'But';
const SCENARIO_OUTLINE_1 = 'Scenario';
// deno-lint-ignore no-unused-vars
const SCENARIO_OUTLINE_2 = 'Outline';
const SCENARIO_OUTLINE = 'Scenario Outline:';
const RULE = 'Rule:';
const DOCSTRING = '"""';

const headers = [
  FEATURE,
  BACKGROUND,
  SCENARIO,
  EXAMPLE,
  SCENARIO_OUTLINE,
  RULE
]

/**
* SyntaxNode class
* @required type The type of node (Feature, Scenario, Given, When, Then, etc.)
* @required text The semantic text of the node
* @optional variables An array with the variable names relevant to the node
* @optional exampleMap An array of objects that have the dynamic examples from a data table
*/
export class SyntaxNode {
  type: string;
  text: string;
  variables: string[];
  exampleMap: any[];
  docString: string;
  dataTable: any[];

  constructor(type: string, text='', variables?:string[], exampleMap?:any[]) {
    this.type = type;
    this.text = text;
    this.variables = variables ? variables : [];
    this.exampleMap = exampleMap ? exampleMap : [];
    this.docString = '';
    this.dataTable = [];
  }

  addDynamicData(text?:string, dataTable?:any[]) {
    if (text) {
      this.docString = text;
      this.variables.push('docString');
    }
    if (dataTable) {
      this.dataTable = dataTable;
      this.variables.push('dataTable');
    }
  }
}

/**
^ Parses DataTable and adds it to the relevant syntax node.
* Will also parse the next node and add it into the syntax node array, adjusting
* the context as need be.
*
* @param generator the generator to grab the next lines until table is finished
* @param nodes the list of syntax nodes
* @param context the current context of the parsing
* @param header the header line of the data table
* @return Promise of the new context of the parsing
*/
const ParseDataTable = async (generator : AsyncGenerator<string>,
                              nodes: Array<SyntaxNode>,
                              context: [string, string],
                              header: string) : Promise<[string, string]> => {
    const dataTable : Array<any> = [];
    const headerVars : Array<string> = [];
    const newContext = context;
    const headerSplit = RemovePadding(header).replace(/\|/g, '').split(' ');

    for (const h of headerSplit) {
      if (h !== '') headerVars.push(h);
    }

    let g = await generator.next();
    while (RemovePadding(g.value)[0] === '|') {
      const entry = RemovePadding(g.value).replace(/\|/g, '').split(' ');
      const entryObj : any = {};
      let count = 0;
      for (const v of entry) {
        if (v !== '') {
          entryObj[headerVars[count]] = v;
          count++;
        }
      }
      dataTable.push(entryObj);
      g = await generator.next();
    }

    const nextLineSplit = RemovePadding(g.value).split(' ');
    nodes[nodes.length - 1].addDynamicData('', dataTable);
    if (g.done) {
      return Promise.resolve(['END', 'END']);
    } else if (headers.includes(nextLineSplit[0])) {
      nodes.push(ParseHeaderNode(RemovePadding(g.value), nextLineSplit[0]));
      return Promise.resolve([nextLineSplit[0], '']);
    } else {
      nodes.push(ParseFunctionNode(RemovePadding(g.value), nextLineSplit[0]));
      if (![AND, BUT].includes(nextLineSplit[0])) newContext[1] = nextLineSplit[0];
      return Promise.resolve(newContext);
    }
  }

/**
^ Parses DocString and adds to relevant syntax node
*
* @param generator the generator to grab the next lines until the closing string is parsed
* @param node the node that is related to the Doc String
*/
const ParseDocString = async (generator : AsyncGenerator<string>, node: SyntaxNode) => {
  let docString = '';
  let g = await generator.next();
  while (RemovePadding(g.value) !== DOCSTRING) {
    if (g.done) {
      throw 'Expected closing quoatoations for Doc String';
    }
    docString = docString + g.value;
    g = await generator.next();
  }

  node.addDynamicData(docString);
  return;
}

/**
^ Parses Example Data Table
*
* @param generator the generator to grab the next lines until EOF or the next header
* @param nodes the array to insert syntax nodes
* @return the header that the context will be set to for the next round of parsing
*/
const ParseExamplesNode = async (generator : AsyncGenerator<string>,
                                  nodes: Array<SyntaxNode>) : Promise<string> => {
  const examples : Array<any> = [];
  const variables : Array<string> = [];

  let g = await generator.next();
  const header = RemovePadding(g.value).replace(/\|/g, '').split(' ');
  for (const h of header) {
    if (h !== '') variables.push(h);
  }

  while (true) {
    g = await generator.next();
    if (g.done) break;

    const line = RemovePadding(g.value);
    if (line[0] !== '|') {
      const type = line.split(' ')[0];
      if (line.length === 0) { continue; }
      else if (headers.includes(type)) {
        nodes.push(new SyntaxNode(EXAMPLES, '', [], examples));
        nodes.push(ParseHeaderNode(line, type));
        return Promise.resolve(type);
      } else throw 'Expected header key word after "Examples"';
    }

    const lines = line.replace(/\|/g, '').split(' ');
    let counter = 0;
    const exampleObj : any = {};
    for (const token of lines) {
      if (token !== '') {
        exampleObj[variables[counter]] = token;
        counter++;
      }
    }

    examples.push(exampleObj);
  }

  nodes.push(new SyntaxNode(EXAMPLES, '', [], examples));
  return Promise.resolve(SCENARIO_OUTLINE);
}

/**
^ Parses lines that will generate functions (Given, When, Then, And, But)
*
* @param line line to parse
* @param type type of node
*/
const ParseFunctionNode = (line: string, type: string) : SyntaxNode => {
  const tokens = line.split(' ');
  const variables : Array<string> = [];
  let function_text = '';
  tokens.shift();
  while (tokens.length) {
    const token = tokens.shift()!;
    if (token.startsWith('<') && token.endsWith('>')) {
      variables.push(token.substring(1, token.length-1));
    }
    function_text = (function_text === '') ? token : `${function_text} ${token}`;
  }
  return new SyntaxNode(type, function_text, variables);
};

/**
* Parses lines that are defined as a header (Feature, Scenario, Example Scenario Outline)
*
* @param line line to parse
* @param type type of node
*/
const ParseHeaderNode = (line: string, type: string) : SyntaxNode => {
  return new SyntaxNode(type, line.substring(line.indexOf(':') + 2));
};

// Removes tabs and trailing spaces from a line
const RemovePadding = (line: string) : string => {
  line = line.replace(/\t/g, '');
  while (line[0] === ' ') {
    line = line.substring(1);
  }
  return line;
}

/**
* Given a feature file name, return a list of Syntax nodes that represent the
* feature file. Following typical Gherkin rules
*
* @param feature_file the path to the feature file to parse
* @return a Promise of an array of Syntax Nodes
*/
export async function GenerateSyntaxList(feature_file: string): Promise<Array<SyntaxNode>> {
  const nodes : Array<SyntaxNode>  = [];
  // Context tuplet that tracks the previous relevent node
  // Index 0: The most recent header node
  // Index 1: The most recent, relevant function node (Given, When, Then)
  let context: [string, string] = ['', ''];
  const lines = await readLine(feature_file);
  while (true) {
    const generated = await lines.next();
    if (generated.done) {
      break;
    }
    let line = generated.value;
    line = RemovePadding(line);
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
      case SCENARIO_OUTLINE_1:
        if ([FEATURE, BACKGROUND].includes(context[0]) ||
            (headers.includes(context[0]) &&
              (context[1] === THEN || context[1] === ''))) {
            nodes.push(ParseHeaderNode(line, SCENARIO_OUTLINE));
            context[0] = SCENARIO_OUTLINE;
            context[1] = '';
        } else throw '"SCENARIO" expected to follow "Feature", "Background", or "Then"';
        break;
      case RULE:
        //TODO: Add context checking for Rule?
        nodes.push(ParseHeaderNode(line, RULE));
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
      case EXAMPLES:
        if ([FEATURE, BACKGROUND].includes(context[0]) ||
            (headers.includes(context[0]) &&
              (context[1] === THEN || context[1] === ''))) {
                context[0] = await ParseExamplesNode(lines, nodes);
                context[1] = '';
              } else throw '"Examples" expected to follow "Then"'
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
            [GIVEN, WHEN, ''].includes(context[1])) {
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
      case DOCSTRING:
        await ParseDocString(lines, nodes[nodes.length - 1]);
        break;
      case '|':
        context = await ParseDataTable(lines, nodes, context, line);
        if (context[0] === 'END') return Promise.resolve(nodes);
        break;
      default:
        break;
    }
  }

  return Promise.resolve(nodes);
}
