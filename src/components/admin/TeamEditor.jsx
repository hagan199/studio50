import { useEffect, useMemo, useRef, useState } from 'react';
import api from '../../utils/api';
import useAdminSave from '../../hooks/useAdminSave';
import AdminToast from './AdminToast';
import AdminSaveBar from './AdminSaveBar';
import ImageField from './ImageField';
import VideoField from './VideoField';
import GalleryField from './GalleryField';
import { Section, LoadingSkeleton } from './AdminSection';
import { newId, slugify } from '../../utils/media';

const CATEGORY = 'team';

const toLines = (arr) => (Array.isArray(arr) ? arr.join('\n') : '');
const fromLines = (text) => text.split('\n');

function Field({ label, hint, children }) {
  return (
    <div className="admin-field">
      <label className="admin-field__label">{label}</label>
      {children}
      {hint && <span className="admin-field__hint">{hint}</span>}
    </div>
  );
}

const Input = ({ value, onChange, ...rest }) => (
  <input className="admin-field__input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...rest} />
);
const Area = ({ value, onChange, rows = 3, ...rest }) => (
  <textarea className="admin-field__textarea" rows={rows} value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...rest} />
);

const StatusPill = ({ on, onText = 'Published', offText = 'Draft' }) => (
  <span className={`admin-status-pill admin-status-pill--${on ? 'live' : 'draft'}`}>{on ? onText : offText}</span>
);

const blankMember = () => ({
  id: newId('member'),
  slug: '',
  name: '',
  position: '',
  photo: '',
  coverImage: '',
  shortIntro: '',
  intro: '',
  bio: '',
  skills: [],
  links: [],
  email: '',
  enquiryText: '',
  enquiryLink: '',
  // New profiles start hidden so they can be filled in and previewed first.
  published: false,
  projects: [],
});

const blankProject = (type) => ({
  id: newId('proj'),
  title: '',
  description: '',
  category: '',
  type,
  images: [],
  videoUrl: '',
  poster: '',
  published: true,
});

const move = (list, index, dir) => {
  const next = [...list];
  const target = index + dir;
  if (target < 0 || target >= next.length) return list;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

/* ─────────────── Single member: profile + portfolio ─────────────── */

function MemberEditor({ member, allMembers, onChange, onBack, dirty }) {
  const set = (patch) => onChange({ ...member, ...patch });
  const projects = member.projects || [];
  const setProjects = (next) => set({ projects: next });
  const patchProject = (i, patch) => setProjects(projects.map((p, j) => (j === i ? { ...p, ...patch } : p)));

  const categories = useMemo(
    () => [...new Set(allMembers.flatMap((m) => (m.projects || []).map((p) => p.category)).filter(Boolean))],
    [allMembers]
  );

  // Keep the URL in step with the name until someone edits it by hand.
  const setName = (name) => {
    const autoSlug = !member.slug || member.slug === slugify(member.name);
    set({ name, ...(autoSlug ? { slug: slugify(name) } : {}) });
  };

  const slugTaken = member.slug && allMembers.some((m) => m.id !== member.id && m.slug === member.slug);
  const previewUrl = member.slug ? `/team/${member.slug}?preview=1` : '';

  return (
    <>
      <div className="team-admin-back">
        <button type="button" className="admin-btn admin-btn--secondary admin-btn--sm" onClick={onBack}>← All team members</button>
      </div>

      <div className="admin-editor__header">
        <h2>
          {member.name || 'New team member'}
          <StatusPill on={member.published !== false} />
        </h2>
        {previewUrl && (
          <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn--secondary">
            Preview portfolio ↗
          </a>
        )}
      </div>
      {dirty && previewUrl && (
        <p className="grad-admin-note">The preview shows saved content — save first to see your latest changes.</p>
      )}

      <Section title="Profile" defaultOpen>
        <div className="admin-grid-2">
          <Field label="Full name *"><Input value={member.name} onChange={setName} placeholder="e.g. Ama Mensah" /></Field>
          <Field label="Position / job title"><Input value={member.position} onChange={(v) => set({ position: v })} placeholder="e.g. Lead Photographer" /></Field>
        </div>
        <Field label="Portfolio URL" hint={`Visitors open this profile at /team/${member.slug || 'your-name'}`}>
          <Input value={member.slug} onChange={(v) => set({ slug: slugify(v) })} placeholder="ama-mensah" />
        </Field>
        {slugTaken && <div className="admin-alert admin-alert--warning">Another team member already uses this URL. It will get a number added when you save.</div>}

        <div className="admin-grid-2">
          <ImageField label="Profile photograph" value={member.photo} category={CATEGORY} onChange={(photo) => set({ photo })} />
          <ImageField label="Portfolio hero background (optional)" value={member.coverImage} category={CATEGORY} onChange={(coverImage) => set({ coverImage })} />
        </div>

        <Field label="Short introduction" hint="One or two sentences, shown on the homepage team card and under the name.">
          <Area rows={2} value={member.shortIntro} onChange={(v) => set({ shortIntro: v })} />
        </Field>
        <Field label="Professional introduction" hint="A bold one-line statement at the top of the portfolio, e.g. “I tell brand stories through light and motion.”">
          <Input value={member.intro} onChange={(v) => set({ intro: v })} />
        </Field>
        <Field label="Biography" hint="Leave a blank line between paragraphs.">
          <Area rows={7} value={member.bio} onChange={(v) => set({ bio: v })} />
        </Field>
        <Field label="Skills / areas of expertise" hint="One per line">
          <Area rows={4} value={toLines(member.skills)} onChange={(v) => set({ skills: fromLines(v) })} />
        </Field>

        <label className="admin-checkbox">
          <input type="checkbox" checked={member.published !== false} onChange={(e) => set({ published: e.target.checked })} />
          Published — show this profile on the website
        </label>
      </Section>

      <Section title="Links & Enquiries" count={(member.links || []).length}>
        <h4 className="admin-item-card__heading">Social / professional links</h4>
        {(member.links || []).map((link, i) => (
          <div key={i} className="admin-list-row">
            <input className="admin-field__input" style={{ maxWidth: 180 }} placeholder="Label (e.g. Instagram)" value={link.label ?? ''}
              onChange={(e) => set({ links: member.links.map((l, j) => (j === i ? { ...l, label: e.target.value } : l)) })} />
            <input className="admin-field__input" placeholder="https://…" value={link.url ?? ''}
              onChange={(e) => set({ links: member.links.map((l, j) => (j === i ? { ...l, url: e.target.value } : l)) })} />
            <button type="button" className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => set({ links: member.links.filter((_, j) => j !== i) })} aria-label="Remove link">✕</button>
          </div>
        ))}
        <button type="button" className="admin-btn admin-btn--secondary admin-btn--sm" onClick={() => set({ links: [...(member.links || []), { label: '', url: '' }] })}>
          + Add link
        </button>

        <h4 className="admin-item-card__heading" style={{ marginTop: 24 }}>Enquiries</h4>
        <div className="admin-grid-2">
          <Field label="Email (optional)"><Input type="email" value={member.email} onChange={(v) => set({ email: v })} /></Field>
          <Field label="Enquiry button text" hint="Default: “Work with {first name}”"><Input value={member.enquiryText} onChange={(v) => set({ enquiryText: v })} /></Field>
        </div>
        <Field label="Enquiry button link" hint="Empty = email above, or the site contact section. Can be a WhatsApp link, booking form or #contact.">
          <Input value={member.enquiryLink} onChange={(v) => set({ enquiryLink: v })} />
        </Field>
      </Section>

      <Section title="Portfolio Projects" count={projects.length} defaultOpen>
        <p className="grad-admin-note">
          Each project is a photo gallery (opens a slideshow) or a video (opens a player). Use categories such as
          “Weddings” or “Commercial” to let visitors filter. Untick “Published” to hide a project without deleting it.
        </p>
        <datalist id="team-project-categories">
          {categories.map((c) => <option key={c} value={c} />)}
        </datalist>

        {projects.map((p, i) => {
          const published = p.published !== false;
          return (
            <div key={p.id} className={`admin-item-card${published ? '' : ' grad-admin-hidden'}`}>
              <div className="admin-item-card__header">
                <span className="admin-item-card__title">
                  {p.title || `Project ${i + 1}`} · {p.type === 'video' ? 'Video' : 'Gallery'}
                  <StatusPill on={published} offText="Hidden" />
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" className="admin-btn admin-btn--sm" onClick={() => setProjects(move(projects, i, -1))} disabled={i === 0} aria-label="Move project up">↑</button>
                  <button type="button" className="admin-btn admin-btn--sm" onClick={() => setProjects(move(projects, i, 1))} disabled={i === projects.length - 1} aria-label="Move project down">↓</button>
                  <button type="button" className="admin-btn admin-btn--sm admin-btn--danger"
                    onClick={() => window.confirm(`Delete project "${p.title || i + 1}"?`) && setProjects(projects.filter((_, j) => j !== i))}>
                    Delete
                  </button>
                </div>
              </div>
              <div className="admin-grid-2">
                <Field label="Project title"><Input value={p.title} onChange={(v) => patchProject(i, { title: v })} /></Field>
                <Field label="Category (optional)">
                  <Input value={p.category} onChange={(v) => patchProject(i, { category: v })} list="team-project-categories" placeholder="e.g. Weddings" />
                </Field>
                <Field label="Project type">
                  <select className="admin-field__input" value={p.type === 'video' ? 'video' : 'gallery'} onChange={(e) => patchProject(i, { type: e.target.value })}>
                    <option value="gallery">Photo gallery</option>
                    <option value="video">Video</option>
                  </select>
                </Field>
              </div>
              <Field label="Description (optional)"><Area rows={2} value={p.description} onChange={(v) => patchProject(i, { description: v })} /></Field>

              {p.type === 'video' ? (
                <div className="admin-grid-2">
                  <VideoField label="Video file" value={p.videoUrl} category={CATEGORY} onChange={(videoUrl) => patchProject(i, { videoUrl })} />
                  <ImageField label="Cover / thumbnail image" value={p.poster} category={CATEGORY} onChange={(poster) => patchProject(i, { poster })} />
                </div>
              ) : (
                <GalleryField label="Project images (first image is the cover)" value={p.images} category={CATEGORY} onChange={(images) => patchProject(i, { images })} />
              )}

              <label className="admin-checkbox">
                <input type="checkbox" checked={published} onChange={(e) => patchProject(i, { published: e.target.checked })} />
                Published
              </label>
            </div>
          );
        })}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setProjects([...projects, blankProject('gallery')])}>+ Add photo project</button>
          <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setProjects([...projects, blankProject('video')])}>+ Add video project</button>
        </div>
      </Section>
    </>
  );
}

/* ─────────────── Team overview ─────────────── */

export default function TeamEditor() {
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const skipDirty = useRef(true);

  useEffect(() => {
    api.get('/api/team', { params: { all: 1 } })
      .then((res) => setData({ section: res.data.section || {}, members: res.data.members || [] }))
      .catch(() => setLoadError('Could not load team content. Is the server running?'));
  }, []);

  useEffect(() => {
    if (!data) return;
    if (skipDirty.current) { skipDirty.current = false; return; }
    setDirty(true);
  }, [data]);

  const { saving, toast, save } = useAdminSave(async () => {
    setSaveError('');
    const unnamed = data.members.findIndex((m) => !m.name?.trim());
    if (unnamed !== -1) {
      const msg = `Team member ${unnamed + 1} needs a name before saving.`;
      setSaveError(msg);
      throw new Error(msg);
    }
    try {
      const res = await api.put('/api/team', data);
      // The server cleans lists and makes URLs unique; show what was stored.
      skipDirty.current = true;
      setData({ section: res.data.data.section, members: res.data.data.members });
      setDirty(false);
    } catch (err) {
      setSaveError(err.response?.data?.error || 'Save failed.');
      throw err;
    }
  });

  if (loadError) return <div className="admin-alert admin-alert--error">{loadError}</div>;
  if (!data) return <LoadingSkeleton />;

  const { section, members } = data;
  const setSection = (patch) => setData((prev) => ({ ...prev, section: { ...prev.section, ...patch } }));
  const setMembers = (next) => setData((prev) => ({ ...prev, members: next }));
  const editing = members.find((m) => m.id === editingId);

  const addMember = () => {
    const m = blankMember();
    setMembers([...members, m]);
    setEditingId(m.id);
    window.scrollTo({ top: 0 });
  };

  const removeMember = (index) => {
    const m = members[index];
    if (window.confirm(`Delete ${m.name || 'this team member'} and their whole portfolio? Uploaded files stay in the Media library.`)) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="admin-editor">
      <AdminToast toast={toast} />
      {saveError && <div className="admin-alert admin-alert--error">{saveError}</div>}

      {editing ? (
        <MemberEditor
          member={editing}
          allMembers={members}
          dirty={dirty}
          onBack={() => { setEditingId(null); window.scrollTo({ top: 0 }); }}
          onChange={(next) => setMembers(members.map((m) => (m.id === next.id ? next : m)))}
        />
      ) : (
        <>
          <div className="admin-editor__header">
            <h2>Our Team</h2>
            <a href="/#team" target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn--secondary">View on site ↗</a>
          </div>

          <Section title="Homepage Section" defaultOpen>
            <div className="admin-grid-2">
              <Field label="Eyebrow label"><Input value={section.label} onChange={(v) => setSection({ label: v })} /></Field>
              <Field label="Heading"><Input value={section.heading} onChange={(v) => setSection({ heading: v })} placeholder="Our Team" /></Field>
            </div>
            <Field label="Description"><Area rows={2} value={section.description} onChange={(v) => setSection({ description: v })} /></Field>
            <Field label="Card button text"><Input value={section.ctaText} onChange={(v) => setSection({ ctaText: v })} placeholder="View Portfolio" style={{ maxWidth: 260 }} /></Field>
            <label className="admin-checkbox">
              <input type="checkbox" checked={section.visible !== false} onChange={(e) => setSection({ visible: e.target.checked })} />
              Show the Our Team section on the homepage
            </label>
            <p className="grad-admin-note">
              The section only appears once at least one profile is published. Its position on the homepage is set in Content → Page Layout,
              and the “Our Team” link in Menu.
            </p>
          </Section>

          <Section title="Team Members" count={members.length} defaultOpen>
            {members.length === 0 ? (
              <div className="admin-empty-state"><div className="admin-empty-state__text">No team members yet. Add the first one below.</div></div>
            ) : (
              <div className="team-admin-list">
                {members.map((m, i) => (
                  <div key={m.id} className={`team-admin-row${m.published === false ? ' grad-admin-hidden' : ''}`}>
                    {m.photo ? <img className="team-admin-row__photo" src={m.photo} alt="" loading="lazy" /> : <span className="team-admin-row__photo" />}
                    <div className="team-admin-row__body">
                      <span className="team-admin-row__name">
                        {m.name || 'Unnamed'}
                        <StatusPill on={m.published !== false} />
                      </span>
                      <span className="team-admin-row__meta">
                        {[m.position, `${(m.projects || []).length} project${(m.projects || []).length === 1 ? '' : 's'}`, m.slug && `/team/${m.slug}`].filter(Boolean).join(' · ')}
                      </span>
                    </div>
                    <div className="team-admin-row__actions">
                      <button type="button" className="admin-btn admin-btn--sm" onClick={() => setMembers(move(members, i, -1))} disabled={i === 0} aria-label={`Move ${m.name} up`}>↑</button>
                      <button type="button" className="admin-btn admin-btn--sm" onClick={() => setMembers(move(members, i, 1))} disabled={i === members.length - 1} aria-label={`Move ${m.name} down`}>↓</button>
                      <button type="button" className="admin-btn admin-btn--sm admin-btn--primary" onClick={() => { setEditingId(m.id); window.scrollTo({ top: 0 }); }}>Edit</button>
                      <button type="button" className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => removeMember(i)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button type="button" className="admin-btn admin-btn--secondary" style={{ marginTop: 12 }} onClick={addMember}>+ Add team member</button>
          </Section>
        </>
      )}

      <AdminSaveBar saving={saving} onSave={save} dirty={dirty} />
    </div>
  );
}
