'use client';

import * as React from 'react';
import {
  $getState,
  $setState,
  buildImportMap,
  createState,
  DecoratorNode,
} from 'lexical';

const DateTimeComponent = React.lazy(() => import('./DateTimeComponent'));

const getDateTimeText = (dateTime) => {
  if (!dateTime) {
    return '';
  }
  const hours = dateTime.getHours();
  const minutes = dateTime.getMinutes();
  return (
    dateTime.toDateString() +
    (hours === 0 && minutes === 0
      ? ''
      : ` ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`)
  );
};

function $convertDateTimeElement(domNode) {
  const dateTimeValue = domNode.getAttribute('data-lexical-datetime');
  if (dateTimeValue) {
    const node = $createDateTimeNode(new Date(Date.parse(dateTimeValue)));
    return { node };
  }
  const gDocsDateTimePayload = domNode.getAttribute('data-rich-links');
  if (!gDocsDateTimePayload) {
    return null;
  }
  const parsed = JSON.parse(gDocsDateTimePayload);
  const parsedDate = Date.parse(parsed?.dat_df?.dfie_dt || '');
  if (isNaN(parsedDate)) {
    return null;
  }
  const node = $createDateTimeNode(new Date(parsedDate));
  return { node };
}

const dateTimeState = createState('dateTime', {
  parse: (v) => new Date(v),
  unparse: (v) => v.toISOString(),
});

export class DateTimeNode extends DecoratorNode {
  $config() {
    return this.config('datetime', {
      extends: DecoratorNode,
      importDOM: buildImportMap({
        span: (domNode) =>
          domNode.getAttribute('data-lexical-datetime') !== null ||
          (domNode.getAttribute('data-rich-links') !== null &&
            JSON.parse(domNode.getAttribute('data-rich-links') || '{}').type ===
              'date')
            ? {
                conversion: $convertDateTimeElement,
                priority: 2,
              }
            : null,
      }),
      stateConfigs: [{ flat: true, stateConfig: dateTimeState }],
    });
  }

  getDateTime() {
    return $getState(this, dateTimeState);
  }

  setDateTime(valueOrUpdater) {
    return $setState(this, dateTimeState, valueOrUpdater);
  }

  getTextContent() {
    const dateTime = this.getDateTime();
    return getDateTimeText(dateTime);
  }

  exportDOM() {
    const element = document.createElement('span');
    element.textContent = getDateTimeText(this.getDateTime());
    element.setAttribute('data-lexical-datetime', this.getDateTime()?.toString() || '');
    return { element };
  }

  createDOM() {
    const element = document.createElement('span');
    element.setAttribute('data-lexical-datetime', this.getDateTime()?.toString() || '');
    element.style.display = 'inline-block';
    return element;
  }

  updateDOM() {
    return false;
  }

  isInline() {
    return true;
  }

  decorate() {
    return <DateTimeComponent dateTime={this.getDateTime()} nodeKey={this.__key} />;
  }
}

export function $createDateTimeNode(dateTime) {
  return new DateTimeNode().setDateTime(dateTime);
}

export function $isDateTimeNode(node) {
  return node instanceof DateTimeNode;
}
