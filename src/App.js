import React, { useState, useEffect } from "react";
import { getUrls } from "./utils/serveSignedUrls.mjs";

function App() {
  const [urls, setUrls] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUrls() {
      try {
        const fetchedUrls = await getUrls();
        setUrls(fetchedUrls);
      } catch (err) {
        console.error("Error fetching URLs:", err);
        setError(err.message);
      }
    }

    fetchUrls();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="App">
      <h1>S3 Signed URLs</h1>
      {urls.length === 0 ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {urls.map((item, index) => (
            <li key={index}>
              {item.name}:
              <ul>
                <li>
                  Actual:{" "}
                  <a
                    href={item.urls.actual}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </a>
                </li>
                {item.urls.thumbnail && (
                  <li>
                    Thumbnail:{" "}
                    <a
                      href={item.urls.thumbnail}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </a>
                  </li>
                )}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
