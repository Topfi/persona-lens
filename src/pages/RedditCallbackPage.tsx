import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { completeRedditAuth } from "../lib/platforms/reddit";
import { useStore } from "../state/store";

export default function RedditCallbackPage() {
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    completeRedditAuth(params).then((ok) => {
      if (!ok) {
        setFailed(true);
        return;
      }
      // Restore the handle the user was analyzing (encoded into OAuth state).
      const handle = params.get("state")?.split(":")[1];
      useStore.getState().set({ platformId: "reddit", ...(handle ? { handleInput: handle } : {}) });
      navigate("/", { replace: true });
    });
  }, [navigate]);

  return (
    <main>
      {failed ? (
        <div className="error-box">
          <strong>Reddit authorization failed.</strong> You can retry from the start page.
        </div>
      ) : (
        <p className="kicker">completing reddit authorization…</p>
      )}
    </main>
  );
}
