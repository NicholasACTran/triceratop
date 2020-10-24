import { SyntaxNode } from './syntax.ts';

export function CreateSemanticText(nodes : Array<SyntaxNode>) : string {
  let text = '';
  const nodeTypes = ['Given', 'When', 'Then', 'And', 'But'];
  for (const node of nodes) {
    if (nodeTypes.includes(node.type)) {
      text = text + `${node.type}('${node.text}', () => {\n\n});\n\n`;
    }
  }
  return text;
}
