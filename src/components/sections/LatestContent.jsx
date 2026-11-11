import { useState, useEffect } from 'react';
import api from '../../utils/api';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import ServiceAnchor from '../ui/ServiceAnchor';
import Lightbox from '../graduation/Lightbox';
import VideoModal from '../ui/VideoModal';
import { PlayIcon } from '../graduation/icons';
import { galleryImages, isPlayableUrl } from '../../utils/media';
import './LatestContent.css';

const GalleryIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="7" y="7" width="14" height="14" rx="2" /><path d="M3 17V5a2 2 0 0 1 2-2h12" />
  </svg>
);

/** Playable source for a video item (uploaded MP4 first, then WEBM). */
const videoSrc = (item) => [item.videoMp4, item.videoWebm].find(isPlayableUrl) || '';

function Overlay({ item, extra }) {
  return (
    <div className="overlay">
      <h3 className="section-title small white">{item.title}</h3>
      {item.subtitle && <h4 className="section-small-title small white">{item.subtitle}</h4>}
      {item.description && <p className="latest-card__desc">{item.description}</p>}
      <div className="latest-card__tags">
        {item.tag && (
          <div className="tag">
            <div className="tag-text">{item.tag}</div>
          </div>
        )}
        {extra}
      </div>
    </div>
  );
}

function VideoCard({ item, onOpen }) {
  const src = videoSrc(item);
  // Older items switched from image to video can still carry imageUrl.
  const poster = item.poster || item.imageUrl || '';
  const Tag = src ? 'button' : 'div';
  return (
    <Tag
      className={`bg-video-w latest-card${item.wide ? ' wide' : ''}${src ? ' is-clickable' : ''}`}
      {...(src ? { type: 'button', onClick: onOpen, 'aria-label': `Play video: ${item.title || 'Project video'}` } : {})}
    >
      {poster ? (
        <img src={poster} alt="" className="video-thumbnail" loading="lazy" decoding="async" />
      ) : src ? (
        // No cover image: a muted looping preview, as the section always had.
        <video autoPlay loop muted playsInline preload="metadata" className="bg-video" aria-hidden="true" tabIndex={-1}>
          {isPlayableUrl(item.videoMp4) && <source src={item.videoMp4} type="video/mp4" />}
          {isPlayableUrl(item.videoWebm) && <source src={item.videoWebm} type="video/webm" />}
        </video>
      ) : (
        <div className="latest-card__placeholder" aria-hidden="true" />
      )}
      {src && <span className="latest-card__play" aria-hidden="true"><PlayIcon width={22} height={22} /></span>}
      <Overlay item={item} />
    </Tag>
  );
}

function GalleryCard({ item, images, onOpen }) {
  const extra = images.length > 1 ? (
    <span className="latest-card__count"><GalleryIcon /> {images.length} photos</span>
  ) : null;
  const strip = images.slice(1, 4);
  return (
    <button
      type="button"
      className={`bg-video-w latest-card is-clickable${item.wide ? ' wide' : ''}`}
      onClick={onOpen}
      aria-label={`Open gallery: ${item.title || 'Image gallery'}${images.length > 1 ? ` (${images.length} photos)` : ''}`}
    >
      <img src={images[0].url} alt="" className="video-thumbnail" loading="lazy" decoding="async" />
      {strip.length > 0 && (
        <span className="latest-card__stack" aria-hidden="true">
          {strip.map((img, i) => (
            <span key={img.id || img.url} className="latest-card__stack-thumb">
              <img src={img.url} alt="" loading="lazy" decoding="async" />
              {i === strip.length - 1 && images.length > 4 && (
                <span className="latest-card__stack-more">+{images.length - 4}</span>
              )}
            </span>
          ))}
        </span>
      )}
      <Overlay item={item} extra={extra} />
    </button>
  );
}

export default function LatestContent() {
  const [data, setData] = useState(null);
  const [gallery, setGallery] = useState(null); // { items, index }
  const [video, setVideo] = useState(null);
  const ref = useScrollAnimation([data]);

  useEffect(() => {
    api.get('/api/content').then((res) => setData(res.data.latestContent)).catch(() => {});
  }, []);

  if (!data) return null;

  const items = (data.items || []).filter((item) => item && item.published !== false);

  return (
    <section className="section latest-content" id="programs" ref={ref}>
      <ServiceAnchor id="videography" />
      <div className="short-container">
        <h2 className="section-heading black" data-animate="fade-up">{data.heading}</h2>
      </div>
      <div className="video-grid" data-animate="stagger-children" data-stagger="0.18">
        {items.map((item) => {
          if (item.type === 'video') {
            // Nothing a visitor could see or play (e.g. a path from someone's PC).
            if (!videoSrc(item) && !item.poster && !item.imageUrl) return null;
            return (
              <VideoCard
                key={item.id}
                item={item}
                onOpen={() => setVideo({ src: videoSrc(item), poster: item.poster, title: item.title, description: item.description })}
              />
            );
          }
          // 'gallery', and older single-image items ('image').
          const images = galleryImages(item);
          if (!images.length) return null;
          return (
            <GalleryCard
              key={item.id}
              item={item}
              images={images}
              onOpen={() => setGallery({
                index: 0,
                items: images.map((img) => ({ url: img.url, title: item.title, caption: img.caption || item.description || '' })),
              })}
            />
          );
        })}
      </div>

      <Lightbox
        items={gallery?.items || []}
        index={gallery ? gallery.index : null}
        onChange={(index) => setGallery((g) => ({ ...g, index }))}
        onClose={() => setGallery(null)}
      />
      <VideoModal video={video} onClose={() => setVideo(null)} />
    </section>
  );
}
