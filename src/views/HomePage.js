import React from "react";
import PortfolioGrid from "../components/PortfolioGrid";

function HomePage() {
  // You'll need to define your items here or fetch them from an API
  const items = [
    /* your portfolio items */
  ];

  return (
    <div className="home-page">
      <h1>My Portfolio</h1>
      <PortfolioGrid items={items} />
    </div>
  );
}

export default HomePage;
