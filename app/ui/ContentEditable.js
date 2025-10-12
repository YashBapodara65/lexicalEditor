import "./ContentEditable.css";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import * as React from "react";

export default function LexicalContentEditable({
  className,
  placeholder,
  placeholderClassName,
}) {
  return (
    <ContentEditable
      className={className ?? "ContentEditable__root"}
      aria-placeholder={placeholder}
      placeholder={
        <div className={placeholderClassName ?? "ContentEditable__placeholder"}>
          {placeholder}
        </div>
      }
    />
  );
}
