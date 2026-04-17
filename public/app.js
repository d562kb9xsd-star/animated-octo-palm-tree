<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>UFO Archive Pro</title>
  <link rel="stylesheet" href="styles.css" />
  <style>
    :root {
      --bg: #07111f;
      --bg2: #0d1b2e;
      --card: rgba(255,255,255,0.08);
      --border: rgba(255,255,255,0.12);
      --text: #eef4ff;
      --muted: #a9b8d1;
      --accent: #79c7ff;
      --accent2: #b77dff;
      --success: #6ee7b7;
      --danger: #ff8c8c;
      --shadow: 0 20px 50px rgba(0,0,0,0.35);
      --radius: 22px;
      --max: 1180px;
    }

    * {
      box-sizing: border-box;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--text);
      background:
        radial-gradient(circle at top, rgba(121,199,255,0.18), transparent 32%),
        radial-gradient(circle at 80% 15%, rgba(183,125,255,0.16), transparent 24%),
        linear-gradient(180deg, var(--bg), var(--bg2));
      min-height: 100vh;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    .container {
      width: min(var(--max), calc(100% - 32px));
      margin: 0 auto;
    }

    .glass {
      background: var(--card);
      border: 1px solid var(--border);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      box-shadow: var(--shadow);
      border-radius: var(--radius);
    }

    .nav {
      position: sticky;
      top: 0;
      z-index: 50;
      background: rgba(6,12,22,0.72);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }

    .nav-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 72px;
      gap: 16px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 800;
      letter-spacing: 0.3px;
    }

    .brand-badge {
      width: 40px;
      height: 40px;
      border-radius: 14px;
      display: grid;
      place-items: center;
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      color: #04111f;
      font-weight: 900;
      box-shadow: 0 8px 25px rgba(121,199,255,0.35);
    }

    .nav-links {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .nav-links a {
      padding: 10px 14px;
      border-radius: 999px;
      color: var(--muted);
      transition: 0.2s ease;
      font-weight: 600;
    }

    .nav-links a:hover {
      background: rgba(255,255,255,0.08);
      color: var(--text);
    }

    .hero {
      padding: 72px 0 44px;
    }

    .hero-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 26px;
      align-items: stretch;
    }

    .hero-card,
    .hero-side {
      padding: 28px;
    }

    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: 1px solid rgba(121,199,255,0.22);
      color: var(--accent);
      background: rgba(121,199,255,0.08);
      border-radius: 999px;
      padding: 8px 12px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.2px;
    }

    h1 {
      font-size: clamp(36px, 6vw, 64px);
      line-height: 1.02;
      margin: 16px 0 16px;
      letter-spacing: -1.4px;
    }

    .hero p.lead {
      font-size: 18px;
      line-height: 1.7;
      color: var(--muted);
      max-width: 760px;
      margin: 0 0 24px;
    }

    .hero-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 20px;
    }

    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 48px;
      padding: 0 18px;
      border-radius: 14px;
      border: 1px solid transparent;
      font-weight: 700;
      cursor: pointer;
      transition: 0.2s ease;
    }

    .button-primary {
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      color: #07111f;
      box-shadow: 0 12px 28px rgba(121,199,255,0.28);
    }

    .button-primary:hover {
      transform: translateY(-1px);
    }

    .button-secondary {
      background: rgba(255,255,255,0.05);
      border-color: rgba(255,255,255,0.1);
      color: var(--text);
    }

    .button-secondary:hover {
      background: rgba(255,255,255,0.08);
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 26px;
    }

    .stat {
      padding: 16px;
      border-radius: 18px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
    }

    .stat strong {
      display: block;
      font-size: 26px;
      margin-bottom: 6px;
    }

    .stat span {
      color: var(--muted);
      font-size: 14px;
    }

    .hero-side {
      display: flex;
      flex-direction: column;
      gap: 16px;
      justify-content: center;
    }

    .signal {
      padding: 18px;
      border-radius: 18px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
    }

    .signal h3 {
      margin: 0 0 10px;
      font-size: 16px;
    }

    .signal p {
      margin: 0;
      color: var(--muted);
      line-height: 1.6;
      font-size: 14px;
    }

    .section {
      padding: 24px 0 18px;
    }

    .section-header {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 18px;
    }

    .section-header h2 {
      margin: 0;
      font-size: clamp(24px, 4vw, 36px);
      letter-spacing: -0.8px;
    }

    .section-header p {
      margin: 8px 0 0;
      color: var(--muted);
      max-width: 720px;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
    }

    .feature-card,
    .case-card,
    .steps-card {
      padding: 22px;
    }

    .feature-card h3,
    .case-card h3,
    .steps-card h3 {
      margin: 0 0 10px;
      font-size: 20px;
    }

    .feature-card p,
    .case-card p,
    .steps-card p {
      margin: 0;
      color: var(--muted);
      line-height: 1.7;
    }

    .badge-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 14px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border-radius: 999px;
      padding: 8px 10px;
      font-size: 12px;
      font-weight: 700;
      background: rgba(255,255,255,0.07);
      color: var(--text);
      border: 1px solid rgba(255,255,255,0.08);
    }

    .steps {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
    }

    .step-number {
      width: 36px;
      height: 36px;
      border-radius: 12px;
      display: grid;
      place-items: center;
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      color: #05111f;
      font-weight: 900;
      margin-bottom: 14px;
    }

    .cta {
      padding: 20px 0 72px;
    }

    .cta-card {
      padding: 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    .cta-card h2 {
      margin: 0 0 8px;
      font-size: 30px;
    }

    .cta-card p {
      margin: 0;
      color: var(--muted);
      max-width: 700px;
    }

    .footer {
      padding: 0 0 28px;
      color: var(--muted);
      font-size: 14px;
    }

    @media (max-width: 980px) {
      .hero-grid,
      .grid-3,
      .steps,
      .stats {
        grid-template-columns: 1fr;
      }

      .hero {
        padding-top: 48px;
      }

      .nav-inner {
        flex-direction: column;
        align-items: flex-start;
        padding: 12px 0;
      }
    }
  </style>
</head>
<body>
  <nav class="nav">
    <div class="container nav-inner">
      <a href="index.html" class="brand">
        <span class="brand-badge">🛸</span>
        <span data-site-name>UFO Archive Pro</span>
      </a>

      <div class="nav-links">
        <a href="index.html">Home</a>
        <a href="archive.html">Archive</a>
        <a href="submit.html">Submit</a>
        <a href="admin.html">Admin</a>
      </div>
    </div>
  </nav>

  <main>
    <section class="hero">
      <div class="container hero-grid">
        <div class="glass hero-card">
          <div class="eyebrow">Public sightings archive • Evidence-led reporting</div>
          <h1>Document sightings, upload evidence, and build a serious UFO case archive.</h1>
          <p class="lead">
            UFO Archive Pro is a public-facing reporting platform for videos, images, witness statements,
            and case studies. Visitors can submit sightings, moderators can review evidence, and approved
            reports appear in a searchable public archive.
          </p>

          <div class="hero-actions">
            <a class="button button-primary" href="submit.html">Submit a case</a>
            <a class="button button-secondary" href="archive.html">Browse archive</a>
            <a class="button button-secondary" href="admin.html">Admin panel</a>
          </div>

          <div class="stats">
            <div class="stat">
              <strong>Images</strong>
              <span>Upload photos and visual evidence</span>
            </div>
            <div class="stat">
              <strong>Video</strong>
              <span>Attach recordings and footage</span>
            </div>
            <div class="stat">
              <strong>Cases</strong>
              <span>Publish reviewed sightings publicly</span>
            </div>
          </div>
        </div>

        <div class="glass hero-side">
          <div class="signal">
            <h3>What gets stored</h3>
            <p>Title, type, observed date, location, summary, witness description, case study notes, media, and moderation status.</p>
          </div>
          <div class="signal">
            <h3>How moderation works</h3>
            <p>Every new report enters the queue as pending. Admins can review, approve, reject, or remove items from the moderation dashboard.</p>
          </div>
          <div class="signal">
            <h3>What the public sees</h3>
            <p>Only approved reports show in the public archive, helping keep the front-facing site cleaner and easier to browse.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header">
          <div>
            <h2>Built for evidence-first reporting</h2>
            <p>A clear flow for collecting sightings, reviewing them, and publishing only what you want visible to the public.</p>
          </div>
        </div>

        <div class="grid-3">
          <article class="glass feature-card">
            <h3>Submission portal</h3>
            <p>Visitors can submit sightings with details, dates, locations, written reports, and media attachments from one form.</p>
            <div class="badge-row">
              <span class="badge">Public intake</span>
              <span class="badge">Media upload</span>
              <span class="badge">Case notes</span>
            </div>
          </article>

          <article class="glass feature-card">
            <h3>Moderation dashboard</h3>
            <p>Admins can log in, review pending cases, open details, approve valid submissions, reject weak ones, or remove spam entirely.</p>
            <div class="badge-row">
              <span class="badge">Approve</span>
              <span class="badge">Reject</span>
              <span class="badge">Delete</span>
            </div>
          </article>

          <article class="glass feature-card">
            <h3>Public archive</h3>
            <p>Approved cases appear in the archive where visitors can browse sightings, search reports, and inspect evidence.</p>
            <div class="badge-row">
              <span class="badge">Approved only</span>
              <span class="badge">Searchable</span>
              <span class="badge">Clean display</span>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header">
          <div>
            <h2>How the site works</h2>
            <p>A simple workflow that keeps the public-facing archive separate from your moderation queue.</p>
          </div>
        </div>

        <div class="steps">
          <article class="glass steps-card">
            <div class="step-number">1</div>
            <h3>Someone submits a sighting</h3>
            <p>They fill out the form, upload evidence, and send in the report for review.</p>
          </article>

          <article class="glass steps-card">
            <div class="step-number">2</div>
            <h3>Admin reviews the evidence</h3>
            <p>You open the admin panel, inspect the case, and decide whether to approve, reject, or remove it.</p>
          </article>

          <article class="glass steps-card">
            <div class="step-number">3</div>
            <h3>Approved cases go public</h3>
            <p>Only approved items show in the archive, keeping the public side more controlled and credible.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header">
          <div>
            <h2>What this homepage should feel like</h2>
            <p>This version is designed to feel more like a real platform than a placeholder page.</p>
          </div>
        </div>

        <div class="grid-3">
          <article class="glass case-card">
            <h3>Professional landing page</h3>
            <p>A cleaner introduction with stronger navigation and clearer entry points to submit, browse, or moderate.</p>
          </article>
          <article class="glass case-card">
            <h3>Stronger branding</h3>
            <p>More confident wording and a clearer identity for the archive, without changing the rest of your site structure.</p>
          </article>
          <article class="glass case-card">
            <h3>Ready for expansion</h3>
            <p>You can later add counters, featured sightings, maps, timelines, or latest approved reports to this same layout.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="cta">
      <div class="container">
        <div class="glass cta-card">
          <div>
            <h2>Start documenting new reports now</h2>
            <p>Use the submission page for new sightings, the archive for approved public cases, and the admin panel for moderation.</p>
          </div>

          <div class="hero-actions">
            <a class="button button-primary" href="submit.html">Open submission form</a>
            <a class="button button-secondary" href="archive.html">Open archive</a>
          </div>
        </div>
      </div>
    </section>

    <div class="container footer">
      <div>UFO Archive Pro · Public reporting, evidence review, and moderated case publishing.</div>
    </div>
  </main>

  <script src="config.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="app.js"></script>
</body>
</html>
