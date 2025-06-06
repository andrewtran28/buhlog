import { useEffect, useState } from "react";
import "../styles/App.css";

type loadMessageContext = {
  delay: number;
  loadMessage: string;
};

const Loading = ({ delay = 1000, loadMessage }: loadMessageContext) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  return (
    <div className="loading">
      <h1 className={show ? "show" : ""}>
        {loadMessage}
        <span className="load-animation">...</span>
      </h1>
    </div>
  );
};

export default Loading;
