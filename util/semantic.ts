import { SyntaxNode } from './syntax.ts';

export function CreateSemanticText(nodes : Array<SyntaxNode>) : string {
  let text = '';
  const nodeTypes = ['Given', 'When', 'Then', 'And', 'But'];
  for (const node of nodes) {
    if (nodeTypes.includes(node.type)) {
      if (node.variables.length === 0) {
        text = text + `${node.type}(\`${node.text}\`, () => {\n\n});\n\n`;
      } else {
        text = text + `${node.type}(\`${node.text}\`, (`;
        for (const variable of node.variables) {
          text = text + ` ${variable}, `;
        }
        text = text + `) => {\n\n});\n\n`;
      }
    }
  }
  return text;
}
