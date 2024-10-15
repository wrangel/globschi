// src/components/CombinedDataList.js
import React, { useState, useEffect } from "react";

function CombinedDataList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/combined-data")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
        // Debug log to see all available fields
        if (process.env.NODE_ENV === "development") {
          console.log("Full dataset sample:", data[0]);
        }
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Combined Data List</h2>
      <ul>
        {data.map((item, index) => (
          <li key={index}>
            <h3>{item.name}</h3>
            <p>Type: {item.type}</p>
            <p>Author: {item.author}</p>
            <p>Date: {item.dateTime}</p>
            <p>
              Location: {item.location}, {item.country}
            </p>
            <img
              src={item.thumbnailUrl}
              alt={item.name}
              style={{ maxWidth: "200px" }}
            />
            <p>
              Actual URL:{" "}
              <a
                href={item.actualQueryString}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.actualQueryString}
              </a>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CombinedDataList;
