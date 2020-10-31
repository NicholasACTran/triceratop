import { SyntaxNode } from './syntax.ts';

//TODO: Import setup module from URL
const SETUP_MODULE = '../lib/mod.ts'

export function CreateSemanticText(feature : string, nodes : Array<SyntaxNode>) : string {
  let text = `TriceratopTest('${feature}', () => {\n`;
  let importText = `import { `;
  const importList : Array<string> = ['TriceratopTest'];
  const nodeTypes = ['Given', 'When', 'Then', 'And', 'But'];
  for (const node of nodes) {
    if (nodeTypes.includes(node.type)) {
      if (!importList.includes(node.type)) importList.push(node.type);

      if (node.variables.length === 0) {
        text = text + `\t${node.type}(\`${node.text}\`, () => {\n\n\t});\n\n`;
      } else {
        text = text + `\t${node.type}(\`${node.text}\`, (`;
        for (const variable of node.variables) {
          text = text + ` ${variable}, `;
        }
        text = text + `) => {\n\n\t});\n\n`;
      }
    }
  }
  for (const i of importList) {
    importText = importText + `${i}, `;
  }
  importText = importText + `} from "${SETUP_MODULE}";\n\n`;
  return importText + text + '})';
}
