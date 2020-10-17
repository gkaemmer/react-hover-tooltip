import { FC, useEffect, useState } from "react";
import ReactDOM from "react-dom";

// Useful for rendering subtrees outside of the context of a parent.
const Portal: FC = ({ children }) => {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    const newNode = document.createElement("div");
    document.body.appendChild(newNode);
    setNode(newNode);
    return () => {
      document.body.removeChild(newNode);
    };
  }, []);

  if (!node) return null;
  return ReactDOM.createPortal(children, node);
};

export default Portal;
