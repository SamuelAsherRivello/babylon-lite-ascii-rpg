import changelog from "./data/changelog.json";

export function ChangelogWindow({ onClose, repositoryUrl, featurePaths }) {
  return (
    <div className="prompt_window" role="presentation">
      <div className="window_backdrop" aria-hidden="true" onClick={onClose} />
      <section className="window gameplay_settings_window changelog_window" role="dialog" aria-modal="true" aria-labelledby="changelog_title" onClick={(event) => event.stopPropagation()}>
        <div className="window_header"><h1 id="changelog_title" className="prompt_title">Changelog</h1><button className="prompt_button window_close" type="button" aria-label="Close Changelog" onClick={onClose}>X</button></div>
        <div className="prompt_body changelog_body">
          {changelog.releases.map((release) => <section key={release.version} className="changelog_release" aria-labelledby={`changelog_${release.version}`}>
            <h2 id={`changelog_${release.version}`}>v{release.version}</h2>
            <ul>{release.items.map((item) => { const label = typeof item === "string" ? item : item.label; const featurePath = typeof item === "string" ? featurePaths[item] : item.featurePath; return <li key={label}><a href={`${repositoryUrl}/blob/v${release.version}/${featurePath}`} target="_blank" rel="noopener noreferrer">{label}</a></li>; })}</ul>
          </section>)}
        </div>
      </section>
    </div>
  );
}
