// src/frontend/tests/ItemsTest.jsx

import React from "react";
import { useItems } from "../hooks/useItems";

export default function ItemsTest() {
  const { items, isLoading, error, refetch, clearCache } = useItems();

  return (
    <div>
      <h1>Items Test</h1>

      {isLoading && <p>Loading data...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <button onClick={refetch}>Refetch</button>
      <button onClick={clearCache} style={{ marginLeft: "10px" }}>
        Clear Cache & Refetch
      </button>

      <ul>
        {items.length === 0 && !isLoading && <li>No items loaded</li>}
        {items.map((item) => (
          <li key={item.id}>
            <strong>Viewer:</strong> {item.viewer} <br />
            <strong>Meta</strong> {item.metadata || "No metadata"}
          </li>
        ))}
      </ul>
    </div>
  );
}
