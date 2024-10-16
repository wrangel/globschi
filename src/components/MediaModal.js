import React from "react";
import Modal from "react-modal";
import { useSwipeable } from "react-swipeable";
import PanoramaViewer from "./PanoramaViewer";

function MediaModal({ isOpen, onClose, item, onNext, onPrev }) {
  const handlers = useSwipeable({
    onSwipedLeft: onNext,
    onSwipedRight: onPrev,
  });

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="media-modal"
      overlayClassName="media-modal-overlay"
    >
      <div {...handlers} className="media-modal-content">
        {renderMedia(item)}
        <button className="modal-nav prev" onClick={onPrev}>
          &lt;
        </button>
        <button className="modal-nav next" onClick={onNext}>
          &gt;
        </button>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
      </div>
    </Modal>
  );
}

function renderMedia(item) {
  if (item.type === "pan") {
    return <PanoramaViewer url={item.actualUrl} />;
  } else {
    return <img src={item.actualUrl} alt={item.name} />;
  }
}

export default MediaModal;
