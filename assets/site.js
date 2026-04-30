const text = (value) => (value == null ? "" : String(value));

const escapeHtml = (value) =>
  text(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const setText = (selector, value) => {
  document.querySelectorAll(selector).forEach((node) => {
    node.textContent = text(value);
  });
};

const setLinkedText = (selector, value, links = []) => {
  const escaped = escapeHtml(value);
  const html = links.reduce((content, item) => {
    if (!item.label || !item.url) return content;
    const label = escapeHtml(item.label);
    return content.replace(label, `<a href="${item.url}" target="_blank" rel="noreferrer">${label}</a>`);
  }, escaped);

  document.querySelectorAll(selector).forEach((node) => {
    node.innerHTML = html;
  });
};

const link = ({ label, url, primary = false }) => {
  if (!url) return "";
  return `<a class="button-link${primary ? " primary" : ""}" href="${url}" target="_blank" rel="noreferrer">${label}</a>`;
};

const card = (item) => `
  <article class="card">
    <h3>${item.url ? `<a href="${item.url}" target="_blank" rel="noreferrer">${item.title}</a>` : item.title}</h3>
    ${item.meta ? `<span class="meta">${item.meta}</span>` : ""}
    <p>${item.description}</p>
  </article>
`;

const timelineItem = (item) => `
  <article class="timeline-item">
    <div>
      <h3>${item.role || item.degree}</h3>
      <span class="meta">${item.organizationUrl ? `<a href="${item.organizationUrl}" target="_blank" rel="noreferrer">${item.organization}</a>` : item.organization}</span>
      <p>${item.description}</p>
    </div>
    <span class="date">${item.period}</span>
  </article>
`;

const publication = (item) => `
  <article class="publication">
    <div class="publication-top">
      <h3>${item.title}</h3>
      ${item.url ? `<a href="${item.url}" target="_blank" rel="noreferrer">${item.venue}</a>` : `<span class="meta">${item.venue}</span>`}
    </div>
    <span class="meta">${item.authors} - ${item.year}</span>
    <p>${item.description}</p>
  </article>
`;

const render = (profile) => {
  setText('[data-profile="kicker"]', profile.kicker);
  setText('[data-profile="name"]', profile.name);
  setText('[data-profile="headline"]', profile.headline);
  setLinkedText('[data-profile="bio"]', profile.bio, profile.bioLinks);
  setText('[data-profile="contactNote"]', profile.contactNote);

  document.querySelector('[data-profile-list="links"]').innerHTML = profile.links
    .filter((item) => item.url)
    .map(link)
    .join("");

  document.querySelector('[data-profile-list="contactLinks"]').innerHTML = profile.contactLinks
    .filter((item) => item.url)
    .map(link)
    .join("");

  document.querySelector('[data-profile-list="research"]').innerHTML = profile.research.map(card).join("");
  document.querySelector('[data-profile-list="experience"]').innerHTML = profile.experience.map(timelineItem).join("");
  document.querySelector('[data-profile-list="education"]').innerHTML = profile.education.map(timelineItem).join("");
  document.querySelector('[data-profile-list="publications"]').innerHTML = profile.publications.map(publication).join("");
  document.querySelector('[data-profile-list="projects"]').innerHTML = profile.projects.map(card).join("");
  document.querySelector('[data-profile-list="skills"]').innerHTML = profile.skills.map((skill) => `<span class="skill">${skill}</span>`).join("");

  document.body.classList.remove("is-loading");
};

document.body.classList.add("is-loading");

fetch("data/profile.json")
  .then((response) => {
    if (!response.ok) throw new Error(`Profile request failed: ${response.status}`);
    return response.json();
  })
  .then(render)
  .catch((error) => {
    document.body.classList.remove("is-loading");
    console.error(error);
  });
