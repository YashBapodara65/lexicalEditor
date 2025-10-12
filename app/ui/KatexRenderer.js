"use client";

import katex from "katex";
import * as React from "react";
import { useEffect, useRef } from "react";
import Image from "next/image";

export default function KatexRenderer({ equation, inline, onDoubleClick }) {
  const katexElementRef = useRef(null);

  useEffect(() => {
    const katexElement = katexElementRef.current;

    if (katexElement !== null) {
      katex.render(equation, katexElement, {
        displayMode: !inline, 
        errorColor: "#cc0000",
        output: "html",
        strict: "warn",
        throwOnError: false,
        trust: false,
      });
    }
  }, [equation, inline]);

  const transparentGif = "/images/transparent-1x1.gif";

  return (
    <>
      <Image
        src={transparentGif}
        width={0}
        height={0}
        alt=""
        unoptimized
      />
      <span
        role="button"
        tabIndex={-1}
        onDoubleClick={onDoubleClick}
        ref={katexElementRef}
      />
      <Image
        src={transparentGif}
        width={0}
        height={0}
        alt=""
        unoptimized
      />
    </>
  );
}
