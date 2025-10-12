import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import * as React from 'react';

import { PLAYGROUND_TRANSFORMERS } from '../MarkdownTransformers';

export default function MarkdownPlugin() {
  return <MarkdownShortcutPlugin transformers={PLAYGROUND_TRANSFORMERS} />;
}