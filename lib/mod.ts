import { ParseNodes } from '../util/parser.ts';
import { SyntaxNode } from '../util/syntax.ts';

const GLOBAL_OBJECT_NAME = 'Triceratop';

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
const Globalize = (name: string, fn: function, type: string) => (globalThis as any)[GLOBAL_OBJECT_NAME][type][name] = fn;

const Given = (name: string, fn: function) => Globalize(name, fn, 'Given');
const When = (name: string, fn: function) => Globalize(name, fn, 'When');
const Then = (name: string, fn: function) => Globalize(name, fn, 'Then');
const And = (name: string, fn: function) => Globalize(name, fn, 'And');
const But = (name: string, fn: function) => Globalize(name, fn, 'But');

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
};

const TriceratopTest = async (feature: string, fn: function) => {
  (globalThis as any)[GLOBAL_OBJECT_NAME] = {};
  //Runs all the functions to globalize all the test functions
  fn();

  const nodes = ParseNodes(feature);
  const backgroundNodes : Array<SyntaxNode> = [];
  const scenarios : Array<Deno.TestDefinition> = [];

  //Iterate through the syntax nodes and create TestDefinitions for each scenario
  //TODO: Remove duplicate code
  for (let i = 0; i < nodes.length; i++) {
    switch (nodes[i].type) {
      case 'Background:':
        let j = i+1;
        while (['Given', 'And', 'But'].includes(nodes[j].type)) {
          backgroundNodes.push(nodes[j]);
          j++;
        }
        break;
      case 'Scenario:':
        let j = i+1;
        const scenarioNodes = [];
        //Add the header node
        scenarioNodes.push(nodes[i]);
        while (['Given', 'When', 'Then', 'And', 'But'].includes(nodes[j].type)) {
          scenarioNodes.push(nodes[j]);
          j++;
        }
        scenarios.push(ComposeScenario(scenarioNodes, backgroundNodes));
        break;
      case 'Example:':
        let j = i+1;
        const scenarioNodes = [];
        //Add the header node
        scenarioNodes.push(nodes[i]);
        while (['Given', 'When', 'Then', 'And', 'But'].includes(nodes[j].type)) {
          scenarioNodes.push(nodes[j]);
          j++;
        }
        scenarios.push(ComposeScenario(scenarioNodes, backgroundNodes));
        break;
      case 'Scenario Outline:':
      let j = i+1;
        const scenarioNodes = [];
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

  for await (scenario of scenarios) {
    await Deno.test(scenario);
  }
  delete globalThis[GLOBAL_OBJECT_NAME];
};

export { Given };
export { When };
export { Then };
export { And };
export { But };
export { TriceratopTest };
