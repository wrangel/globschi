import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/beautified-islands");
        setData(response.data);
        setLoading(false);
      } catch (err) {
        setError("Error fetching data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Island Data</h1>
      {data.map((item, index) => (
        <div key={index}>
          <h2>{item.name}</h2>
          <p>
            Actual URL:{" "}
            <a
              href={item.urls.actual}
              target="_blank"
              rel="noopener noreferrer"
            >
              View
            </a>
          </p>
          <p>
            Thumbnail URL:{" "}
            <a
              href={item.urls.thumbnail}
              target="_blank"
              rel="noopener noreferrer"
            >
              View
            </a>
          </p>
          <p>Author: {item.author}</p>
          <p>Date: {item.dateTimeString}</p>
          <p>Location: {item.location}</p>
          <p>Country: {item.country}</p>
          <p>Region: {item.region}</p>
          <p>Views: {item.noViews}</p>
        </div>
      ))}
    </div>
  );
}

export default App;
