import React, { useEffect, useState } from "react";
import HomePage from "./views/HomePage";
import "./styles/main.css";
import { getUrls } from "./utils/serveSignedUrls";

function App() {
  const [loginStatus, setLoginStatus] = useState("Checking...");
  const [presignedUrls, setPresignedUrls] = useState([]);
  const [beautifiedData, setBeautifiedData] = useState([]);

  useEffect(() => {
    testAwsLogin();
    fetchBeautifiedData();
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

  async function fetchBeautifiedData() {
    try {
      const response = await fetch("/api/beautified-islands");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setBeautifiedData(data);
    } catch (error) {
      console.error("Failed to fetch beautified data:", error);
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

      <div>
        <h2>Beautified Data:</h2>
        <ul>
          {beautifiedData.map((item) => (
            <li key={item.name}>
              <h3>{item.name}</h3>
              <p>Type: {item.type}</p>
              <p>Viewer: {item.viewer}</p>
              <p>Author: {item.author}</p>
              <p>Date: {item.dateTime}</p>
              <p>
                Location: {item.location}, {item.region}, {item.country}
              </p>
              <p>
                Coordinates: {item.latitude}, {item.longitude}
              </p>
              <p>Altitude: {item.altitude}</p>
              {item.postalCode && <p>Postal Code: {item.postalCode}</p>}
              {item.road && <p>Road: {item.road}</p>}
              <p>Views: {item.noViews}</p>
              <img src={item.thumbnailUrl} alt={`Thumbnail of ${item.name}`} />
              <br />
              <a
                href={item.actualUrl + item.actualQueryString}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Full Image
              </a>
            </li>
          ))}
        </ul>
      </div>

      <HomePage />
    </div>
  );
}

export default App;
