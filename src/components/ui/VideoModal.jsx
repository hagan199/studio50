import { createPortal } from 'react-dom';
import useModal from '../../hooks/useModal';
import { CloseIcon } from '../graduation/icons';
import './VideoModal.css';

/**
 * Full-screen landscape video player. Uses the browser's native controls so
 * sound, seeking, fullscreen and picture-in-picture all work everywhere.
 * `video` = { src, poster, title, description } or null when closed.
 */
export default function VideoModal({ video, onClose }) {
  const open = Boolean(video?.src);
  const dialogRef = useModal(open, { Escape: onClose });

  if (!open) return null;

  return createPortal(
    <div
      className="video-modal"
      role="dialog"
      aria-modal="true"
      aria-label={video.title || 'Video'}
      ref={dialogRef}
      tabIndex={-1}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <button type="button" className="video-modal__close" onClick={onClose} aria-label="Close video" data-autofocus>
        <CloseIcon />
      </button>
      <div className="video-modal__inner" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="video-modal__frame">
          <video
            key={video.src}
            className="video-modal__video"
            src={video.src}
            poster={video.poster || undefined}
            controls
            autoPlay
            playsInline
            preload="auto"
          />
        </div>
        {(video.title || video.description) && (
          <div className="video-modal__info">
            {video.title && <h3>{video.title}</h3>}
            {video.description && <p>{video.description}</p>}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
