import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalTextEntity } from '@lexical/react/useLexicalTextEntity';
import { useCallback, useEffect } from 'react';

import { $createKeywordNode, KeywordNode } from '../../nodes/KeywordNode';

// ✅ Keep same working RegEx from TS version
const KEYWORDS_REGEX = /(^|[^\p{L}])(congrats|congratulations|felicitaciones|おめでとう|축하해|恭喜)(?=$|[^\p{L}])/iu;

export default function KeywordsPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([KeywordNode])) {
      throw new Error('KeywordsPlugin: KeywordNode not registered on editor');
    }
  }, [editor]);

  // ✅ Must return actual Lexical node, not plain string
  const $createKeywordNode_ = useCallback((textNode) => {
    return $createKeywordNode(textNode.getTextContent());
  }, []);

  const getKeywordMatch = useCallback((text) => {
    const matchArr = KEYWORDS_REGEX.exec(text);
    if (!matchArr) return null;

    const keywordLength = matchArr[2].length;
    const startOffset = matchArr.index + matchArr[1].length;
    const endOffset = startOffset + keywordLength;

    return { start: startOffset, end: endOffset };
  }, []);

  useLexicalTextEntity(getKeywordMatch, KeywordNode, $createKeywordNode_);

  return null;
}
