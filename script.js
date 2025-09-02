document.addEventListener('DOMContentLoaded', function onReady() {
  const navToggleButton = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (navToggleButton && nav) {
    navToggleButton.addEventListener('click', function onToggle() {
      const isOpen = nav.classList.toggle('open');
      navToggleButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // Smooth scroll for in-page anchors
  document.querySelectorAll('a[href^="#"]').forEach(function attach(anchor) {
    anchor.addEventListener('click', function onClick(e) {
      const targetId = anchor.getAttribute('href');
      const targetEl = targetId ? document.querySelector(targetId) : null;
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (nav && nav.classList.contains('open') && navToggleButton) {
          nav.classList.remove('open');
          navToggleButton.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });

  // Contact form → mailto: bridge
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function onSubmit(e) {
      e.preventDefault();
      const name = contactForm.name.value.trim();
      const email = contactForm.email.value.trim();
      const message = contactForm.message.value.trim();

      const subject = `New message from ${name || 'Website Visitor'}`;
      const bodyLines = [
        `Name: ${name}`,
        `Email: ${email}`,
        '',
        message
      ];
      const body = encodeURIComponent(bodyLines.join('\n'));
      const mailto = `mailto:ds04222@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;
      window.location.href = mailto;
      contactForm.reset();
    });
  }

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // ===== Course App State =====
  const COURSE_TOTAL = 61; // as per provided outline
  const dayListEl = document.getElementById('day-list');
  const lessonContentEl = document.getElementById('lesson-content');
  const progressBarEl = document.getElementById('progress-bar');
  const progressCountEl = document.getElementById('progress-count');
  const searchEl = document.getElementById('search');
  const btnPrev = document.getElementById('prev-day');
  const btnNext = document.getElementById('next-day');
  const btnComplete = document.getElementById('mark-complete');
  const conversationsGrid = document.getElementById('conversations-grid');
  const appendixList = document.getElementById('appendix-list');

  if (!dayListEl || !lessonContentEl) return;

  // Syllabus data (compact index with titles)
  const syllabus = [
    // 1–10 (Expedition 1)
    'बोलचाल में अभिवादन के वाक्य',
    'अंग्रेज़ी में शिष्टाचार / शिष्टाचार के कुछ वाक्य',
    'भावबोधक',
    'छोटे-छोटे वाक्यांश / आदेश',
    'वर्तमान काल',
    'भूतकाल',
    'भविष्यत् काल',
    'महत्त्वपूर्ण सहायक क्रियाएँ',
    'आज्ञा/प्रार्थना',
    'अभ्यास तालिकाएँ',
    // 11–20 (Expedition 2)
    'रोमन लिपि की वर्णमाला',
    'स्वर और व्यंजन',
    'अंग्रेज़ी उच्चारण',
    'व्यंजन का उच्चारण',
    'Silent letters',
    'What/Who/How का प्रयोग',
    'Which/When/Where/Why का प्रयोग',
    'प्रश्नवाचक वाक्य-रचना',
    'नकारात्मक वाक्य',
    'अभ्यास',
    // 21–30 (Expedition 3)
    'सर्वनाम और अन्य (he/she/it/this/that/you/I)',
    'Prepositions – on/at/into/in/of/to/by/with',
    'Co-relatives / Temporals',
    'Prepositions uses (from/by/with/into/...)',
    'Active & Passive Voice',
    'Transformation of Sentences',
    'Countable/Uncountable/Emphasis',
    'Miscellaneous Uses',
    'Countable/Uncountable Sentences / Idioms',
    'Drill Tables',
    // 31–38 (Expedition 4)
    'Invitation/Meeting/Parting/Gratitude/Congrats',
    'Refusal/Believing/Request',
    'Meals',
    'Time/Permission',
    'Instruction/Order/Encouragement/Consolation',
    'Negation/Consent/Sadness',
    'Quarrel/Apologies/Anger',
    'Exercises',
    // 41–48 (Expedition 5) – using compact mapping; fill gaps for continuity
    'घर में (At Home)',
    'घर से बाहर / नौकर से',
    'मिलने पर (On Meeting)',
    'खरीदारी (Shopping)',
    'अध्ययन (Study)',
    'स्वास्थ्य/मौसम',
    'जीव-जंतु/खेल-कूद',
    'व्यक्ति/आयु/चरित्र/वस्त्र',
    // 51–61 (Expedition 6 + Pronunciation)
    'सभ्यता-शिष्टाचार/चेतावनी-संकेत',
    'दफ़्तर/वस्तुएँ',
    'कानून/Radio/TV/डाकखाना',
    'यात्रा (Travel)',
    'मनोरंजन/Don’ts/Do’s',
    'लेन-देन/व्यापार',
    'नीति वाक्य (Sayings)',
    'विवाह/सिनेमा/मैदान/टूरिस्ट/होटल/डॉक्टर/नौकर/सामान्य',
    'मुहावरे/लोकोक्तियाँ',
    'Exercises',
    'Pronunciation (Rapidex)'
  ];

  // Ensure we have 61 items; if fewer, fill placeholders
  while (syllabus.length < COURSE_TOTAL) syllabus.push('Lesson');

  const expeditionOf = function computeExpedition(day) {
    if (day <= 10) return 1;
    if (day <= 20) return 2;
    if (day <= 30) return 3;
    if (day <= 38) return 4;
    if (day <= 48) return 5;
    return 6; // 49–61
  };

  const state = {
    activeDay: 0,
    completed: new Set(JSON.parse(localStorage.getItem('rapid_english_completed') || '[]')),
  };

  function saveProgress() {
    localStorage.setItem('rapid_english_completed', JSON.stringify(Array.from(state.completed)));
    updateProgressUI();
    renderDayList();
  }

  function updateProgressUI() {
    const done = state.completed.size;
    const pct = Math.round((done / COURSE_TOTAL) * 100);
    if (progressBarEl) progressBarEl.style.width = pct + '%';
    if (progressCountEl) progressCountEl.textContent = String(done);
  }

  function renderDayList(filter = '') {
    const q = filter.trim().toLowerCase();
    dayListEl.innerHTML = '';

    // Master header
    const master = document.createElement('button');
    master.type = 'button';
    master.className = 'exp-master';
    master.textContent = 'Expeditions';
    master.addEventListener('click', function () {
      // Toggle all groups open/closed based on first group's state
      const firstGroup = dayListEl.querySelector('.exp-group');
      const shouldOpen = !(firstGroup && firstGroup.classList.contains('open'));
      dayListEl.querySelectorAll('.exp-group').forEach(function (g) {
        if (shouldOpen) g.classList.add('open'); else g.classList.remove('open');
      });
    });
    dayListEl.appendChild(master);

    // Build 6 expedition groups with their day ranges
    const expRanges = [
      [1, 10],
      [11, 20],
      [21, 30],
      [31, 38],
      [39, 48],
      [49, COURSE_TOTAL]
    ];

    const activeExp = expeditionOf(state.activeDay);

    expRanges.forEach(function (range, expIdx) {
      const expNum = expIdx + 1;
      const start = range[0];
      const end = range[1];

      // Container
      const group = document.createElement('div');
      group.className = 'exp-group' + (expNum === activeExp ? ' open' : '');
      group.setAttribute('data-exp', String(expNum));

      // Header button
      const header = document.createElement('button');
      header.type = 'button';
      header.className = 'exp-header';
      // Completed count for this expedition
      var completedCount = 0;
      for (var d = start; d <= end; d++) if (state.completed.has(d)) completedCount++;
      const totalCount = end - start + 1;
      header.innerHTML = `Expedition ${expNum} <span class="muted">(${start}–${end})</span> <span class="badge">${completedCount}/${totalCount}</span>`;
      header.addEventListener('click', function () {
        group.classList.toggle('open');
      });

      // Body list
      const body = document.createElement('div');
      body.className = 'exp-body';

      // Add days for this expedition
      for (var day = start; day <= end; day++) {
        const title = syllabus[day - 1] || 'Lesson';
        const text = `Day ${day}: ${title}`;
        if (q && !text.toLowerCase().includes(q)) continue;
        const a = document.createElement('a');
        a.href = '#course';
        a.className = 'day-item' + (state.completed.has(day) ? ' completed' : '') + (state.activeDay === day ? ' active' : '');
        a.setAttribute('data-day', String(day));
        var isActive = state.activeDay === day;
        a.innerHTML = `<div><strong>${text}</strong><br/><small>Expedition ${expNum}</small></div><div class="day-controls"><input type="checkbox" class="active-checkbox" ${isActive ? 'checked' : ''} aria-label="Selected day" disabled /><div class="status" aria-hidden="true"></div></div>`;
        a.addEventListener('click', function onClick(e) {
          e.preventDefault();
          const d = Number(a.getAttribute('data-day'));
          setActiveDay(d);
        });
        body.appendChild(a);
      }

      // If search results hide all days in this group, skip rendering group
      if (!body.childElementCount) return;

      group.appendChild(header);
      group.appendChild(body);
      dayListEl.appendChild(group);
    });
  }

  function lessonHTML(day) {
    const title = syllabus[day - 1] || 'Lesson';
    const exp = expeditionOf(day);
    return `
      <h3>Day ${day}: ${title}</h3>
      <p class="meta">Expedition <span class="pill">${exp}</span></p>
      <h4>Overview</h4>
      <p>इस Day में आप “${title}” सीखेंगे। नीचे दिए गए उदाहरण, अभ्यास और Drill Tables को पूरा करें।</p>
      <h4>Examples</h4>
      <ul>
        <li>Hindi → English pattern examples</li>
        <li>2–3 sample sentences for quick practice</li>
      </ul>
      <h4>Drill Table</h4>
      <p class="meta">Try aloud 3 times. Swap subjects/verbs/objects.</p>
      <h4>Quick Exercise</h4>
      <ol>
        <li>Translate 3 short sentences to English.</li>
        <li>Record yourself once and play back.</li>
      </ol>
    `;
  }

  function toGoogleDocEmbedUrl(url) {
    try {
      var u = new URL(url);
      if (u.hostname.indexOf('docs.google.com') !== -1 && u.pathname.indexOf('/document/d/') !== -1) {
        u.pathname = u.pathname.replace(/\/edit$/, '/preview');
        u.search = '';
        return u.toString();
      }
      return url;
    } catch (e) {
      return url;
    }
  }

  function renderLesson(day) {
    var customMap = window.COURSE_CONTENT || {};
    var custom = customMap[day];
    if (custom && typeof custom === 'object') {
      if (custom.html) {
        lessonContentEl.innerHTML = custom.html;
        return;
      }
      if (custom.googleDocUrl) {
        var embedUrl = toGoogleDocEmbedUrl(custom.googleDocUrl);
        lessonContentEl.innerHTML = '<div class="embed-doc"><iframe class="embed-frame" src="' + embedUrl + '" loading="lazy" allowfullscreen></iframe></div>';
        return;
      }
    }
    lessonContentEl.innerHTML = lessonHTML(day);
  }

  function setActiveDay(day) {
    state.activeDay = Math.max(1, Math.min(COURSE_TOTAL, day));
    renderLesson(state.activeDay);
    renderDayList(searchEl ? searchEl.value : '');
  }

  function markComplete() {
    state.completed.add(state.activeDay);
    saveProgress();
  }

  // Events
  if (searchEl) {
    searchEl.addEventListener('input', function onSearch() {
      renderDayList(searchEl.value);
    });
  }
  if (btnPrev) btnPrev.addEventListener('click', function () { setActiveDay(state.activeDay - 1); });
  if (btnNext) btnNext.addEventListener('click', function () { setActiveDay(state.activeDay + 1); });
  if (btnComplete) btnComplete.addEventListener('click', markComplete);

  const startBtn = document.querySelector('[data-start]');
  if (startBtn) startBtn.addEventListener('click', function () { setActiveDay(1); });

  // Conversations (compact list from brief)
  const conversations = [
    'बातचीत से पहले', 'परिचय', 'माँ और बेटा', 'विद्यार्थी से बातचीत', 'जाने की तैयारी', 'रास्ता पूछना', 'मरीज़ के बारे में पूछताछ', 'डॉक्टर से बातचीत', 'जनरल स्टोर में', 'उपहार की खरीदारी', 'मनोरंजन', 'अतिथि सत्कार', 'जन्मदिन की पार्टी', 'पार्टी में', 'टेलीफोन पर बातचीत', 'कॉलेज/कैंपस का पहला दिन', 'लड़के और लड़की की बातचीत', 'होटल में कमरे की बुकिंग', 'बच्चे के एडमिशन का इंटरव्यू', 'क्लास टीचर से बातचीत', 'शिकायतें', 'भावी वर के बारे में पूछताछ', 'विवाह संबंधी बातचीत', 'करियर पर चर्चा', 'प्रॉपर्टी डीलर से बात', 'नौकरी का इंटरव्यू'
  ];
  if (conversationsGrid) {
    var conversationLinks = Array.isArray(window.CONVERSATION_LINKS) ? window.CONVERSATION_LINKS : [];
    conversations.forEach(function (title, idx) {
      const card = document.createElement('article');
      var rawUrl = conversationLinks[idx];
      var hasDoc = typeof rawUrl === 'string' && rawUrl.trim().length > 0;
      var href = hasDoc ? toGoogleDocEmbedUrl(rawUrl.trim()) : '';
      card.className = 'card' + (hasDoc ? ' clickable' : '');
      var pillClass = hasDoc ? 'success' : 'muted';
      var pillText = hasDoc ? 'Available' : 'Pending';
      var actionHtml = hasDoc
        ? `<a class="btn small" href="${href}" target="_blank" rel="noopener" title="Open Google Doc preview in a new tab">View Doc ↗</a>`
        : `<span class="btn small disabled" aria-disabled="true" title="Link coming soon">Coming soon</span>`;
      card.innerHTML = `<div class="card-body"><h3>${title}</h3><p class="meta"><span class="pill ${pillClass}">${pillText}</span> &nbsp;Practice dialogue • Hindi → English</p><div class="card-actions">${actionHtml}</div></div>`;
      if (hasDoc) {
        card.addEventListener('click', function (e) {
          var isButton = e.target && (e.target.closest && e.target.closest('.btn'));
          if (!isButton) {
            window.open(href, '_blank');
          }
        });
      }
      conversationsGrid.appendChild(card);
    });
  }

  // Appendix
  const appendixItems = [
    'Word Building', 'Punctuation', 'Abbreviations', 'Numerals',
    'Direct/Indirect Speech', 'Forms of Verbs', 'Collective Phrases',
    'Young Ones of Animals', 'Cries of Animals', 'One-Word Substitutes',
    'Antonyms', 'Nationality Words', 'Common Errors in English',
    'Letter Writing (Greetings, Congratulations, Apology, Official, Job Applications, Matrimonial Replies)'
  ];
  if (appendixList) {
    appendixList.innerHTML = appendixItems.map(function (i) { return `<li class="pill">${i}</li>`; }).join('');
  }

  // Initial render
  updateProgressUI();
  renderDayList('');
});


