import { ParseNodes } from '../util/parser.ts';

const GLOBAL_OBJECT_NAME = 'Triceratop';
const Globalize = (name: string, fn: function, type: string) => (globalThis as any)[GLOBAL_OBJECT_NAME][type][name] = fn;

const Given = (name: string, fn: function) => Globalize(name, fn, 'Given');
const When = (name: string, fn: function) => Globalize(name, fn, 'When');
const Then = (name: string, fn: function) => Globalize(name, fn, 'Then');
const And = (name: string, fn: function) => Globalize(name, fn, 'And');
const But = (name: string, fn: function) => Globalize(name, fn, 'But');

const TriceratopTest = async (feature: string, fn: function) => {
  (globalThis as any)[GLOBAL_OBJECT_NAME] = {};
  fn();
  const nodes = ParseNodes(feature);
  const scenarios : Array<Deno.TestDefinition> = [];
  //TODO: Create array of scenario definitions
  for await (scenario of scenarios) {
    await Deno.test(scenario);
  }
  delete globalThis[GLOBAL_OBJECT_NAME];
}

export { Given };
export { When };
export { Then };
export { And };
export { But };
export { TriceratopTest };
