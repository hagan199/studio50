import ImageField from './ImageField';
import VideoField from './VideoField';
import GalleryField from './GalleryField';
import { galleryImages, isLocalPath, newId } from '../../utils/media';

const CATEGORY = 'content';

const TYPE_LABELS = { gallery: 'Image Gallery', video: 'Project Video' };

const blankItem = (type) => ({
  id: newId('lc'),
  type,
  title: '',
  subtitle: '',
  description: '',
  tag: '',
  wide: false,
  published: true,
  images: [],
  imageUrl: '',
  poster: '',
  videoMp4: '',
  videoWebm: '',
});

function LocalPathWarning({ urls }) {
  const bad = urls.filter((u) => u && isLocalPath(u));
  if (!bad.length) return null;
  return (
    <div className="admin-alert admin-alert--warning">
      This video points to a file on someone's computer ({bad[0].replace(/^"|"$/g, '')}), so visitors can't play it.
      Upload the video file here instead.
    </div>
  );
}

/**
 * Homepage → Latest Content. Each item is an Image Gallery (several photos,
 * opens a slideshow) or a Project Video (cover + video, opens a player).
 * Older single-image items are edited as galleries; nothing is converted
 * until an admin changes the item.
 */
export default function LatestContentEditor({ section, onChange }) {
  const items = section.items || [];

  const setItems = (next) => onChange({ ...section, items: next });
  const patch = (index, changes) => setItems(items.map((it, i) => (i === index ? { ...it, ...changes } : it)));
  const move = (index, dir) => {
    const next = [...items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
  };
  const remove = (index) => {
    const name = items[index].title || `item ${index + 1}`;
    if (window.confirm(`Delete "${name}" from Latest Content? Uploaded files stay in the Media library.`)) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  return (
    <>
      <div className="admin-field">
        <label className="admin-field__label">Heading</label>
        <input className="admin-field__input" value={section.heading ?? ''} onChange={(e) => onChange({ ...section, heading: e.target.value })} />
      </div>
      <p className="grad-admin-note">
        <strong>Image Gallery</strong> items show a cover with a preview of the other photos and open a slideshow.
        <strong> Project Video</strong> items show a cover image and play in a video player with sound and fullscreen.
      </p>

      {items.map((item, i) => {
        const type = item.type === 'video' ? 'video' : 'gallery';
        const published = item.published !== false;
        return (
          <div key={item.id ?? i} className={`admin-item-card${published ? '' : ' grad-admin-hidden'}`}>
            <div className="admin-item-card__header">
              <strong className="admin-item-card__title">
                {item.title || `Item ${i + 1}`} · {TYPE_LABELS[type]}
                <span className={`admin-status-pill admin-status-pill--${published ? 'live' : 'draft'}`}>{published ? 'Published' : 'Hidden'}</span>
              </strong>
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" className="admin-btn admin-btn--sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
                <button type="button" className="admin-btn admin-btn--sm" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down">↓</button>
                <button type="button" className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => remove(i)}>Delete</button>
              </div>
            </div>

            <div className="admin-grid-2">
              <div className="admin-field">
                <label className="admin-field__label">Content type</label>
                <select className="admin-field__input" value={type} onChange={(e) => patch(i, { type: e.target.value })}>
                  <option value="gallery">Image Gallery</option>
                  <option value="video">Project Video</option>
                </select>
                <span className="admin-field__hint">Switching type keeps the other type's media, so you can switch back.</span>
              </div>
              <div className="admin-field">
                <label className="admin-field__label">Tag (optional)</label>
                <input className="admin-field__input" value={item.tag ?? ''} onChange={(e) => patch(i, { tag: e.target.value })} placeholder="e.g. NEW" />
              </div>
              <div className="admin-field">
                <label className="admin-field__label">Title</label>
                <input className="admin-field__input" value={item.title ?? ''} onChange={(e) => patch(i, { title: e.target.value })} />
              </div>
              <div className="admin-field">
                <label className="admin-field__label">Subtitle (optional)</label>
                <input className="admin-field__input" value={item.subtitle ?? ''} onChange={(e) => patch(i, { subtitle: e.target.value })} />
              </div>
            </div>
            <div className="admin-field">
              <label className="admin-field__label">Description (optional)</label>
              <textarea className="admin-field__textarea" rows={2} value={item.description ?? ''} onChange={(e) => patch(i, { description: e.target.value })} />
            </div>

            {type === 'gallery' ? (
              <GalleryField
                label="Gallery images (first image is the cover)"
                value={galleryImages(item)}
                category={CATEGORY}
                // imageUrl mirrors the cover so older builds still show something.
                onChange={(images) => patch(i, { type: 'gallery', images, imageUrl: images[0]?.url || '' })}
              />
            ) : (
              <>
                <LocalPathWarning urls={[item.videoMp4, item.videoWebm]} />
                <div className="admin-grid-2">
                  <VideoField
                    label="Video file"
                    value={isLocalPath(item.videoMp4) ? '' : item.videoMp4 || ''}
                    category={CATEGORY}
                    onChange={(videoMp4) => patch(i, { videoMp4 })}
                  />
                  <ImageField
                    label="Cover / thumbnail image"
                    value={item.poster || ''}
                    category={CATEGORY}
                    onChange={(poster) => patch(i, { poster })}
                  />
                </div>
                {item.videoWebm && (
                  <div className="admin-field">
                    <label className="admin-field__label">WebM fallback URL (older content)</label>
                    <input className="admin-field__input" value={item.videoWebm} onChange={(e) => patch(i, { videoWebm: e.target.value })} />
                  </div>
                )}
              </>
            )}

            <div className="admin-toggle-row">
              <label className="admin-checkbox">
                <input type="checkbox" checked={published} onChange={(e) => patch(i, { published: e.target.checked })} />
                Published (shown on the homepage)
              </label>
              <label className="admin-checkbox">
                <input type="checkbox" checked={item.wide || false} onChange={(e) => patch(i, { wide: e.target.checked })} />
                Wide layout (spans full width)
              </label>
            </div>
          </div>
        );
      })}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setItems([...items, blankItem('gallery')])}>+ Add Image Gallery</button>
        <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setItems([...items, blankItem('video')])}>+ Add Project Video</button>
      </div>
    </>
  );
}
