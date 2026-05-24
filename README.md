<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Amir Hesam Piri | GitHub Profile</title>
  <meta name="description" content="Amir Hesam Piri - Marketing Project Manager at Digikala. Project Management, Marketing Operations, Digital Transformation, and Software Delivery." />
  <style>
    :root {
      --bg: #0b0b0f;
      --panel: #14141b;
      --panel-2: #1a1a23;
      --text: #f5f5f7;
      --muted: #a6a6b3;
      --red: #ff1f3d;
      --red-dark: #a80018;
      --line: rgba(255,255,255,0.1);
      --shadow: 0 20px 50px rgba(0,0,0,0.35);
      --radius: 22px;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background:
        radial-gradient(circle at top left, rgba(255,31,61,0.22), transparent 30%),
        radial-gradient(circle at bottom right, rgba(255,31,61,0.12), transparent 35%),
        var(--bg);
      color: var(--text);
      line-height: 1.65;
    }

    a { color: inherit; text-decoration: none; }

    .wrap {
      width: min(1120px, calc(100% - 32px));
      margin: 0 auto;
      padding: 48px 0;
    }

    .hero {
      position: relative;
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: 32px;
      background: linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02));
      box-shadow: var(--shadow);
      padding: 48px;
    }

    .hero::before {
      content: "";
      position: absolute;
      inset: -2px;
      background: linear-gradient(120deg, transparent, rgba(255,31,61,0.18), transparent);
      pointer-events: none;
    }

    .hero-inner { position: relative; z-index: 1; }

    .eyebrow {
      display: inline-flex;
      gap: 10px;
      align-items: center;
      color: var(--muted);
      border: 1px solid var(--line);
      padding: 8px 14px;
      border-radius: 999px;
      background: rgba(0,0,0,0.22);
      font-size: 14px;
    }

    .dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: var(--red);
      box-shadow: 0 0 20px var(--red);
    }

    h1 {
      margin: 24px 0 12px;
      font-size: clamp(42px, 8vw, 84px);
      line-height: 0.95;
      letter-spacing: -0.06em;
    }

    .hero-title span { color: var(--red); }

    .subtitle {
      max-width: 780px;
      color: var(--muted);
      font-size: clamp(18px, 2.5vw, 24px);
      margin: 0 0 28px;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 28px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 18px;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: rgba(255,255,255,0.06);
      color: var(--text);
      font-weight: 700;
      transition: 180ms ease;
    }

    .btn.primary {
      background: linear-gradient(135deg, var(--red), var(--red-dark));
      border-color: rgba(255,255,255,0.16);
    }

    .btn:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.25); }

    .grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 18px;
      margin-top: 18px;
    }

    .card {
      background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03));
      border: 1px solid var(--line);
      border-radius: var(--radius);
      padding: 24px;
      box-shadow: 0 14px 36px rgba(0,0,0,0.2);
    }

    .span-4 { grid-column: span 4; }
    .span-5 { grid-column: span 5; }
    .span-6 { grid-column: span 6; }
    .span-7 { grid-column: span 7; }
    .span-8 { grid-column: span 8; }
    .span-12 { grid-column: span 12; }

    h2 {
      margin: 0 0 14px;
      font-size: 24px;
      letter-spacing: -0.03em;
    }

    p { margin: 0 0 14px; color: var(--muted); }

    .tagline {
      color: var(--text);
      font-size: 18px;
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 14px;
    }

    .chip {
      border: 1px solid rgba(255,31,61,0.35);
      background: rgba(255,31,61,0.08);
      color: #ffd8de;
      padding: 8px 12px;
      border-radius: 999px;
      font-size: 14px;
      font-weight: 650;
    }

    .timeline {
      display: grid;
      gap: 14px;
    }

    .item {
      padding: 16px;
      border-radius: 18px;
      background: rgba(0,0,0,0.18);
      border: 1px solid var(--line);
    }

    .item strong {
      display: block;
      font-size: 16px;
      color: var(--text);
      margin-bottom: 3px;
    }

    .item small {
      display: block;
      color: var(--red);
      font-weight: 750;
      margin-bottom: 8px;
    }

    .bars { display: grid; gap: 13px; }

    .bar-row {
      display: grid;
      grid-template-columns: 190px 1fr;
      align-items: center;
      gap: 14px;
      color: var(--muted);
      font-size: 14px;
    }

    .bar {
      height: 10px;
      background: rgba(255,255,255,0.08);
      border-radius: 999px;
      overflow: hidden;
    }

    .fill {
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(90deg, var(--red), #ff7185);
    }

    .stat-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }

    .stat {
      padding: 18px;
      border-radius: 18px;
      background: rgba(0,0,0,0.22);
      border: 1px solid var(--line);
    }

    .stat b {
      display: block;
      font-size: 28px;
      line-height: 1;
      color: var(--red);
      margin-bottom: 6px;
    }

    .stat span { color: var(--muted); font-size: 13px; }

    .github-widgets {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      justify-content: center;
      align-items: stretch;
    }

    .github-widgets img {
      max-width: 100%;
      border-radius: 16px;
      border: 1px solid var(--line);
      background: rgba(0,0,0,0.18);
    }

    .footer {
      text-align: center;
      color: var(--muted);
      padding: 30px 0 0;
      font-size: 14px;
    }

    ul {
      margin: 10px 0 0;
      padding-left: 20px;
      color: var(--muted);
    }

    li { margin: 7px 0; }

    code {
      background: rgba(255,255,255,0.08);
      padding: 3px 7px;
      border-radius: 8px;
      color: #ffd8de;
    }

    @media (max-width: 860px) {
      .hero { padding: 32px 24px; }
      .span-4, .span-5, .span-6, .span-7, .span-8 { grid-column: span 12; }
      .stat-grid { grid-template-columns: repeat(2, 1fr); }
      .bar-row { grid-template-columns: 1fr; gap: 6px; }
    }

    @media (max-width: 520px) {
      .wrap { width: min(100% - 22px, 1120px); padding: 22px 0; }
      .hero { border-radius: 24px; }
      .stat-grid { grid-template-columns: 1fr; }
      .btn { width: 100%; }
    }
  </style>
</head>
<body>
  <main class="wrap">
    <section class="hero">
      <div class="hero-inner">
        <div class="eyebrow"><span class="dot"></span> GitHub Profile · he8um</div>
        <h1 class="hero-title">Amir Hesam <span>Piri</span></h1>
        <p class="subtitle">Marketing Project Manager at Digikala, focused on project management, marketing operations, digital transformation, process optimization, and software delivery.</p>
        <div class="actions">
          <a class="btn primary" href="https://github.com/he8um" target="_blank" rel="noopener">GitHub</a>
          <a class="btn" href="https://www.linkedin.com/in/he8um/" target="_blank" rel="noopener">LinkedIn</a>
          <a class="btn" href="mailto:amirhesum@gmail.com">Email</a>
          <a class="btn" href="https://xhesam.com" target="_blank" rel="noopener">Website</a>
        </div>
      </div>
    </section>

    <section class="grid">
      <article class="card span-7">
        <h2>About</h2>
        <p class="tagline">I turn unclear workflows, scattered priorities, and cross-functional chaos into structured delivery systems.</p>
        <p>My work sits at the intersection of marketing operations, software delivery, stakeholder coordination, documentation, and automation-minded process design. In plain human terms: fewer messy follow-ups, clearer ownership, and better execution.</p>
        <div class="chips">
          <span class="chip">Project Management</span>
          <span class="chip">Marketing Operations</span>
          <span class="chip">Digital Transformation</span>
          <span class="chip">Software Delivery</span>
          <span class="chip">Process Optimization</span>
          <span class="chip">Stakeholder Management</span>
        </div>
      </article>

      <aside class="card span-5">
        <h2>Profile Snapshot</h2>
        <div class="stat-grid">
          <div class="stat"><b>PM</b><span>Project Management</span></div>
          <div class="stat"><b>Ops</b><span>Marketing Operations</span></div>
          <div class="stat"><b>DX</b><span>Digital Transformation</span></div>
          <div class="stat"><b>SD</b><span>Software Delivery</span></div>
        </div>
      </aside>

      <article class="card span-6">
        <h2>Core Strengths</h2>
        <div class="bars">
          <div class="bar-row"><span>Project Management</span><div class="bar"><div class="fill" style="width: 98%"></div></div></div>
          <div class="bar-row"><span>Marketing Operations</span><div class="bar"><div class="fill" style="width: 94%"></div></div></div>
          <div class="bar-row"><span>Software Delivery</span><div class="bar"><div class="fill" style="width: 90%"></div></div></div>
          <div class="bar-row"><span>Process Optimization</span><div class="bar"><div class="fill" style="width: 95%"></div></div></div>
          <div class="bar-row"><span>Documentation</span><div class="bar"><div class="fill" style="width: 92%"></div></div></div>
          <div class="bar-row"><span>Automation Thinking</span><div class="bar"><div class="fill" style="width: 88%"></div></div></div>
        </div>
      </article>

      <article class="card span-6">
        <h2>Tools & Platforms</h2>
        <div class="chips">
          <span class="chip">Jira</span>
          <span class="chip">Airtable</span>
          <span class="chip">Notion</span>
          <span class="chip">Git</span>
          <span class="chip">GitHub</span>
          <span class="chip">Excel</span>
          <span class="chip">Documentation</span>
          <span class="chip">Dashboards</span>
        </div>
        <p style="margin-top: 16px;">Tools are useful. Systems are better. Random chat messages pretending to be project management are, regrettably, still everywhere.</p>
      </article>

      <article class="card span-8">
        <h2>Experience</h2>
        <div class="timeline">
          <div class="item">
            <strong>Digikala — Marketing Project Manager</strong>
            <small>Jan 2026 – Present · Tehran</small>
            <p>Leading marketing operations initiatives, improving workflows, coordinating cross-functional teams, and supporting campaign execution quality.</p>
          </div>
          <div class="item">
            <strong>Digikala — Senior Marketing Project Management Specialist</strong>
            <small>Oct 2024 – Jan 2026 · Tehran</small>
            <p>Oversaw content development and strategic initiatives, collaborated across teams, and contributed to Digikala Mag’s digital media growth.</p>
          </div>
          <div class="item">
            <strong>Iransamaneh — Lead Project Manager / Project Control Manager</strong>
            <small>Sep 2022 – Sep 2024 · Tehran</small>
            <p>Managed software project lifecycles, project control, client requirements, reporting, planning, execution, and stakeholder communication.</p>
          </div>
          <div class="item">
            <strong>Hardafilm — Senior PM Consultant / Digital Project Manager</strong>
            <small>Dec 2021 – Sep 2024 · Tehran</small>
            <p>Consulted on roadmap planning, delivery processes, and digital project execution across media and product initiatives.</p>
          </div>
          <div class="item">
            <strong>Achilaandoor — Technical Project Consultant</strong>
            <small>Mar 2024 – Aug 2024 · Tehran</small>
            <p>Led technical project planning, scoping, resource allocation, client communication, and delivery governance.</p>
          </div>
        </div>
      </article>

      <aside class="card span-4">
        <h2>Education</h2>
        <div class="item">
          <strong>University of Tehran</strong>
          <small>MBA, Project Management · 2024 – 2025</small>
        </div>
        <div class="item" style="margin-top: 12px;">
          <strong>Islamic Azad University</strong>
          <small>B.A., English Language and Literature · 2020 – 2024</small>
        </div>
        <h2 style="margin-top: 22px;">Languages</h2>
        <ul>
          <li>Kurdish — Native / Bilingual</li>
          <li>Persian — Native / Bilingual</li>
          <li>English — Professional Working</li>
        </ul>
      </aside>

      <article class="card span-12">
        <h2>Certifications</h2>
        <div class="chips">
          <span class="chip">Version Control with Git</span>
          <span class="chip">Agile with Atlassian Jira</span>
          <span class="chip">Color Psychology</span>
          <span class="chip">UX Design Foundations</span>
          <span class="chip">IBM AI Foundations for Business</span>
        </div>
      </article>

      <article class="card span-12">
        <h2>GitHub Activity</h2>
        <p>These widgets use public GitHub stats services. If one goes down, the rest of the page still works, because apparently we must design around the fragility of the internet like responsible adults.</p>
        <div class="github-widgets">
          <img alt="GitHub stats" src="https://github-readme-stats.vercel.app/api?username=he8um&show_icons=true&count_private=true&theme=transparent&hide_border=true&title_color=ff1f3d&icon_color=ff1f3d&text_color=a6a6b3" />
          <img alt="Top languages" src="https://github-readme-stats.vercel.app/api/top-langs/?username=he8um&layout=compact&theme=transparent&hide_border=true&title_color=ff1f3d&text_color=a6a6b3" />
          <img alt="GitHub streak" src="https://streak-stats.demolab.com?user=he8um&theme=transparent&hide_border=true&ring=ff1f3d&fire=ff1f3d&currStreakLabel=ff1f3d" />
        </div>
      </article>

      <article class="card span-12">
        <h2>Current Focus</h2>
        <ul>
          <li>Building better delivery systems for marketing and business teams.</li>
          <li>Reducing operational noise through documentation, automation, and structured workflows.</li>
          <li>Improving campaign execution, team alignment, and reporting quality.</li>
          <li>Creating technical projects that are useful, maintainable, and not doomed to become abandoned digital fossils.</li>
        </ul>
      </article>
    </section>

    <footer class="footer">
      <p>Project manager by role. Systems thinker by habit. Automation enthusiast because manual chaos remains humanity’s most persistent software bug.</p>
    </footer>
  </main>
</body>
</html>
