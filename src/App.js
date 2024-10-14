import React, { useEffect, useState } from "react";
import HomePage from "./views/HomePage";
import "./styles/main.css";
import { getUrls } from "./utils/serveSignedUrls";

function App() {
  const [loginStatus, setLoginStatus] = useState("Checking...");
  const [presignedUrls, setPresignedUrls] = useState([]);

  useEffect(() => {
    testAwsLogin();
  }, []);

  async function testAwsLogin() {
    try {
      // Get presigned URLs from AWS S3
      const urls = await getUrls();
      setPresignedUrls(urls);
      setLoginStatus("Login succeeded");
    } catch (error) {
      console.error("AWS login failed:", error);
      setLoginStatus("Login failed");
    }
  }

  return (
    <div className="App">
      <h1>AWS Login Test</h1>
      <p>Login status: {loginStatus}</p>
      <div>
        <h2>S3 Objects:</h2>
        <ul>
          {presignedUrls.map((item) => (
            <li key={item.name}>
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
      </div>
      <HomePage />
    </div>
  );
}

export default App;
