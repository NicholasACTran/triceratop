import { ParseNodes } from '../util/parser.ts';
import { SyntaxNode } from '../util/syntax.ts';

const GLOBAL_OBJECT_NAME : string = 'Triceratop';

// Adds a function to the globalThis array
/** The layout of the object is
{
  ...
  Triceratop: {
    Given: {
      ${Function name}: ${function},
      ...
    },
    When: {
      ...
    }
  }
}
*/
const Globalize = (name: string, fn: Function, type: string) => (globalThis as any)[GLOBAL_OBJECT_NAME][type][name] = fn;

const Given = (name: string, fn: Function) => Globalize(name, fn, 'Given');
const When = (name: string, fn: Function) => Globalize(name, fn, 'When');
const Then = (name: string, fn: Function) => Globalize(name, fn, 'Then');
const And = (name: string, fn: Function) => Globalize(name, fn, 'And');
const But = (name: string, fn: Function) => Globalize(name, fn, 'But');

/**
* Given an array of nodes, relating to a BDD scenario/example, create a Deno.TestDefinition
*
* @param nodes a sub-array of the original nodes array, only contains nodes related
* to a single scenario
* @param background an array of nodes that contain the background step information
* @return a TestDefinition to be run
*/
const ComposeScenario = (nodes: Array<SyntaxNode>, background: Array<SyntaxNode>) : Deno.TestDefinition => {
  //TODO: Finish this function
  return {
    name: `${nodes[0].type} ${nodes[0].text}`,
    async fn() {

      for (let bg of background) {
        const testFn = (globalThis as any)[GLOBAL_OBJECT_NAME][bg.type];
        if (testFn && testFn[bg.text]) {
          await testFn[bg.text]();
        }
      }
      for (let node of nodes) {
        const testFn = (globalThis as any)[GLOBAL_OBJECT_NAME][node.type];
        if (testFn && testFn[node.text]) {
          await testFn[node.text]();
        }
      }

    }
  };
};

const TriceratopTest = async (feature: string, fn: Function) => {
  (globalThis as any)[GLOBAL_OBJECT_NAME] = {
    'Given': {},
    'When': {},
    'Then': {},
    'And': {},
    'But': {}
  };
  //Runs all the functions to globalize all the test functions
  fn();

  const nodes = await ParseNodes(feature);
  const backgroundNodes : Array<SyntaxNode> = [];
  const scenarios : Array<Deno.TestDefinition> = [];

  //Iterate through the syntax nodes and create TestDefinitions for each scenario
  //TODO: Remove duplicate code
  for (let i = 0; i < nodes.length; i++) {
    let j = i + 1;
    const scenarioNodes = [];
    switch (nodes[i].type) {
      case 'Background:':
        while (['Given', 'And', 'But'].includes(nodes[j].type)) {
          backgroundNodes.push(nodes[j]);
          j++;
        }
        break;
      case 'Scenario:':
        //Add the header node
        scenarioNodes.push(nodes[i]);
        while (['Given', 'When', 'Then', 'And', 'But'].includes(nodes[j]?.type)) {
          scenarioNodes.push(nodes[j]);
          j++;
        }
        scenarios.push(ComposeScenario(scenarioNodes, backgroundNodes));
        break;
      case 'Example:':
        //Add the header node
        scenarioNodes.push(nodes[i]);
        while (['Given', 'When', 'Then', 'And', 'But'].includes(nodes[j].type)) {
          scenarioNodes.push(nodes[j]);
          j++;
        }
        scenarios.push(ComposeScenario(scenarioNodes, backgroundNodes));
        break;
      case 'Scenario Outline:':

        //Add the header node
        scenarioNodes.push(nodes[i]);
        while (['Given', 'When', 'Then', 'And', 'But'].includes(nodes[j].type)) {
          scenarioNodes.push(nodes[j]);
          j++;
        }
        //Add the Examples node
        scenarioNodes.push(nodes[j]);
        scenarios.push(ComposeScenario(scenarioNodes, backgroundNodes));
        break;
    }
  }

  for await (let scenario of scenarios) {
    await Deno.test(scenario);
  }

  delete (globalThis as any)[GLOBAL_OBJECT_NAME];
};

export { Given };
export { When };
export { Then };
export { And };
export { But };
export { TriceratopTest };
