import { useEffect, useState } from "react";
import "../styles/App.css";

type loadMessageContext = {
  delay: number;
  loadMessage: string;
};

const Loading = ({ delay = 1000, loadMessage }: loadMessageContext) => {
  const [showLoading, setShowLoading] = useState(false);
  const [showDelayedMessage, setShowDelayedMessage] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShowLoading(true), delay);
    const delayTimeout = setTimeout(() => setShowDelayedMessage(true), delay + 3000);
    return () => {
      clearTimeout(timeout);
      clearTimeout(delayTimeout);
    };
  }, [delay]);

  return (
    <div className="loading">
      <h1 className={showLoading ? "show" : ""}>
        {loadMessage}
        <span className="load-animation">...</span>
      </h1>
      {showDelayedMessage && <p>(This may take up to 30 seconds due to slow servers.)</p>}
    </div>
  );
};

export default Loading;
