import Masonry from "react-masonry-css";
import PortfolioItem from "./PortfolioItem";

function PortfolioGrid({ items }) {
  return (
    <Masonry
      breakpointCols={{ default: 3, 1100: 2, 700: 1 }}
      className="masonry-grid"
      columnClassName="masonry-grid_column"
    >
      {items.map((item) => (
        <PortfolioItem key={item.id} item={item} />
      ))}
    </Masonry>
  );
}

export default PortfolioGrid;
