export default function GradSectionHeader({ label, heading, description, dark = false, children }) {
  return (
    <div className={`grad-header${dark ? ' grad-header--dark' : ''}`} data-animate="fade-up">
      {label && <span className="grad-header__label">{label}</span>}
      {heading && <h2 className="grad-header__title">{heading}</h2>}
      {description && <p className="grad-header__desc">{description}</p>}
      {children}
    </div>
  );
}
