// src/components/MascotCorner.jsx

import mascotImage from "../assets/mascot.png";

const MascotCorner = ({ position = "left", style = {} }) => (
  <img
    src={mascotImage}
    alt="Corporate mascot"
    className={`mascotCorner mascotCorner--${position}`}
    draggable={false}
    style={style}
  />
);

export default MascotCorner;
