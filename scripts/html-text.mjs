import { parseFragment } from 'parse5';

function collectText(node) {
  if (node.nodeName === '#text') return node.value;
  if (node.nodeName === 'br') return ' ';
  return (node.childNodes || []).map(collectText).join('');
}

export function htmlText(html) {
  return collectText(parseFragment(html)).replace(/\s+/g, ' ').trim();
}
