import { Provider } from '@lexical/yjs';
import { WebsocketProvider } from 'y-websocket';
import { Doc } from 'yjs';

// parent dom -> child doc
export function createWebsocketProvider(id, yjsDocMap) {
  // Only run this on the client
  if (typeof window === 'undefined') {
    return null; // or throw an error if you prefer
  }

  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  const WEBSOCKET_ENDPOINT = params.get('collabEndpoint') || 'ws://localhost:1234';
  const WEBSOCKET_SLUG = 'playground';
  const WEBSOCKET_ID = params.get('collabId') || '0';

  let doc = yjsDocMap.get(id);

  if (!doc) {
    doc = new Doc();
    yjsDocMap.set(id, doc);
  } else {
    doc.load();
  }

  // @ts-expect-error
  return new WebsocketProvider(
    WEBSOCKET_ENDPOINT,
    `${WEBSOCKET_SLUG}/${WEBSOCKET_ID}/${id}`,
    doc,
    { connect: false }
  );
}

