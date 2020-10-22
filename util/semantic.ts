import { SyntaxNode } from './syntax.ts';

//TODO: Implement semantics
export function CreateSemanticText(nodes : Array<SyntaxNode>) : string {
  let text = '';
  for (const node of nodes) {
    switch(node.type) {
      case 'Feature':
        break;
      case 'Scenario':
        break;
      case 'Example':
        break;
      case 'When':
        break;
      case 'Then':
        break;
    }
  }
  return text;
}
