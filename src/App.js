import React, { useState, useEffect } from "react";
import { getUrls } from "./backend/signedUrlServer.mjs";

function App() {
  const [urlData, setUrlData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUrls() {
      try {
        const fetchedUrls = await getUrls();
        setUrlData(fetchedUrls);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching URLs:", err);
        setError(err.message);
        setLoading(false);
      }
    }

    fetchUrls();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="App">
      <h1>S3 Signed URLs</h1>
      <ul>
        {urlData.map((item, index) => (
          <li key={index}>
            <h3>{item.name}</h3>
            <ul>
              <li>
                Actual URL:{" "}
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
                  Thumbnail URL:{" "}
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
    </div>
  );
}

export default App;
