/**
 * Converted to plain JS from the TypeScript reference.
 *
 * Keep the same dependencies you used before:
 * - @lexical/react/LexicalComposerContext
 * - @lexical/table
 * - @lexical/utils
 * - lexical
 * - react, react-dom
 * - your local useModal, ColorPicker, DropDown, DropDownItem
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalEditable } from '@lexical/react/useLexicalEditable';
import {
  $computeTableMapSkipCellCheck,
  $deleteTableColumnAtSelection,
  $deleteTableRowAtSelection,
  $getNodeTriplet,
  $getTableCellNodeFromLexicalNode,
  $getTableColumnIndexFromTableCellNode,
  $getTableNodeFromLexicalNodeOrThrow,
  $getTableRowIndexFromTableCellNode,
  $insertTableColumnAtSelection,
  $insertTableRowAtSelection,
  $isTableCellNode,
  $isTableSelection,
  $mergeCells,
  $unmergeCell,
  getTableElement,
  getTableObserverFromTableElement,
  TableCellHeaderStates,
  TableCellNode,
} from '@lexical/table';
import { mergeRegister } from '@lexical/utils';
import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
  $setSelection,
  COMMAND_PRIORITY_CRITICAL,
  getDOMSelection,
  isDOMNode,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import useModal from '../../hooks/useModal';
import ColorPicker from '../../ui/ColorPicker';
import DropDown, { DropDownItem } from '../../ui/DropDown';
import { TableBorderCellNode } from '../../nodes/TableBorderCellNode';

function computeSelectionCount(selection) {
  const selectionShape = selection.getShape();
  return {
    columns: selectionShape.toX - selectionShape.fromX + 1,
    rows: selectionShape.toY - selectionShape.fromY + 1,
  };
}

function $canUnmerge() {
  const selection = $getSelection();
  if (
    ($isRangeSelection(selection) && !selection.isCollapsed()) ||
    ($isTableSelection(selection) && !selection.anchor.is(selection.focus)) ||
    (!$isRangeSelection(selection) && !$isTableSelection(selection))
  ) {
    return false;
  }
  const [cell] = $getNodeTriplet(selection.anchor);
  return cell.__colSpan > 1 || cell.__rowSpan > 1;
}

function $selectLastDescendant(node) {
  const lastDescendant = node.getLastDescendant();
  if ($isTextNode(lastDescendant)) {
    lastDescendant.select();
  } else if ($isElementNode(lastDescendant)) {
    lastDescendant.selectEnd();
  } else if (lastDescendant !== null) {
    lastDescendant.selectNext();
  }
}

function currentCellBackgroundColor(editor) {
  return editor.getEditorState().read(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection) || $isTableSelection(selection)) {
      const [cell] = $getNodeTriplet(selection.anchor);
      if ($isTableCellNode(cell)) {
        return cell.getBackgroundColor();
      }
    }
    return null;
  });
}

function TableActionMenu({
  onClose,
  tableCellNode: _tableCellNode,
  setIsMenuOpen,
  contextRef,
  cellMerge,
  showColorPickerModal,
}) {
  const [editor] = useLexicalComposerContext();
  const dropDownRef = useRef(null);
  const [tableCellNode, updateTableCellNode] = useState(_tableCellNode);
  const [selectionCounts, updateSelectionCounts] = useState({
    columns: 1,
    rows: 1,
  });
  const [canMergeCells, setCanMergeCells] = useState(false);
  const [canUnmergeCell, setCanUnmergeCell] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState(
    () => currentCellBackgroundColor(editor) || '',
  );

  useEffect(() => {
    // Listen for mutations on the specific TableCellNode to update UI
    return editor.registerMutationListener(
      TableCellNode,
      (nodeMutations) => {
        // nodeMutations maps nodeKey -> mutationType
        const nodeUpdated =
          nodeMutations.get(tableCellNode.getKey()) === 'updated';

        if (nodeUpdated) {
          editor.getEditorState().read(() => {
            updateTableCellNode(tableCellNode.getLatest());
          });
          setBackgroundColor(currentCellBackgroundColor(editor) || '');
        }
      },
      { skipInitialization: true },
    );
  }, [editor, tableCellNode]);

  useEffect(() => {
    // compute merge / unmerge availability on load and when editor state changes
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isTableSelection(selection)) {
        const currentSelectionCounts = computeSelectionCount(selection);
        updateSelectionCounts(currentSelectionCounts);
        setCanMergeCells(
          currentSelectionCounts.columns > 1 ||
          currentSelectionCounts.rows > 1,
        );
      }
      setCanUnmergeCell($canUnmerge());
    });
  }, [editor]);

  useEffect(() => {
    const menuButtonElement = contextRef.current;
    const dropDownElement = dropDownRef.current;
    const rootElement = editor.getRootElement();

    if (menuButtonElement && dropDownElement && rootElement) {
      const rootEleRect = rootElement.getBoundingClientRect();
      const menuButtonRect = menuButtonElement.getBoundingClientRect();
      dropDownElement.style.opacity = '1';
      const dropDownElementRect = dropDownElement.getBoundingClientRect();
      const margin = 5;
      let leftPosition = menuButtonRect.right + margin;
      if (
        leftPosition + dropDownElementRect.width > window.innerWidth ||
        leftPosition + dropDownElementRect.width > rootEleRect.right
      ) {
        const position = menuButtonRect.left - dropDownElementRect.width - margin;
        leftPosition = (position < 0 ? margin : position) + window.pageXOffset;
      }
      dropDownElement.style.left = `${leftPosition + window.pageXOffset}px`;

      let topPosition = menuButtonRect.top;
      if (topPosition + dropDownElementRect.height > window.innerHeight) {
        const position = menuButtonRect.bottom - dropDownElementRect.height;
        topPosition = position < 0 ? margin : position;
      }
      dropDownElement.style.top = `${topPosition}px`;
    }
  }, [contextRef, editor]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropDownRef.current &&
        contextRef.current &&
        isDOMNode(event.target) &&
        !dropDownRef.current.contains(event.target) &&
        !contextRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [setIsMenuOpen, contextRef]);

  const toggleTableCellBorder = useCallback((side) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!selection) return;
  
      const toggleBorders = (cell) => {
        if (!(cell instanceof TableBorderCellNode)) return;
  
        const borders = { ...cell.getBorders() };
  
        // Ensure the border exists; if not, initialize as false
        if (!(side.toLowerCase() in borders)) {
          borders[side.toLowerCase()] = false;
        }
  
        // Toggle the value
        borders[side.toLowerCase()] = !borders[side.toLowerCase()];
        cell.setBorders(borders);
      };
  
      if ($isRangeSelection(selection)) {
        const [cell] = $getNodeTriplet(selection.anchor);
        toggleBorders(cell);
      }
  
      if ($isTableSelection(selection)) {
        selection.getNodes().forEach((node) => toggleBorders(node));
      }
    });
  }, [editor]);
  


  const clearTableSelection = useCallback(() => {
    editor.update(() => {
      if (tableCellNode.isAttached()) {
        const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
        const tableElement = getTableElement(
          tableNode,
          editor.getElementByKey(tableNode.getKey()),
        );

        if (!tableElement) {
          throw new Error('TableActionMenu: Expected to find tableElement in DOM');
        }

        const tableObserver = getTableObserverFromTableElement(tableElement);
        if (tableObserver) {
          tableObserver.$clearHighlight();
        }

        tableNode.markDirty();
        updateTableCellNode(tableCellNode.getLatest());
      }
      $setSelection(null);
    });
  }, [editor, tableCellNode]);

  const mergeTableCellsAtSelection = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isTableSelection(selection)) return;

      const nodes = selection.getNodes();
      const tableCells = nodes.filter($isTableCellNode);
      const targetCell = $mergeCells(tableCells);

      if (targetCell) {
        $selectLastDescendant(targetCell);
        onClose();
      }
    });
  }, [editor, onClose]);

  const unmergeTableCellsAtSelection = useCallback(() => {
    editor.update(() => {
      $unmergeCell();
    });
  }, [editor]);

  const insertTableRowAtSelection = useCallback(
    (shouldInsertAfter) => {
      editor.update(() => {
        for (let i = 0; i < selectionCounts.rows; i++) {
          $insertTableRowAtSelection(shouldInsertAfter);
        }
        onClose();
      });
    },
    [editor, onClose, selectionCounts.rows],
  );

  const insertTableColumnAtSelection = useCallback(
    (shouldInsertAfter) => {
      editor.update(() => {
        for (let i = 0; i < selectionCounts.columns; i++) {
          $insertTableColumnAtSelection(shouldInsertAfter);
        }
        onClose();
      });
    },
    [editor, onClose, selectionCounts.columns],
  );

  const deleteTableRowAtSelection = useCallback(() => {
    editor.update(() => {
      $deleteTableRowAtSelection();
      onClose();
    });
  }, [editor, onClose]);

  const deleteTableAtSelection = useCallback(() => {
    editor.update(() => {
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
      tableNode.remove();
      clearTableSelection();
      onClose();
    });
  }, [editor, tableCellNode, clearTableSelection, onClose]);

  const deleteTableColumnAtSelection = useCallback(() => {
    editor.update(() => {
      $deleteTableColumnAtSelection();
      onClose();
    });
  }, [editor, onClose]);

  const toggleTableRowIsHeader = useCallback(() => {
    editor.update(() => {
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
      const tableRowIndex = $getTableRowIndexFromTableCellNode(tableCellNode);
      const [gridMap] = $computeTableMapSkipCellCheck(tableNode, null, null);
      const rowCells = new Set();
      const newStyle = tableCellNode.getHeaderStyles() ^ TableCellHeaderStates.ROW;

      for (let col = 0; col < gridMap[tableRowIndex].length; col++) {
        const mapCell = gridMap[tableRowIndex][col];
        if (!mapCell?.cell) continue;

        if (!rowCells.has(mapCell.cell)) {
          rowCells.add(mapCell.cell);
          mapCell.cell.setHeaderStyles(newStyle, TableCellHeaderStates.ROW);
        }
      }
      clearTableSelection();
      onClose();
    });
  }, [editor, tableCellNode, clearTableSelection, onClose]);

  const toggleTableColumnIsHeader = useCallback(() => {
    editor.update(() => {
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
      const tableColumnIndex = $getTableColumnIndexFromTableCellNode(tableCellNode);
      const [gridMap] = $computeTableMapSkipCellCheck(tableNode, null, null);
      const columnCells = new Set();
      const newStyle = tableCellNode.getHeaderStyles() ^ TableCellHeaderStates.COLUMN;

      for (let row = 0; row < gridMap.length; row++) {
        const mapCell = gridMap[row][tableColumnIndex];
        if (!mapCell?.cell) continue;

        if (!columnCells.has(mapCell.cell)) {
          columnCells.add(mapCell.cell);
          mapCell.cell.setHeaderStyles(newStyle, TableCellHeaderStates.COLUMN);
        }
      }
      clearTableSelection();
      onClose();
    });
  }, [editor, tableCellNode, clearTableSelection, onClose]);

  const toggleRowStriping = useCallback(() => {
    editor.update(() => {
      if (tableCellNode.isAttached()) {
        const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
        if (tableNode) {
          tableNode.setRowStriping(!tableNode.getRowStriping());
        }
      }
      clearTableSelection();
      onClose();
    });
  }, [editor, tableCellNode, clearTableSelection, onClose]);

  const toggleFirstRowFreeze = useCallback(() => {
    editor.update(() => {
      if (tableCellNode.isAttached()) {
        const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
        if (tableNode) {
          tableNode.setFrozenRows(tableNode.getFrozenRows() === 0 ? 1 : 0);
        }
      }
      clearTableSelection();
      onClose();
    });
  }, [editor, tableCellNode, clearTableSelection, onClose]);

  const toggleFirstColumnFreeze = useCallback(() => {
    editor.update(() => {
      if (tableCellNode.isAttached()) {
        const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
        if (tableNode) {
          tableNode.setFrozenColumns(tableNode.getFrozenColumns() === 0 ? 1 : 0);
        }
      }
      clearTableSelection();
      onClose();
    });
  }, [editor, tableCellNode, clearTableSelection, onClose]);

  const handleCellBackgroundColor = useCallback((value) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) || $isTableSelection(selection)) {
        const [cell] = $getNodeTriplet(selection.anchor);
        if ($isTableCellNode(cell)) {
          cell.setBackgroundColor(value);
        }

        if ($isTableSelection(selection)) {
          const nodes = selection.getNodes();
          for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if ($isTableCellNode(node)) {
              node.setBackgroundColor(value);
            }
          }
        }
      }
    });
  }, [editor]);

  const formatVerticalAlign = useCallback((value) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) || $isTableSelection(selection)) {
        const [cell] = $getNodeTriplet(selection.anchor);
        if ($isTableCellNode(cell)) {
          cell.setVerticalAlign(value);
        }

        if ($isTableSelection(selection)) {
          const nodes = selection.getNodes();
          for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if ($isTableCellNode(node)) {
              node.setVerticalAlign(value);
            }
          }
        }
      }
    });
  }, [editor]);

  let mergeCellButton = null;
  if (cellMerge) {
    if (canMergeCells) {
      mergeCellButton = (
        <button
          type="button"
          className="item"
          onClick={() => mergeTableCellsAtSelection()}
          data-test-id="table-merge-cells"
        >
          <span className="text">Merge cells</span>
        </button>
      );
    } else if (canUnmergeCell) {
      mergeCellButton = (
        <button
          type="button"
          className="item"
          onClick={() => unmergeTableCellsAtSelection()}
          data-test-id="table-unmerge-cells"
        >
          <span className="text">Unmerge cells</span>
        </button>
      );
    }
  }

  return createPortal(
    <div
    className="dropdown"
      ref={dropDownRef}
      onClick={(e) => {
        e.stopPropagation();
      }}
      style={{ opacity: 0 }}
      >
      <button type='button' className='item' onClick={()=>toggleTableCellBorder('Top')}>
        <span className='text'>Top border hide</span>
      </button>
            <button type='button' className='item' onClick={()=>toggleTableCellBorder('Bottom')}>
        <span className='text'>Bottom border hide</span>
      </button>
            <button type='button' className='item' onClick={()=>toggleTableCellBorder('Left')}>
        <span className='text'>Left border hide</span>
      </button>
            <button type='button' className='item' onClick={()=>toggleTableCellBorder('Right')}>
        <span className='text'>Right border hide</span>
      </button>
      {mergeCellButton}
      <button
        type="button"
        className="item"
        onClick={() =>
          showColorPickerModal('Cell background color', () => (
            <ColorPicker color={backgroundColor} onChange={handleCellBackgroundColor} />
          ))
        }
        data-test-id="table-background-color"
      >
        <span className="text">Background color</span>
      </button>

      <button
        type="button"
        className="item"
        onClick={() => toggleRowStriping()}
        data-test-id="table-row-striping"
      >
        <span className="text">Toggle Row Striping</span>
      </button>

      <DropDown
        buttonLabel="Vertical Align"
        buttonClassName="item"
        buttonAriaLabel="Formatting options for vertical alignment"
      >
        <DropDownItem
          onClick={() => {
            formatVerticalAlign('top');
          }}
          className="item wide"
        >
          <div className="icon-text-container">
            <i className="icon vertical-top" />
            <span className="text">Top Align</span>
          </div>
        </DropDownItem>
        <DropDownItem
          onClick={() => {
            formatVerticalAlign('middle');
          }}
          className="item wide"
        >
          <div className="icon-text-container">
            <i className="icon vertical-middle" />
            <span className="text">Middle Align</span>
          </div>
        </DropDownItem>
        <DropDownItem
          onClick={() => {
            formatVerticalAlign('bottom');
          }}
          className="item wide"
        >
          <div className="icon-text-container">
            <i className="icon vertical-bottom" />
            <span className="text">Bottom Align</span>
          </div>
        </DropDownItem>
      </DropDown>

      <button
        type="button"
        className="item"
        onClick={() => toggleFirstRowFreeze()}
        data-test-id="table-freeze-first-row"
      >
        <span className="text">Toggle First Row Freeze</span>
      </button>

      <button
        type="button"
        className="item"
        onClick={() => toggleFirstColumnFreeze()}
        data-test-id="table-freeze-first-column"
      >
        <span className="text">Toggle First Column Freeze</span>
      </button>

      <hr />

      <button
        type="button"
        className="item"
        onClick={() => insertTableRowAtSelection(false)}
        data-test-id="table-insert-row-above"
      >
        <span className="text">
          Insert {selectionCounts.rows === 1 ? 'row' : `${selectionCounts.rows} rows`} above
        </span>
      </button>

      <button
        type="button"
        className="item"
        onClick={() => insertTableRowAtSelection(true)}
        data-test-id="table-insert-row-below"
      >
        <span className="text">
          Insert {selectionCounts.rows === 1 ? 'row' : `${selectionCounts.rows} rows`} below
        </span>
      </button>

      <hr />

      <button
        type="button"
        className="item"
        onClick={() => insertTableColumnAtSelection(false)}
        data-test-id="table-insert-column-before"
      >
        <span className="text">
          Insert {selectionCounts.columns === 1 ? 'column' : `${selectionCounts.columns} columns`} left
        </span>
      </button>

      <button
        type="button"
        className="item"
        onClick={() => insertTableColumnAtSelection(true)}
        data-test-id="table-insert-column-after"
      >
        <span className="text">
          Insert {selectionCounts.columns === 1 ? 'column' : `${selectionCounts.columns} columns`} right
        </span>
      </button>

      <hr />

      <button
        type="button"
        className="item"
        onClick={() => deleteTableColumnAtSelection()}
        data-test-id="table-delete-columns"
      >
        <span className="text">Delete column</span>
      </button>

      <button
        type="button"
        className="item"
        onClick={() => deleteTableRowAtSelection()}
        data-test-id="table-delete-rows"
      >
        <span className="text">Delete row</span>
      </button>

      <button
        type="button"
        className="item"
        onClick={() => deleteTableAtSelection()}
        data-test-id="table-delete"
      >
        <span className="text">Delete table</span>
      </button>

      <hr />

      <button
        type="button"
        className="item"
        onClick={() => toggleTableRowIsHeader()}
        data-test-id="table-row-header"
      >
        <span className="text">
          {(tableCellNode.__headerState & TableCellHeaderStates.ROW) === TableCellHeaderStates.ROW ? 'Remove' : 'Add'} row header
        </span>
      </button>

      <button
        type="button"
        className="item"
        onClick={() => toggleTableColumnIsHeader()}
        data-test-id="table-column-header"
      >
        <span className="text">
          {(tableCellNode.__headerState & TableCellHeaderStates.COLUMN) === TableCellHeaderStates.COLUMN ? 'Remove' : 'Add'} column header
        </span>
      </button>
    </div>,
    document.body,
  );
}

function TableCellActionMenuContainer({ anchorElem, cellMerge }) {
  const [editor] = useLexicalComposerContext();

  const menuButtonRef = useRef(null);
  const menuRootRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tableCellNode, setTableMenuCellNode] = useState(null);
  const [colorPickerModal, showColorPickerModal] = useModal();

  const checkTableCellOverflow = useCallback((tableCellParentNodeDOM) => {
    const scrollableContainer = tableCellParentNodeDOM.closest('.PlaygroundEditorTheme__tableScrollableWrapper');
    if (scrollableContainer) {
      const containerRect = scrollableContainer.getBoundingClientRect();
      const cellRect = tableCellParentNodeDOM.getBoundingClientRect();
      const actionButtonRight = cellRect.right - 5;
      const actionButtonLeft = actionButtonRight - 28; // button width + padding
      if (actionButtonRight > containerRect.right || actionButtonLeft < containerRect.left) {
        return true;
      }
    }
    return false;
  }, []);

  const $moveMenu = useCallback(() => {
    const menu = menuButtonRef.current;
    const selection = $getSelection();
    const nativeSelection = getDOMSelection(editor._window);
    const activeElement = document.activeElement;

    function disable() {
      if (menu) {
        menu.classList.remove('table-cell-action-button-container--active');
        menu.classList.add('table-cell-action-button-container--inactive');
      }
      setTableMenuCellNode(null);
    }

    if (!selection || !menu) return disable();

    const rootElement = editor.getRootElement();
    let tableObserver = null;
    let tableCellParentNodeDOM = null;

    if ($isRangeSelection(selection) && rootElement && nativeSelection && rootElement.contains(nativeSelection.anchorNode)) {
      const tableCellNodeFromSelection = $getTableCellNodeFromLexicalNode(selection.anchor.getNode());
      if (!tableCellNodeFromSelection) return disable();

      tableCellParentNodeDOM = editor.getElementByKey(tableCellNodeFromSelection.getKey());
      if (!tableCellParentNodeDOM || !tableCellNodeFromSelection.isAttached()) return disable();

      if (checkTableCellOverflow(tableCellParentNodeDOM)) return disable();

      const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNodeFromSelection);
      const tableElement = getTableElement(tableNode, editor.getElementByKey(tableNode.getKey()));
      if (!tableElement) throw new Error('TableActionMenu: Expected to find tableElement in DOM');

      tableObserver = getTableObserverFromTableElement(tableElement);
      setTableMenuCellNode(tableCellNodeFromSelection);
    } else if ($isTableSelection(selection)) {
      const anchorNode = $getTableCellNodeFromLexicalNode(selection.anchor.getNode());
      if (!$isTableCellNode(anchorNode)) throw new Error('TableSelection anchorNode must be a TableCellNode');
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(anchorNode);
      const tableElement = getTableElement(tableNode, editor.getElementByKey(tableNode.getKey()));
      if (!tableElement) throw new Error('TableActionMenu: Expected to find tableElement in DOM');

      tableObserver = getTableObserverFromTableElement(tableElement);
      tableCellParentNodeDOM = editor.getElementByKey(anchorNode.getKey());
      if (!tableCellParentNodeDOM) return disable();
      if (checkTableCellOverflow(tableCellParentNodeDOM)) return disable();
      setTableMenuCellNode(anchorNode);
    } else if (!activeElement) {
      return disable();
    }

    if (!tableObserver || !tableCellParentNodeDOM) return disable();

    const enabled = !tableObserver || !tableObserver.isSelecting;
    menu.classList.toggle('table-cell-action-button-container--active', enabled);
    menu.classList.toggle('table-cell-action-button-container--inactive', !enabled);

    if (enabled) {
      const tableCellRect = tableCellParentNodeDOM.getBoundingClientRect();
      const anchorRect = anchorElem.getBoundingClientRect();
      const top = tableCellRect.top - anchorRect.top;
      const left = tableCellRect.right - anchorRect.left;
      menu.style.transform = `translate(${left}px, ${top}px)`;
    }
  }, [editor, anchorElem, checkTableCellOverflow]);

  useEffect(() => {
    // call $moveMenu on selection changes, pointerup and once on mount
    let timeoutId;
    const callback = () => {
      timeoutId = undefined;
      editor.getEditorState().read($moveMenu);
    };
    const delayedCallback = () => {
      if (timeoutId === undefined) timeoutId = setTimeout(callback, 0);
      return false;
    };

    const unregisters = [
      editor.registerUpdateListener(delayedCallback),
      editor.registerCommand(SELECTION_CHANGE_COMMAND, delayedCallback, COMMAND_PRIORITY_CRITICAL),
      editor.registerRootListener((rootElement, prevRootElement) => {
        if (prevRootElement) prevRootElement.removeEventListener('pointerup', delayedCallback);
        if (rootElement) {
          rootElement.addEventListener('pointerup', delayedCallback);
          delayedCallback();
        }
      }),
    ];

    return () => {
      // cleanup
      unregisters.forEach((u) => {
        if (typeof u === 'function') u();
      });
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [editor, $moveMenu]);

  const prevTableCellNode = useRef(tableCellNode);
  useEffect(() => {
    if (prevTableCellNode.current !== tableCellNode) {
      setIsMenuOpen(false);
    }
    prevTableCellNode.current = tableCellNode;
  }, [tableCellNode]);

  return (
    <div className="table-cell-action-button-container" ref={menuButtonRef}>
      {tableCellNode && (
        <>
          <button
            type="button"
            className="table-cell-action-button chevron-down"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            ref={menuRootRef}
          >
            <i className="chevron-down" />
          </button>
          {colorPickerModal}
          {isMenuOpen && (
            <TableActionMenu
              contextRef={menuRootRef}
              setIsMenuOpen={setIsMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              tableCellNode={tableCellNode}
              cellMerge={cellMerge}
              showColorPickerModal={showColorPickerModal}
            />
          )}
        </>
      )}
    </div>
  );
}

export default function TableActionMenuPlugin({ anchorElem = document.body, cellMerge = false }) {
  const isEditable = useLexicalEditable();
  return createPortal(isEditable ? <TableCellActionMenuContainer anchorElem={anchorElem} cellMerge={cellMerge} /> : null, anchorElem);
}
