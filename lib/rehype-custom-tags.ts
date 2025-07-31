import { visit } from 'unist-util-visit'
import type { Element } from 'hast'


export function rehypeCustomTags() {
  return (tree: any) => {
    visit(tree, 'element', (node: Element) => {
      // 1) Turn all <a> → add target and rel 
      if (node.tagName === 'a') {
        node.properties = {
          ...node.properties,
          target: '_blank',
          rel: ['noopener', 'noreferrer'],
        }
      }
      // 2) 
      
    })
  }
}
