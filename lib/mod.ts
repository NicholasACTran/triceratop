const GLOBAL_OBJECT_NAME = 'Triceratop';
const Globalize = (name: string, fn: function, type: string) => (globalThis as any)[GLOBAL_OBJECT_NAME][type][name] = fn;

const Given = (name: string, fn: function) => Globalize(name, fn, 'Given');
const When = (name: string, fn: function) => Globalize(name, fn, 'When');
const Then = (name: string, fn: function) => Globalize(name, fn, 'Then');
const And = (name: string, fn: function) => Globalize(name, fn, 'And');
const But = (name: string, fn: function) => Globalize(name, fn, 'But');

//TODO: Complete this function
const TriceratopTest = async (feature: string, fn: function) => {
  (globalThis as any)[GLOBAL_OBJECT_NAME] = {};
  fn();
}

export { Given };
export { When };
export { Then };
export { And };
export { But };
