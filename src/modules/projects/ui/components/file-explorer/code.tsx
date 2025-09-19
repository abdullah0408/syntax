import React, { useEffect } from "react";
import prismjs from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";

import "./code-theme.css";

interface CodeTabProps {
  code: string;
  language: string;
}

const Code = ({ code, language }: CodeTabProps) => {
  useEffect(() => {
    prismjs.highlightAll();
  }, [code]);

  return (
    <pre className="p-2 bg-transparent border-none rounded-none m-0 text-xs">
      <code className={`language-${language}`}>{code}</code>
    </pre>
  );
};

export default Code;
