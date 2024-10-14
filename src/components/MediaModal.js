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
      <div {...handlers}>
        {renderMedia(item)}
        <button onClick={onPrev}>Previous</button>
        <button onClick={onNext}>Next</button>
      </div>
    </Modal>
  );
}

function renderMedia(item) {
  switch (item.type) {
    case "image":
      return <img src={item.url} alt={item.title} />;
    case "video":
      return <video src={item.url} controls />;
    case "panorama":
      return <PanoramaViewer url={item.url} />;
    default:
      return null;
  }
}

export default MediaModal;
