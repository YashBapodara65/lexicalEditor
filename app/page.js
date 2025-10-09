// 'use client';
// import "./index.css"
// import {$createLinkNode} from '@lexical/link';
// import {$createListItemNode, $createListNode} from '@lexical/list';
// import {LexicalCollaboration} from '@lexical/react/LexicalCollaborationContext';
// import {LexicalExtensionComposer} from '@lexical/react/LexicalExtensionComposer';
// import {$createHeadingNode, $createQuoteNode} from '@lexical/rich-text';
// import {
//   $createParagraphNode,
//   $createTextNode,
//   $getRoot,
//   $isTextNode,
//   defineExtension,
//   DOMConversionMap,
//   TextNode,
// } from 'lexical';
// import {useMemo} from 'react';

// import {isDevPlayground} from './appSettings';
// import {FlashMessageContext} from './context/FlashMessageContext';
// import {SettingsContext, useSettings} from './context/SettingsContext';
// import {SharedHistoryContext} from './context/SharedHistoryContext';
// import {ToolbarContext} from './context/ToolbarContext';
// import Editor from './Editor';
// import logo from './images/logo.svg';
// import PlaygroundNodes from './nodes/PlaygroundNodes';
// import DocsPlugin from './plugins/DocsPlugin';
// import PasteLogPlugin from './plugins/PasteLogPlugin';
// import {TableContext} from './plugins/TablePlugin';
// import TestRecorderPlugin from './plugins/TestRecorderPlugin';
// import {parseAllowedFontSize} from './plugins/ToolbarPlugin/fontSize';
// import TypingPerfPlugin from './plugins/TypingPerfPlugin';
// import Settings from './Settings';
// import PlaygroundEditorTheme from './themes/PlaygroundEditorTheme';
// import {parseAllowedColor} from './ui/ColorPicker';

// console.warn(
//   'If you are profiling the playground app, please ensure you turn off the debug view. You can disable it by pressing on the settings control in the bottom-left of your screen and toggling the debug view setting.'
// );

// function $prepopulatedRichText() {
//   const root = $getRoot();
//   if (root.getFirstChild() === null) {
//     const heading = $createHeadingNode('h1');
//     heading.append($createTextNode('Welcome to the playground'));
//     root.append(heading);

//     const quote = $createQuoteNode();
//     quote.append(
//       $createTextNode(
//         `In case you were wondering what the black box at the bottom is – it's the debug view, showing the current state of the editor. ` +
//           `You can disable it by pressing on the settings control in the bottom-left of your screen and toggling the debug view setting.`
//       )
//     );
//     root.append(quote);

//     const paragraph = $createParagraphNode();
//     paragraph.append(
//       $createTextNode('The playground is a demo environment built with '),
//       $createTextNode('@lexical/react').toggleFormat('code'),
//       $createTextNode('.'),
//       $createTextNode(' Try typing in '),
//       $createTextNode('some text').toggleFormat('bold'),
//       $createTextNode(' with '),
//       $createTextNode('different').toggleFormat('italic'),
//       $createTextNode(' formats.')
//     );
//     root.append(paragraph);

//     const paragraph2 = $createParagraphNode();
//     paragraph2.append(
//       $createTextNode(
//         'Make sure to check out the various plugins in the toolbar. You can also use #hashtags or @-mentions too!'
//       )
//     );
//     root.append(paragraph2);

//     const paragraph3 = $createParagraphNode();
//     paragraph3.append($createTextNode(`If you'd like to find out more about Lexical, you can:`));
//     root.append(paragraph3);

//     const list = $createListNode('bullet');
//     list.append(
//       $createListItemNode().append(
//         $createTextNode(`Visit the `),
//         $createLinkNode('https://lexical.dev/').append($createTextNode('Lexical website')),
//         $createTextNode(` for documentation and more information.`)
//       ),
//       $createListItemNode().append(
//         $createTextNode(`Check out the code on our `),
//         $createLinkNode('https://github.com/facebook/lexical').append(
//           $createTextNode('GitHub repository')
//         ),
//         $createTextNode(`.`)
//       ),
//       $createListItemNode().append(
//         $createTextNode(`Playground code can be found `),
//         $createLinkNode(
//           'https://github.com/facebook/lexical/tree/main/packages/lexical-playground'
//         ).append($createTextNode('here')),
//         $createTextNode(`.`)
//       ),
//       $createListItemNode().append(
//         $createTextNode(`Join our `),
//         $createLinkNode('https://discord.com/invite/KmG4wQnnD9').append($createTextNode('Discord Server')),
//         $createTextNode(` and chat with the team.`)
//       )
//     );
//     root.append(list);

//     const paragraph4 = $createParagraphNode();
//     paragraph4.append(
//       $createTextNode(
//         `Lastly, we're constantly adding cool new features to this playground. So make sure you check back here when you next get a chance :).`
//       )
//     );
//     root.append(paragraph4);
//   }
// }

// function getExtraStyles(element) {
//   let extraStyles = '';
//   const fontSize = parseAllowedFontSize(element.style.fontSize);
//   const backgroundColor = parseAllowedColor(element.style.backgroundColor);
//   const color = parseAllowedColor(element.style.color);
//   if (fontSize !== '' && fontSize !== '15px') extraStyles += `font-size: ${fontSize};`;
//   if (backgroundColor !== '' && backgroundColor !== 'rgb(255, 255, 255)') extraStyles += `background-color: ${backgroundColor};`;
//   if (color !== '' && color !== 'rgb(0, 0, 0)') extraStyles += `color: ${color};`;
//   return extraStyles;
// }

// function buildImportMap() {
//   const importMap = {};

//   for (const [tag, fn] of Object.entries(TextNode.importDOM() || {})) {
//     importMap[tag] = (importNode) => {
//       const importer = fn(importNode);
//       if (!importer) return null;
//       return {
//         ...importer,
//         conversion: (element) => {
//           const output = importer.conversion(element);
//           if (output === null || output.forChild === undefined || output.after !== undefined || output.node !== null) return output;
//           const extraStyles = getExtraStyles(element);
//           if (extraStyles) {
//             const {forChild} = output;
//             return {
//               ...output,
//               forChild: (child, parent) => {
//                 const textNode = forChild(child, parent);
//                 if ($isTextNode(textNode)) {
//                   textNode.setStyle(textNode.getStyle() + extraStyles);
//                 }
//                 return textNode;
//               },
//             };
//           }
//           return output;
//         },
//       };
//     };
//   }

//   return importMap;
// }

// function App() {
//   const { settings: {isCollab, emptyEditor, measureTypingPerf} } = useSettings();

//   const app = useMemo(
//     () =>
//       defineExtension({
//         $initialEditorState: isCollab ? null : emptyEditor ? undefined : $prepopulatedRichText,
//         html: { import: buildImportMap() },
//         name: '@lexical/playground',
//         namespace: 'Playground',
//         nodes: PlaygroundNodes,
//         theme: PlaygroundEditorTheme,
//       }),
//     [emptyEditor, isCollab]
//   );

//   return (
//     <LexicalCollaboration>
//       <LexicalExtensionComposer extension={app} contentEditable={null}>
//         <SharedHistoryContext>
//           <TableContext>
//             <ToolbarContext>
//               <header>
//                 <a href="https://lexical.dev" target="_blank" rel="noreferrer">
//                   <img src={logo} alt="Lexical Logo" />
//                 </a>
//               </header>
//               <div className="editor-shell">
//                 <Editor />
//               </div>
//               <Settings />
//               {isDevPlayground && <DocsPlugin />}
//               {isDevPlayground && <PasteLogPlugin />}
//               {isDevPlayground && <TestRecorderPlugin />}
//               {measureTypingPerf && <TypingPerfPlugin />}
//             </ToolbarContext>
//           </TableContext>
//         </SharedHistoryContext>
//       </LexicalExtensionComposer>
//     </LexicalCollaboration>
//   );
// }

// export default function PlaygroundApp() {
//   return (
//     <SettingsContext>
//       <FlashMessageContext>
//         <App />
//       </FlashMessageContext>
//       <a
//         href="https://github.com/facebook/lexical/tree/main/packages/lexical-playground"
//         className="github-corner"
//         aria-label="View source on GitHub"
//       >
//         <svg
//           width="80"
//           height="80"
//           viewBox="0 0 250 250"
//           style={{ border: 0, color: '#eee', fill: '#222', left: 0, position: 'absolute', top: 0, transform: 'scale(-1,1)' }}
//           aria-hidden="true"
//         >
//           <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z" />
//           <path
//             d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2"
//             fill="currentColor"
//             style={{ transformOrigin: '130px 106px' }}
//             className="octo-arm"
//           />
//           <path
//             d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z"
//             fill="currentColor"
//             className="octo-body"
//           />
//         </svg>
//       </a>
//     </SettingsContext>
//   );
// }

"use client";

import "./style.css";
import React, { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { LexicalCollaboration } from "@lexical/react/LexicalCollaborationContext";
import { LexicalExtensionComposer } from "@lexical/react/LexicalExtensionComposer";
import {
  $createParagraphNode,
  $getRoot,
  TextNode,
  $createTextNode,
  $insertNodes,
  KEY_DELETE_COMMAND,
  COMMAND_PRIORITY_HIGH,
  KEY_BACKSPACE_COMMAND,
  $getSelection,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { FlashMessageContext } from "./context/FlashMessageContext";
import { SettingsContext, useSettings } from "./context/SettingsContext";
import { SharedHistoryContext } from "./context/SharedHistoryContext";
import { ToolbarContext } from "./context/ToolbarContext";
import { TableContext } from "./plugins/TablePlugin";

import PlaygroundNodes from "./nodes/PlaygroundNodes";
import PlaygroundEditorTheme from "./themes/PlaygroundEditorTheme";
import DocsPlugin from "./plugins/DocsPlugin";
import PasteLogPlugin from "./plugins/PasteLogPlugin";
import TestRecorderPlugin from "./plugins/TestRecorderPlugin";
import TypingPerfPlugin from "./plugins/TypingPerfPlugin";
import logo from "./images/logo.svg";

// import PDFDownloader from "./ExportPDF";
// import CompanyPlugin from "./plugins/LogoNamePlugin";
// import FooterPlugin from "./plugins/FooterPlugin";
// import { $createDynamicNode } from "./nodes/DynamicNode";
import BodyPlugin from "./plugins/BodyPlugin";
import { $createListItemNode, $createListNode } from "@lexical/list";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
// import { DivNode } from "./nodes/DivNode";
import { FooterNode } from "./nodes/FooterNode";
import Image from "next/image";
import TextImagePlugin from "./plugins/TextImagePlugin";
import { $createTextImageNode } from "./nodes/TextImageNode";
import { $createReadOnlyTextNode } from "./nodes/ReadOnlyTextNode";
import {
  $createTableCellNode,
  $createTableNode,
  $createTableRowNode,
} from "@lexical/table";
import { $createTableBorderCellNode } from "./utils/tableBorderCell";
import { TableBorderCellNode } from "./nodes/TableBorderCellNode";
import { v4 } from "uuid";

// Dynamic client-only import
const ClientEditor = dynamic(() => import("./Editor"), { ssr: false });

// Example PRELOADED JSON
const PRELOADED_JSON = {
  "root": {
    "children": [
      {
        "children": [
          {
            "detail": 0,
            "format": 0,
            "mode": "normal",
            "style": "font-size: 72px;font-family: Verdana;",
            "text": "TItle",
            "type": "text",
            "version": 1,
            "readonly": true
          }
        ],
        "direction": null,
        "format": "center",
        "indent": 0,
        "type": "paragraph",
        "version": 1,
        "textStyle": "font-size: 72px;font-family: Verdana;",
        "textFormat": 0,
        "id": "97a89965-1627-4053-811f-74c1ce1b7590"
      },
      {
        "children": [],
        "direction": null,
        "format": "center",
        "indent": 0,
        "type": "paragraph",
        "version": 1,
        "textStyle": "font-size: 72px;font-family: Verdana;",
        "textFormat": 0,
        "id": "ca947194-c60b-48e0-b408-9c2c3f4e9f6c"
      },
      {
        "children": [],
        "direction": null,
        "format": "center",
        "indent": 0,
        "type": "paragraph",
        "version": 1,
        "textStyle": "font-size: 72px;font-family: Verdana;",
        "textFormat": 0,
        "id": "c842e6cb-ecf5-4f10-85c3-65f18280057c"
      },
      {
        "children": [
          {
            "children": [
              {
                "children": [
                  {
                    "children": [
                      {
                        "detail": 0,
                        "format": 0,
                        "mode": "normal",
                        "style": "",
                        "text": "Srmo",
                        "type": "text",
                        "version": 1,
                        "readonly": true
                      }
                    ],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": "",
                    "id": "b40c64c4-79a2-43b8-ae82-a03a482c2425"
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 3,
                "rowSpan": 1,
                "borders": {
                  "top": true,
                  "bottom": true,
                  "left": true,
                  "right": true
                }
              },
              {
                "children": [
                  {
                    "children": [
                      {
                        "detail": 0,
                        "format": 2,
                        "mode": "normal",
                        "style": "",
                        "text": "Totle:",
                        "type": "text",
                        "version": 1,
                        "readonly": true
                      },
                      {
                        "detail": 0,
                        "format": 0,
                        "mode": "normal",
                        "style": "",
                        "text": "Name",
                        "type": "text",
                        "version": 1,
                        "readonly": true
                      }
                    ],
                    "direction": null,
                    "format": "right",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": "",
                    "id": "f73685d6-c2ca-4ff2-aa4e-b3d168a63605"
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 1,
                "rowSpan": 1,
                "borders": {
                  "top": true,
                  "bottom": true,
                  "left": true,
                  "right": true
                }
              },
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": "",
                    "id": "1b64d5da-2af7-441d-8089-051b0c12e464"
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 1,
                "rowSpan": 1,
                "borders": {
                  "top": true,
                  "bottom": true,
                  "left": true,
                  "right": true
                }
              }
            ],
            "direction": null,
            "format": "",
            "indent": 0,
            "type": "tablerow",
            "version": 1
          },
          {
            "children": [
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": "",
                    "id": "a3a4576c-1f09-4537-b547-0662bd27666c"
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 2,
                "rowSpan": 1,
                "borders": {
                  "top": true,
                  "bottom": true,
                  "left": true,
                  "right": true
                }
              },
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": "",
                    "id": "12c53b2b-a768-4e10-bf47-c2dc1e3b075e"
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 0,
                "rowSpan": 1,
                "borders": {
                  "top": true,
                  "bottom": true,
                  "left": true,
                  "right": true
                }
              },
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": "",
                    "id": "115b504b-e515-4bb3-a05d-b6e54f9341cb"
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 0,
                "rowSpan": 1,
                "borders": {
                  "top": true,
                  "bottom": true,
                  "left": true,
                  "right": true
                }
              }
            ],
            "direction": null,
            "format": "",
            "indent": 0,
            "type": "tablerow",
            "version": 1
          }
        ],
        "direction": null,
        "format": "",
        "indent": 0,
        "type": "table",
        "version": 1,
        "colWidths": [
          92,
          92,
          92
        ]
      },
      {
        "children": [],
        "direction": null,
        "format": "center",
        "indent": 0,
        "type": "paragraph",
        "version": 1,
        "textStyle": "font-size: 72px;font-family: Verdana;",
        "textFormat": 0,
        "id": "86b7ebf2-b922-4f98-81b2-c094ce23e9d1"
      },
      {
        "children": [
          {
            "children": [
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": "",
                    "id": "b676e887-19f6-4799-b0d5-abda6533b1f5"
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 3,
                "rowSpan": 1,
                "borders": {
                  "top": true,
                  "bottom": true,
                  "left": true,
                  "right": true
                }
              },
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": "",
                    "id": "a9df8cbb-c470-47a8-8bdf-4d59968b5336"
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 1,
                "rowSpan": 1,
                "borders": {
                  "top": true,
                  "bottom": true,
                  "left": true,
                  "right": true
                }
              },
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": "",
                    "id": "af64c5ef-f3f8-4f85-9b4a-b2f47a6b22b8"
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 1,
                "rowSpan": 1,
                "borders": {
                  "top": true,
                  "bottom": true,
                  "left": true,
                  "right": true
                }
              },
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": "",
                    "id": "7d29db92-51cf-4786-9415-aa2479d30f49"
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 1,
                "rowSpan": 1,
                "borders": {
                  "top": true,
                  "bottom": true,
                  "left": true,
                  "right": true
                }
              },
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": "",
                    "id": "88c55c72-38c4-4857-ae5e-32bed7f9a5b6"
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 1,
                "rowSpan": 1,
                "borders": {
                  "top": true,
                  "bottom": true,
                  "left": true,
                  "right": true
                }
              }
            ],
            "direction": null,
            "format": "",
            "indent": 0,
            "type": "tablerow",
            "version": 1
          },
          {
            "children": [
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": "",
                    "id": "a48503b0-f0ba-4bea-857f-93815be8f462"
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 2,
                "rowSpan": 1,
                "borders": {
                  "top": true,
                  "bottom": true,
                  "left": true,
                  "right": true
                }
              },
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": "",
                    "id": "4e6f655b-7441-4d7a-aa39-4255821eaa24"
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 0,
                "rowSpan": 1,
                "borders": {
                  "top": true,
                  "bottom": true,
                  "left": true,
                  "right": true
                }
              },
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": "",
                    "id": "f5f068d4-ac32-47bc-b750-748d971a0a1e"
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 0,
                "rowSpan": 1,
                "borders": {
                  "top": true,
                  "bottom": true,
                  "left": true,
                  "right": true
                }
              },
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": "",
                    "id": "ad8ef355-051f-483e-9d30-f0306d44a5f8"
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 0,
                "rowSpan": 1,
                "borders": {
                  "top": true,
                  "bottom": true,
                  "left": true,
                  "right": true
                }
              },
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": "",
                    "id": "677630ae-dc6d-47b3-bd32-008283abfee4"
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 0,
                "rowSpan": 1,
                "borders": {
                  "top": true,
                  "bottom": true,
                  "left": true,
                  "right": true
                }
              }
            ],
            "direction": null,
            "format": "",
            "indent": 0,
            "type": "tablerow",
            "version": 1
          },
          {
            "children": [
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": "",
                    "id": "83eb0ee4-95e5-42a6-a00c-4e8a044c4041"
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 2,
                "rowSpan": 1,
                "borders": {
                  "top": true,
                  "bottom": true,
                  "left": true,
                  "right": true
                }
              },
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": "",
                    "id": "f656b847-5f68-4d71-8935-b0233bcf8e5f"
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 0,
                "rowSpan": 1,
                "borders": {
                  "top": true,
                  "bottom": true,
                  "left": true,
                  "right": true
                }
              },
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": "",
                    "id": "450557dc-f91f-44b6-aea6-8b2bf1f5c58d"
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 0,
                "rowSpan": 1,
                "borders": {
                  "top": true,
                  "bottom": true,
                  "left": true,
                  "right": true
                }
              },
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": "",
                    "id": "1e2d895a-01c2-4d17-a567-3a3db10928d3"
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 0,
                "rowSpan": 1,
                "borders": {
                  "top": true,
                  "bottom": true,
                  "left": true,
                  "right": true
                }
              },
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1,
                    "textFormat": 0,
                    "textStyle": "",
                    "id": "a1c08965-30af-4619-8cee-fd3b455e521d"
                  }
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "tablecell",
                "version": 1,
                "backgroundColor": null,
                "colSpan": 1,
                "headerState": 0,
                "rowSpan": 1,
                "borders": {
                  "top": true,
                  "bottom": true,
                  "left": true,
                  "right": true
                }
              }
            ],
            "direction": null,
            "format": "",
            "indent": 0,
            "type": "tablerow",
            "version": 1
          }
        ],
        "direction": null,
        "format": "",
        "indent": 0,
        "type": "table",
        "version": 1,
        "colWidths": [
          92,
          92,
          92,
          92,
          92
        ]
      },
      {
        "children": [],
        "direction": null,
        "format": "center",
        "indent": 0,
        "type": "paragraph",
        "version": 1,
        "textStyle": "font-size: 72px;font-family: Verdana;",
        "textFormat": 0,
        "id": "f38509bb-7ab5-49bb-833e-78082021d08b"
      }
    ]
  }
};

function flattenTablesToRoot(json) {
  const rootChildren = [];

  function traverse(node) {
    if (!node) return;

    if (node.type === "paragraph") {
      rootChildren.push(node);
    } else if (node.type === "table") {
      rootChildren.push(node);

      // Check for nested tables in table cells
      node.children?.forEach((row) => {
        if (row.type === "tablerow") {
          row.children?.forEach((cell) => {
            if (cell.type === "custom-table-cell") {
              const newChildren = [];
              cell.children?.forEach((child) => {
                if (child.type === "table") {
                  traverse(child); // pull nested table to root
                } else {
                  newChildren.push(child); // keep other children
                }
              });
              cell.children = newChildren;
            }
          });
        }
      });
    } else if (node.children) {
      node.children.forEach(traverse);
    }
  }

  json.root.children.forEach(traverse);

  return { root: { children: rootChildren } };
}

// Convert JSON to Lexical Nodes
function createNodesFromJSON(nodeJSON) {
  if (!nodeJSON) return null;
  const nodeKey = nodeJSON.id || undefined; // reuse existing id

  switch (nodeJSON.type) {
    case "paragraph": {
      const para = $createParagraphNode(nodeKey);

      // ✅ Assign the format to Lexical's __format property
      if (nodeJSON.format) {
        para.setFormat(nodeJSON.format);
      }

      if (nodeJSON.style) para.__style = nodeJSON.style;

      nodeJSON.children?.forEach((child) => {
        const childNode = createNodesFromJSON(child);
        if (childNode) para.append(childNode);
      });

      return para;
    }

    case "text":
    case "readonly-text": {
      const text = nodeJSON.text || "";
      let node;
      if (nodeJSON.readonly) {
        node = $createReadOnlyTextNode(text, nodeKey);
      } else {
        node = $createTextNode(text, nodeKey);
      }

      // ✅ Preserve style and format
      if (nodeJSON.style) node.__style = nodeJSON.style;
      if (nodeJSON.format) node.__format = nodeJSON.format;

      return node;
    }

    case "table": {
      const tableNode = $createTableNode(nodeKey);
      if (nodeJSON.colWidths) {
        tableNode.__colWidths = [...nodeJSON.colWidths];
      }

      // ✅ Assign table-level format
      if (nodeJSON.format) tableNode.__format = nodeJSON.format;

      nodeJSON.children?.forEach((row) => {
        const rowNode = createNodesFromJSON(row);
        if (rowNode) tableNode.append(rowNode);
      });
      return tableNode;
    }

    case "tablerow": {
      const rowNode = $createTableRowNode(nodeKey);

      if (nodeJSON.format) rowNode.__format = nodeJSON.format;

      nodeJSON.children?.forEach((cell) => {
        const cellNode = createNodesFromJSON(cell);
        if (cellNode) rowNode.append(cellNode);
      });
      return rowNode;
    }

    case "tablecell":
    case "custom-table-cell": {
      const cellNode = new TableBorderCellNode(
        nodeJSON.headerState ?? 0,
        nodeJSON.borders ?? { top: true, bottom: true, left: true, right: true }
      );

      if (nodeJSON.format) cellNode.__format = nodeJSON.format;

      nodeJSON.children?.forEach((child) => {
        const childNode = createNodesFromJSON(child);
        if (childNode) cellNode.append(childNode);
      });

      return cellNode;
    }

    default: {
      if (nodeJSON.children?.length) {
        const container = $createParagraphNode(nodeKey);
        nodeJSON.children.forEach((child) => {
          const node = createNodesFromJSON(child);
          if (node) container.append(node);
        });
        return container;
      }
      return null;
    }
  }
}

function addDefaultBordersToJSON(json) {
  function traverse(node) {
    console.log("node::::::::::::::::>>>>>>>>>>>>>>>>>>>>>>>",node);
    if (!node) return;
    if (node.type === "tablecell" || node.type === "custom-table-cell") {
      if (!node.borders) {
        node.borders = { top: true, bottom: true, left: true, right: true };
      }
    }
    if (node.children?.length) node.children.forEach(traverse);
  }
  traverse(json.root);
  return json;
}

function preserveOuterFormat(json) {
  function traverse(node) {
    if (!node) return;

    if (node.type === "paragraph" || node.type === "tablerow" || node.type === "table") {
      node.__originalFormat = node.format || "";
    }

    if (node.children?.length) {
      node.children.forEach(traverse);
    }
  }
  traverse(json.root);
  return json;
}


function splitTextByFirstSpaceOrColon(json) {
  function traverse(node) {
    if (!node || !node.children) return;

    node.children.forEach((child) => {
      // Recurse first
      traverse(child);

      if (child.type === "paragraph" && child.children) {
        const newChildren = [];

        child.children.forEach((textNode) => {
          if (textNode.type === "text" && textNode.text) {
            // Find first space or colon
            const match = textNode.text.match(/:/);
            if (match) {
              const index = match.index + 1; // include the space/colon
              const firstPart = textNode.text.slice(0, index);
              const secondPart = textNode.text.slice(index);

              newChildren.push({
                ...textNode,
                text: firstPart,
              });

              if (secondPart) {
                newChildren.push({
                  ...textNode,
                  text: secondPart,
                });
              }
            } else {
              newChildren.push(textNode);
            }
          } else {
            newChildren.push(textNode);
          }
        });

        child.children = newChildren;
      }
    });
  }

  traverse(json.root);
  return json;
}

function addReadonlyFlagToTextNodes(json) {
  if (!json) return;

  function traverse(node) {
    if (!node) return;

    // If this is a text node, add readonly field
    if (node.type === "text") {
      node.readonly = true;
    }

    // Recursively process children
    if (node.children?.length) {
      node.children.forEach(traverse);
    }
  }

  traverse(json.root);
  return json;
}

// Editor wrapper to preload JSON
export function ClientEditorWrapper({ preloadedJSON }) {
  const [editor] = useLexicalComposerContext();
  const [loaded, setLoaded] = useState(false);

  // ✅ 1️⃣ Keep your full preload logic as-is
  useEffect(() => {
    if (!preloadedJSON || loaded) return;

    const borderedJSON = addDefaultBordersToJSON(preloadedJSON);
    const splitJSON = splitTextByFirstSpaceOrColon(borderedJSON);
    const updatedJSON = addReadonlyFlagToTextNodes(splitJSON);
    const preservedJSON = preserveOuterFormat(updatedJSON);
    const flattenedJSON = flattenTablesToRoot(preservedJSON);

    editor.update(() => {
      const root = $getRoot();
      root.clear();

      flattenedJSON.root.children.forEach((nodeJSON) => {
        const node = createNodesFromJSON(nodeJSON);
        if (node) root.append(node);
      });
    });

    setLoaded(true);
  }, [editor, preloadedJSON, loaded]);

  // ✅ 2️⃣ Add protection for readonly-text nodes
  useEffect(() => {
    // Helper to check if current selection has readonly nodes
    const isReadonlySelected = () => {
      const selection = $getSelection();
      if (!selection) return false;
      const nodes = selection.getNodes();
      return nodes.some(
        (node) => node?.readonly || node.__type === "readonly-text"
      );
    };

    // 🧱 Prevent delete key
    const unregisterDelete = editor.registerCommand(
      KEY_DELETE_COMMAND,
      (event) => {
        if (isReadonlySelected()) {
          event?.preventDefault?.();
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );

    // 🧱 Prevent backspace key
    const unregisterBackspace = editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      (event) => {
        if (isReadonlySelected()) {
          event?.preventDefault?.();
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );

    // 🚫 Block typing inside readonly-text nodes
    const unregisterRootListener = editor.registerRootListener(() => {
      const rootElement = editor.getRootElement();
      if (!rootElement) return;

      const handleKeyDown = (event) => {
        editor.update(() => {
          const selection = $getSelection();
          if (!selection) return;
          const nodes = selection.getNodes();
          const hasReadonly = nodes.some(
            (node) => node?.readonly || node.__type === "readonly-text"
          );
          if (hasReadonly) {
            event.preventDefault();
          }
        });
      };

      rootElement.addEventListener("keydown", handleKeyDown);
      return () => rootElement.removeEventListener("keydown", handleKeyDown);
    });

    const useTableCellBorders = () => {
      const unregister = editor.registerNodeTransform(TableBorderCellNode, (node) => {
        // Only add borders if they don't exist
        if (!node.__borders) {
          node.__borders = { top: true, bottom: true, left: true, right: true };
        }  
    })
  }

    
    // 🧹 Cleanup listeners on unmount
    return () => {
      unregisterDelete();
      unregisterBackspace();
      unregisterRootListener();
      useTableCellBorders();
    };
  }, [editor]);

  // ✅ 3️⃣ Render your editor
  return <ClientEditor userRole="admin" />;
}

// Export button
function ExportButton() {
  const [editor] = useLexicalComposerContext();
  const [jsonData, setJsonData] = useState(PRELOADED_JSON);

  useEffect(() => {
    const unregister = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        setJsonData(editorState.toJSON());
      });
    });
    return () => unregister();
  }, []);

  const handleDownloadJSON = () => {
    let json = jsonData;

    // 1️⃣ Add default borders
    json = addDefaultBordersToJSON(json);

    // 2️⃣ Split text nodes
    json = splitTextByFirstSpaceOrColon(json);

    // 3️⃣ Add readonly flags
    json = addReadonlyFlagToTextNodes(json);

    // 4️⃣ Flatten nested tables
    json = flattenTablesToRoot(json);

    // 5️⃣ Generate new IDs for every node
    function assignUUIDRecursively(node) {
      if (['text', 'readonly-text', 'custom-table-cell'].includes(node.type) && !node.id) {
        node.id = v4();
      }
  
      if (node.children?.length) {
        node.children.forEach(assignUUIDRecursively);
      }
    }
    assignUUIDRecursively(json.root);

    // Export JSON
    const dataStr = JSON.stringify(json, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "editor-content.json";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ marginTop: "10px" }}>
      <h4>Live JSON Output</h4>
      <pre
        style={{
          maxHeight: "300px",
          overflow: "auto",
          background: "#1e1e1e",
          color: "#fff",
          padding: "10px",
        }}
      >
        {JSON.stringify(jsonData, null, 2)}
      </pre>
      <button onClick={handleDownloadJSON}>Export JSON</button>
    </div>
  );
}

// Main App
function App() {
  const { settings } = useSettings();
  const { isCollab, emptyEditor, measureTypingPerf } = settings;

  const appExtension = useMemo(
    () => ({
      name: "@lexical/playground",
      namespace: "Playground",
      nodes: [...PlaygroundNodes],
      theme: PlaygroundEditorTheme,
      onError: (error) => {
        console.error("Lexical Editor Error:", error);
      },
    }),
    []
  );

  return (
    <LexicalCollaboration>
      <LexicalComposer initialConfig={appExtension}>
        <SharedHistoryContext>
          <TableContext>
            <ToolbarContext>
              <header className="text-editor-header">
                <a href="https://lexical.dev" target="_blank" rel="noreferrer">
                  <Image
                    src={logo}
                    alt="Lexical Logo"
                    width={100} // specify width
                    height={100} // specify height
                  />
                </a>
              </header>

              <div className="editor-shell">
                <ClientEditorWrapper preloadedJSON={PRELOADED_JSON} />
                {/* <TextImagePlugin /> */}
                {/* <CompanyPlugin /> */}
                {/* <FooterPlugin /> */}
                {/* <BodyPlugin /> */}
                <ExportButton />
              </div>
              {isCollab && <DocsPlugin />}
              {isCollab && <PasteLogPlugin />}
              {isCollab && <TestRecorderPlugin />}
              {measureTypingPerf && <TypingPerfPlugin />}
            </ToolbarContext>
          </TableContext>
        </SharedHistoryContext>
      </LexicalComposer>
    </LexicalCollaboration>
  );
}

// Final export
export default function PlaygroundApp() {
  return (
    <SettingsContext>
      <FlashMessageContext>
        <App />
      </FlashMessageContext>
    </SettingsContext>
  );
}
