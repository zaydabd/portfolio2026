# Career content: where each fact comes from

Every claim in the page's `CAREER` data comes from a document in `portfolio-references/`.
Nothing was added from outside them. Where documents disagree, the choice and the reason are noted.

**Documents:** CV = `CV - Wan Zayd Abdullah Wan Akil Senior Technical Lead Updated.md` · LI = `Wan Zayd Abdullah _ LinkedIn (experience).md` ·
DET = `Developer portfolio details.md` · PROP = `Portfolio proposal.md` · BRIEF = `next-session-brief.md` · JOURNEY = `Developer portfolio journey.md`

## Bulb 1: AvePoint · Sunway University
| Claim | Source |
|---|---|
| Joined AvePoint, Kuala Lumpur, January 2026, full-stack developer / technical lead | LI ("Full Stack Developer / Technical Lead", Jan 2026 – Present) |
| Work covers architecture design, technical delivery, client discussions, hands-on development | LI |
| Placed at Sunway University from April 2026 | LI (Sunway University, Apr 2026 – Present) |
| Title Senior Technical Lead on iZone | CV, BRIEF, PROP; DET rule 4 allows it on iZone only |
| Project team of more than ten | LI ("project team of 10+") |
| Old portal did not scale, crashed at every enrolment peak, old interface, client wanted it modernised | DET (iZone problem) |
| Legacy system counted submissions before commit, which fails under concurrency | DET (iZone problem) |
| Owns the architecture: headless services, integration libraries, SSO, private gateway | LI; BRIEF; DET ("architecture owner") |
| Single sign-on through Microsoft | DET (iZone tools: "Microsoft single sign-on") |
| On-premise integration approach documented for the wider team | CV |
| C4 diagrams and technical design documents | LI |
| Kept the legacy database structure as a local replica | DET (iZone decision); PROP ("schema comes from the legacy application") |
| Row locking, SELECT FOR UPDATE on Aurora PostgreSQL, for enrolment | DET (iZone decision) |
| "wait their turn on the rows they touch": plain-language explanation of row locking | general meaning of SELECT FOR UPDATE, not a project claim |
| Integrations with the iZone API and cloud storage; batch sync with audit logging | CV |
| Responsive front-end features and progressive web app functionality | CV |
| Delivery on Jira; scoping with the business analyst team; planned load testing around key performance areas | CV |
| Client-facing requirements and delivery discussions | LI |
| Replica not well optimised; thin team, developed as well as led, stretched hard | DET (iZone trade-off) |
| Three developers, himself included | PROP; JOURNEY confirms PROP settles the DET open question |
| Deployed to live | DET (iZone outcome; "not yet in use" left out under DET rule 1, no relative time) |
| Load-tested at 40,000 enrolments over a sustained 20-minute window | DET, PROP |
| Tools: OutSystems ODC, Aurora PostgreSQL, Microsoft single sign-on, private gateway | DET |
| At Maybank September 2024 – January 2026 | LI |

## Bulb 2: Maybank
| Claim | Source |
|---|---|
| Platform team, Kuala Lumpur, from September 2024 | LI |
| Title Senior OutSystems Engineer | BRIEF ("his preferred wording"); DET timeline. PROP says "Senior Outsystems Developer" and LI says "Software Engineer"; the brief's preferred wording is used |
| Pushed technical governance beyond the OutSystems documentation | LI |
| Middleware patterns (modularity), presentational component pattern (separation of concerns) | LI |
| Diagnosed and fixed technical errors system-wide; platform performance; clean error logs | LI |
| Assigned to high-priority initiatives across teams more than once | LI ("Multiple time assigned…") |
| Left out: raising the design baseline for a team with no designer | PROP, "What it leaves out": his choice |
| No internal form platform; vendor-built forms; nothing confidential allowed | DET (Digital Form problem) |
| Technical Lead, Product Owner, sole developer | DET, PROP |
| Defined roadmap, integration strategy, user requirements as product owner | CV |
| Extensible question types; each MVP cycle added types and features and stabilised the platform | DET (decision) |
| Core component of the Dynamic Workflow Builder; connects GSAM, HRIS, MStatus, MPowered | CV; BRIEF |
| Workflow builder uses dynamic forms and SLA tracking to cut development time for workflow-only apps | LI ("Currently developing a workflow builder…"; "currently" dropped under DET rule 1). Treating LI's workflow builder as the CV's Dynamic Workflow Builder is a link between two sources |
| Each new question type added complexity | DET (trade-off) |
| Five MVP cycles | CV, BRIEF |
| Used across Maybank; over 80 forms by the fifth MVP; thousands of submissions and users | DET (outcome), PROP |
| Tools OutSystems O11 (all Maybank work) | DET |
| CAB-Q: Technical Lead and business analyst; deployment approvals across Maybank; workflow and governance; 6 hours → 30 minutes daily; feature scope and deployment strategy | CV; PROP; DET |
| Audit Log: Technical Lead and Product Owner; standardised, high-performance; across every OutSystems application; traceability and compliance | CV; DET |
| Tokenizer: Technical Lead; secures and simplifies public display strings; encrypted database; data privacy | CV |
| MPowered: internal agile project management platform on OutSystems; stability; recurring defects in core modules | CV |
| RPSST: prototype to modernise and replace legacy RBS transaction processes | CV |
| Two years with FPT Software, placed at PETRONAS Digital | LI (Sep 2022 – Sep 2024) |

## Bulb 3: FPT Software · PETRONAS Digital
| Claim | Source |
|---|---|
| FPT Software Malaysia, contract, September 2022 – September 2024 | LI |
| Placed at PETRONAS Digital as OutSystems developer | LI ("Outsystems Developer (FPT Payroll)", PETRONAS Digital Sdn Bhd) |
| Financing and auditing software team; designed, developed, maintained, enhanced features; digitalised parts of the department's work | LI |
| Auditors checked exceptions by hand, on files and paper | DET (MyInsights problem) |
| Automates detection of exceptions and anomalies; Finance, Assets, Maintenance, Procurement data | CV; BRIEF |
| One of four developers, not the lead; user management, permissions, front-end screens, part of the audit rules and data sync; almost every area except email | DET (MyInsights role and team) |
| Screens implemented from Figma designs with UI/UX designers | CV |
| Fixed set of roles, each tied to its business rules; different rules per user per module | DET (decision); CV |
| It cost little | DET (trade-off: "Low cost, in his account") |
| Millions of records through audit rules set by PETRONAS's financial sector; optimised logic | CV; BRIEF |
| Auditors centralise exceptions and process them in the system | DET (outcome) |
| Left out: "turned it from a monolithic module into a decentralized system" | BRIEF: marked wrong by Wan Zayd |
| Tools OutSystems O11 | DET |
| Adam Digital Assets: May – July 2024, part-time, remote, Flutter developer | LI |
| Islamic mosque signage app with management features, plus a website twin; with one other developer wrote requirements, designed and built | LI; DET |
| Tools Flutter | DET (Flutter only on Minor Projects, DET rule 3) |
| Five-month career break for a personal goal | LI (Apr – Aug 2022) |

## Bulb 4: Impact Business Solutions
| Claim | Source |
|---|---|
| Software engineer, contract, April 2021 – May 2022 | LI. The CV says "Software Consultant"; LinkedIn is used because BRIEF treats it as authoritative. **Confirm which you want.** |
| "My working record begins" here | Earliest entry in both LI and CV |
| VIP Dashboard: Power BI and QGIS; Sarawak data; VIP presentation; processed and analysed datasets for a static web dashboard | CV; DET |
| QR Asset Management: Flutter, Firebase backend; efficient data handling; real-time asset tracking | CV; DET |
| Career break April – August 2022, personal goal | LI |

## Signs
| Sign | Dates | Role | Source |
|---|---|---|---|
| AvePoint | 2026 – present | Senior Tech Lead | LI dates; CV/BRIEF title. "Tech" is shortened to fit, as in the sign preview you chose |
| Maybank | 2024 – 2026 | Senior OutSystems Engineer | LI dates; BRIEF title |
| FPT Software | 2022 – 2024 | OutSystems Developer | LI |
| Impact Business Solutions | 2021 – 2022 | Software Engineer | LI (see bulb 4) |

## Gaps left for you (shown as "TO WRITE" on the page)
- iZone: the hardest call you made, and what it cost you.
- Digital Form: what changed in each MVP cycle, and what the first one got wrong.
- MyInsights: the part you are proudest of, and why.
- Impact: what those first projects taught you.
- Impact role: "Software Engineer" (LinkedIn) or "Software Consultant" (CV)?
