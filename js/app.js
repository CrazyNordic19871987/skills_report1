// =============================================
//  ONE! Summer Game 2026 � ������� ������ ����������
// =============================================

// -- ���������� ��������� ----------------------
let state = {
  students: [],
  observations: [],
  badges: [],
  currentPage: 'students',
  currentStudentId: null,
  currentDay: 1,
  currentTrack: 'bio',
  filterSquad: '',
  filterShift: '',
  searchQuery: '',
  radarChart: null
};

let tempRatings = { independence: 0, quality: 0 };

// -- Safe element helper ------------------------
function ge(id) {
  return document.getElementById(id);
}

// -- ������������� -----------------------------
document.addEventListener('DOMContentLoaded', async () => {
  try {
    showLoader(true);
    await loadData();
    setupNav();
    setupSearch();
    renderStudentList();
    renderDashboard();
    showLoader(false);
    animatePageIn('students');
  } catch(e) {
    console.error('Init error:', e);
    showLoader(false);
    document.body.innerHTML += `<div style="color:var(--orange);padding:20px;font-family:monospace">Error: ${e.message}</div>`;
  }
});

async function loadData() {
  const [students, observations, badges] = await Promise.all([
    api.getAll(TABLES.STUDENTS),
    api.getAll(TABLES.OBSERVATIONS),
    api.getAll(TABLES.BADGES)
  ]);
  state.students    = Array.isArray(students) && students.length ? students : LS.get('students');
  state.observations = Array.isArray(observations) && observations.length ? observations : LS.get('observations');
  state.badges      = Array.isArray(badges) && badges.length ? badges : LS.get('badges');
}

function showLoader(v) {
  var loader = ge('app-loader');
  if (loader) {
    loader.style.opacity = v ? '1' : '0';
    loader.style.pointerEvents = v ? 'all' : 'none';
  }
}

// -- ��������� ---------------------------------
function setupNav() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      navigateTo(page);
    });
  });
}

function navigateTo(page) {
  if (page === state.currentPage) return;

  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.style.animation = '';
  });
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));

  const el = ge('page-' + page);
  if (el) el.classList.add('active');
  animatePageIn(page);

  var navBtn = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navBtn) navBtn.classList.add('active');
  state.currentPage = page;

  if (page === 'tasks')        populateStudentSelect('task-student-select', onTaskStudentChange);
  if (page === 'achievements') populateStudentSelect('ach-student-select', onAchStudentChange);
  if (page === 'talents')      populateStudentSelect('talent-student-select', onTalentStudentChange);
  if (page === 'dashboard')    renderDashboard();
  if (page === 'camp')         renderCampPage();
}

function animatePageIn(page) {
  const el = document.getElementById('page-' + page);
  if (!el) return;
  el.style.animation = 'none';
  el.offsetHeight; // reflow
  el.style.animation = 'pageSlideIn 0.45s cubic-bezier(0.22,1,0.36,1) forwards';
}

// -- ����� --------------------------------------
function setupSearch() {
  document.getElementById('search-input').addEventListener('input', (e) => {
    state.searchQuery = e.target.value.toLowerCase();
    renderStudentList();
  });
}

// =============================================
//  �������� 1: ���������
// =============================================

document.getElementById('student-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = '����������...';
  btn.disabled = true;

  const student = {
    first_name: v('s-firstname'),
    last_name:  v('s-lastname'),
    age:        parseInt(v('s-age')),
    gender:     v('s-gender'),
    grade:      parseInt(v('s-grade')),
    squad:      parseInt(v('s-squad')),
    shift:      parseInt(v('s-shift')),
    notes:      v('s-notes'),
    created_at: new Date().toISOString()
  };

  const result = await api.insert(TABLES.STUDENTS, student);
  const saved = result ? result[0] : { ...student, id: Date.now().toString() };

  state.students.unshift(saved);
  LS.set('students', state.students);
  renderStudentList();

  e.target.reset();
  btn.textContent = '+ �������� ���������';
  btn.disabled = false;
  showToast('? �������� ��������!');
});

function renderStudentList() {
  const el = document.getElementById('student-list');
  const countEl = document.getElementById('student-count');
  if (!el) return; // Element not yet in DOM
  if (countEl) countEl.textContent = state.students.length;
  let list = state.students;

  if (state.searchQuery) {
    list = list.filter(s =>
      (s.first_name + ' ' + s.last_name).toLowerCase().includes(state.searchQuery)
    );
  }

  if (!list.length) {
    el.innerHTML = `<div class="empty-state">
      <div class="empty-icon">??</div>
      <p>${state.searchQuery ? '�������� �� ������' : '��� ����������. �������� �������!'}</p>
    </div>`;
    return;
  }

  el.innerHTML = list.map(s => {
    const obs   = state.observations.filter(o => o.student_id === s.id).length;
    const bdgs  = state.badges.filter(b => b.student_id === s.id && b.earned).length;
    const initials = (s.first_name?.[0] || '') + (s.last_name?.[0] || '');
    const progress = Math.round((obs / 30) * 100);
    return `
      <div class="student-card" data-id="${s.id}" onclick="quickViewStudent('${s.id}')">
        <div class="sc-avatar">${initials}</div>
        <div class="sc-info">
          <div class="sc-name">${s.first_name} ${s.last_name}</div>
          <div class="sc-meta">${s.age} ��� � ${s.gender} � ${s.grade} �� � ����� ${s.squad} � ����� ${s.shift}</div>
          <div class="sc-progress">
            <div class="sc-progress-bar"><div class="sc-progress-fill" style="width:${progress}%"></div></div>
            <span class="sc-progress-label">${obs} ������� � ${bdgs} �������</span>
          </div>
        </div>
        <button class="sc-delete" onclick="deleteStudent(event,'${s.id}')">?</button>
      </div>`;
  }).join('');

  // Staggered entrance animation
  el.querySelectorAll('.student-card').forEach((card, i) => {
    card.style.animationDelay = (i * 0.06) + 's';
    card.classList.add('card-enter');
  });
}

function quickViewStudent(id) {
  state.currentStudentId = id;
  navigateTo('tasks');
  setTimeout(() => {
    const sel = document.getElementById('task-student-select');
    if (sel) {
      sel.value = id;
      sel.dispatchEvent(new Event('change'));
    }
  }, 100);
}

async function deleteStudent(e, id) {
  e.stopPropagation();
  if (!confirm('������� ��������� � ��� ��� ������?')) return;
  await api.remove(TABLES.STUDENTS, id);
  state.students = state.students.filter(s => s.id !== id);
  state.observations = state.observations.filter(o => o.student_id !== id);
  state.badges = state.badges.filter(b => b.student_id !== id);
  LS.set('students', state.students);
  renderStudentList();
  showToast('??? �������� �����');
}

// =============================================
//  �������� 2: �������
// =============================================

function populateStudentSelect(selectId, onChange) {
  const sel = document.getElementById(selectId);
  sel.innerHTML = '<option value="">� �������� ��������� �</option>' +
    state.students.map(s =>
      `<option value="${s.id}">${s.first_name} ${s.last_name} � ����� ${s.squad}</option>`
    ).join('');
  sel.onchange = onChange;

  if (state.currentStudentId) {
    sel.value = state.currentStudentId;
    sel.dispatchEvent(new Event('change'));
  }
}

function onTaskStudentChange() {
  const id = document.getElementById('task-student-select').value;
  state.currentStudentId = id;
  const container = document.getElementById('task-detail');
  if (!id || !container) return;
  renderDayTabs();
  renderCurrentTask();
}

function renderDayTabs() {
  const el = document.getElementById('day-tabs');
  el.innerHTML = Array.from({length:10}, (_,i) => {
    const day = i+1;
    const done = hasObservation(state.currentStudentId, day, state.currentTrack);
    return `<button class="day-pill ${day===state.currentDay?'active':''} ${done?'done':''}"
      onclick="selectDay(${day})">${day}</button>`;
  }).join('');
}

function selectDay(day) {
  state.currentDay = day;
  renderDayTabs();
  renderCurrentTask();
}

function selectTrack(track) {
  state.currentTrack = track;
  document.querySelectorAll('.track-pill').forEach(b => b.classList.remove('active'));
  document.querySelector(`.track-pill[data-track="${track}"]`).classList.add('active');
  renderDayTabs();
  renderCurrentTask();
}

function renderCurrentTask() {
  const task = KTP.find(t => t.track === state.currentTrack && t.day === state.currentDay);
  const container = ge('task-detail');
  if (!task || !container) { if (container) container.innerHTML = '<p class="empty-note">��� �������</p>'; return; }

  const obs = getObservation(state.currentStudentId, state.currentDay, state.currentTrack);
  tempRatings = { independence: obs?.independence || 0, quality: obs?.quality || 0 };

  // ���������� ������ �������� ��������
  function starBtns(type, obsVal) {
    let html = '';
    for (let n = 1; n <= 5; n++) {
      const active = obsVal >= n ? ' active' : '';
      html += '<button class="star' + active + '" onclick="setRating(\'' + type + '\',' + n + ')">' + n + '</button>';
    }
    return html;
  }

  let skillChips = '';
  task.skills.forEach(s => {
    const c = COMPETENCIES.find(c => c.id === s);
    if (c) skillChips += '<span class="skill-chip" style="--chip-color:' + c.color + '">' + c.icon + ' ' + c.name + '</span>';
  });

  let html =
    '<div class="task-header">' +
      '<div class="task-day-badge">���� ' + task.day + '</div>' +
      '<h3 class="task-title">' + task.name + '</h3>' +
      '<p class="task-desc">' + task.desc + '</p>' +
      '<div class="task-skills">' + skillChips + '</div>' +
    '</div>' +
    '<div class="task-form">' +
      '<div class="rating-group">' +
        '<label>�����������������</label>' +
        '<div class="star-rating" id="rate-independence">' +
          starBtns('independence', obs ? obs.independence : 0) +
        '</div>' +
      '</div>' +
      '<div class="rating-group">' +
        '<label>��������</label>' +
        '<div class="star-rating" id="rate-quality">' +
          starBtns('quality', obs ? obs.quality : 0) +
        '</div>' +
      '</div>' +
      '<label class="toggle-row">' +
        '<span>������� ����������</span>' +
        '<div class="toggle-wrap">' +
          '<input type="checkbox" id="chk-initiative" ' + (obs && obs.initiative ? 'checked' : '') + '>' +
          '<span class="toggle-slider"></span>' +
        '</div>' +
      '</label>' +
      '<div class="form-group">' +
        '<label>������� ��������</label>' +
        '<textarea id="obs-notes" rows="2" placeholder="����������...">' + (obs ? obs.notes || '' : '') + '</textarea>' +
      '</div>' +
      '<button class="btn-primary" onclick="saveObservation()">' +
        (obs ? '?? ��������' : '? ��������� �������') +
      '</button>' +
    '</div>';

  container.innerHTML = html;
}

function setRating(field, val) {
  const obs = getObservation(state.currentStudentId, state.currentDay, state.currentTrack);
  tempRatings[field] = val;
  document.querySelectorAll(`#rate-${field} .star`).forEach((s, i) => {
    s.classList.toggle('active', i < val);
  });
}

async function saveObservation() {
  const indEl = document.querySelectorAll('#rate-independence .star.active');
  const qualEl = document.querySelectorAll('#rate-quality .star.active');
  const independence = indEl.length || tempRatings.independence;
  const quality = qualEl.length || tempRatings.quality;
  if (!independence || !quality) { showToast('?? �������� ������!', 'warn'); return; }

  const data = {
    student_id:   state.currentStudentId,
    day:          state.currentDay,
    track:        state.currentTrack,
    independence,
    quality,
    initiative:   document.getElementById('chk-initiative').checked,
    notes:        document.getElementById('obs-notes').value,
    created_at:   new Date().toISOString()
  };

  const existing = getObservation(state.currentStudentId, state.currentDay, state.currentTrack);
  if (existing) {
    await api.update(TABLES.OBSERVATIONS, existing.id, data);
    Object.assign(existing, data);
  } else {
    const result = await api.insert(TABLES.OBSERVATIONS, data);
    const saved = result ? result[0] : { ...data, id: Date.now().toString() };
    state.observations.push(saved);
  }
  LS.set('observations', state.observations);

  await checkAndAwardBadges(state.currentStudentId, state.currentDay, state.currentTrack, data);
  renderDayTabs();
  renderCurrentTask();
  showToast('? ������� ���������!');
}

function getObservation(studentId, day, track) {
  return state.observations.find(o =>
    o.student_id === studentId && o.day === day && o.track === track
  );
}

function hasObservation(studentId, day, track) {
  return !!getObservation(studentId, day, track);
}

// =============================================
//  �������� 3: ���������� (����-����������)
// =============================================

async function checkAndAwardBadges(studentId, day, track, obs) {
  const defs = BADGE_DEFS.filter(b => b.track === track && b.day === day);
  for (const def of defs) {
    const alreadyEarned = state.badges.find(b => b.student_id === studentId && b.badge_id === def.id && b.earned);
    if (alreadyEarned) continue;
    const conditionMet = def.condition === 'completed' ||
      (def.condition === 'initiative' && obs.initiative);
    if (!conditionMet) continue;

    const badge = {
      student_id: studentId,
      badge_id: def.id,
      name: def.name,
      icon: def.icon,
      track: def.track,
      rarity: def.rarity,
      earned: true,
      earned_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    const result = await api.insert(TABLES.BADGES, badge);
    const saved = result ? result[0] : { ...badge, id: Date.now().toString() };
    state.badges.push(saved);
    LS.set('badges', state.badges);
    showBadgeNotification(def);
  }
}

function showBadgeNotification(def) {
  const el = document.createElement('div');
  el.className = 'badge-notification rarity-' + def.rarity;
  el.innerHTML = `<div class="bn-icon">${def.icon}</div>
    <div class="bn-text"><strong>����� ����������!</strong><span>${def.name}</span></div>`;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add('show'), 50);
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 500); }, 3500);
}

function onAchStudentChange() {
  const id = document.getElementById('ach-student-select').value;
  state.currentStudentId = id;
  if (!id) return;
  renderAchievements(id);
}

function renderAchievements(studentId) {
  const earned = state.badges.filter(b => b.student_id === studentId && b.earned);
  const earnedIds = new Set(earned.map(b => b.badge_id));
  const el = document.getElementById('badge-grid');
  const rarityOrder = { legendary:0, epic:1, rare:2, common:3 };

  el.innerHTML = BADGE_DEFS
    .sort((a,b) => rarityOrder[a.rarity] - rarityOrder[b.rarity])
    .map(def => {
      const isEarned = earnedIds.has(def.id);
      const earnedObj = earned.find(b => b.badge_id === def.id);
      const dateStr = earnedObj?.earned_at ? new Date(earnedObj.earned_at).toLocaleDateString('ru') : '';
      return `
        <div class="badge-card ${isEarned ? 'earned' : 'locked'} rarity-${def.rarity}">
          <div class="badge-glow"></div>
          <div class="badge-emoji">${isEarned ? def.icon : '??'}</div>
          <div class="badge-name">${def.name}</div>
          <div class="badge-desc">${def.desc}</div>
          <div class="badge-rarity">${rarityLabel(def.rarity)}</div>
          ${isEarned ? `<div class="badge-date">${dateStr}</div>` : ''}
        </div>`;
    }).join('');

  document.getElementById('ach-summary').innerHTML =
    `<span class="ach-count">${earned.length}</span> �� <span>${BADGE_DEFS.length}</span> ���������� ��������`;
}

function rarityLabel(r) {
  return { common:'�������', rare:'������', epic:'���������', legendary:'�����������' }[r] || r;
}

// =============================================
//  �������� 4: ����� ��������
// =============================================

function onTalentStudentChange() {
  const id = document.getElementById('talent-student-select').value;
  state.currentStudentId = id;
  if (!id) return;
  renderTalentCard(id);
}

function renderTalentCard(studentId) {
  const student = state.students.find(s => s.id === studentId);
  if (!student) return;

  const obs = state.observations.filter(o => o.student_id === studentId);
  const earnedBadges = state.badges.filter(b => b.student_id === studentId && b.earned);

  // ���������
  var talentName = ge('talent-name');
  var talentMeta = ge('talent-meta');
  if (talentName) talentName.textContent = student.first_name + ' ' + student.last_name;
  if (talentMeta) talentMeta.textContent = student.age + ' ��� � ' + student.grade + ' ����� � ����� ' + student.squad + ' � ����� ' + student.shift;

  // ������ � �����
  document.getElementById('talent-top-badges').innerHTML =
    earnedBadges.map(b => `<span class="mini-badge rarity-${b.rarity}" title="${b.name}">${b.icon}</span>`).join('');

  // �����������
  const compScores = calcCompetencies(obs);
  renderRadarChart(compScores);
  renderCompBars(compScores);

  // DISC (���������� � ������� � �����)
  renderDISC(obs);

  // ��������� �������
  renderCareer(obs, earnedBadges);

  // �����: ������������ ������������ �� ���������� (����������)
  renderRecommendations(obs, earnedBadges, compScores);

  // ���������� �� �����
  document.getElementById('talent-badges-list').innerHTML = earnedBadges.length
    ? earnedBadges.map(b =>
        `<div class="talent-badge-row rarity-${b.rarity}">
          <span class="tbr-icon">${b.icon}</span>
          <div><strong>${b.name}</strong><p>${b.desc || ''}</p></div>
          <span class="tbr-rarity">${rarityLabel(b.rarity)}</span>
        </div>`).join('')
    : '<p class="empty-note">���������� ���� ���</p>';

  // ����������� �������
  document.getElementById('talent-obs-list').innerHTML = obs.length
    ? obs.map(o => {
        const task = KTP.find(t => t.track === o.track && t.day === o.day);
        const trackIcon = {bio:'??', eng:'??', media:'??'}[o.track] || '??';
        return `<div class="obs-row">
          <span class="obs-icon">${trackIcon}</span>
          <div class="obs-info"><strong>${task?.name || '�������'}</strong> � ���� ${o.day}</div>
          <div class="obs-scores">
            <span>?? ${o.independence}/5</span>
            <span>? ${o.quality}/5</span>
            ${o.initiative ? '<span class="init-chip">?? ����������</span>' : ''}
          </div>
        </div>`;
      }).join('')
    : '<p class="empty-note">������� ���� ���</p>';
}

// -- ������������ �� ���������� (���������� TRACK_PROFESSIONS �� config.js) ----------------
function renderRecommendations(obs, badges, compScores) {
  const container = document.getElementById('recommendations-content');
  if (!container) return;

  // ��������� � �� �������� (�� ������ TRACK_PROFESSIONS)
  const professions = [];
  Object.entries(TRACK_PROFESSIONS).forEach(([track, profs]) => {
    profs.forEach(prof => {
      const trackBadges = BADGE_DEFS.filter(b => b.track === track).map(b => b.id);
      const trackSkills = KTP.filter(t => t.track === track).flatMap(t => t.skills);
      const uniqueSkills = [...new Set(trackSkills)];
      professions.push({
        id: prof.title.toLowerCase().replace(/\s/g, '_'),
        name: prof.title,
        icon: track === 'bio' ? '??' : track === 'eng' ? '??' : '??',
        desc: prof.desc,
        criteria: {
          tracks: [track],
          badges: trackBadges.slice(0, 2),
          skills: uniqueSkills.slice(0, 4),
          minAvgScore: 3.0
        }
      });
    });
  });

  // ������ ������������� ��� ������ ���������
  const scored = professions.map(prof => {
    let score = 0;
    let maxScore = 0;
    const comments = [];

    // 1. ������ �� ����������� ������ (40% ����)
    const relevantObs = obs.filter(o => prof.criteria.tracks.includes(o.track));
    if (relevantObs.length > 0) {
      const avgScore = relevantObs.reduce((sum, o) => sum + (o.independence + o.quality) / 2, 0) / relevantObs.length;
      if (avgScore >= prof.criteria.minAvgScore) {
        const trackScore = Math.min(40, (avgScore / 5) * 40);
        score += trackScore;
        comments.push(`? �������� ������ � ����� (${avgScore.toFixed(1)}/5)`);
      } else {
        comments.push(`?? ������ ���� ������������� (${avgScore.toFixed(1)}/5)`);
      }
      maxScore += 40;
    } else {
      comments.push(`? ��� ������� � ����������� �����`);
      maxScore += 40;
    }

    // 2. ������ (35% ����)
    const earnedBadgeIds = badges.map(b => b.badge_id);
    const relevantBadges = prof.criteria.badges.filter(b => earnedBadgeIds.includes(b));
    if (prof.criteria.badges.length > 0) {
      const badgeScore = (relevantBadges.length / prof.criteria.badges.length) * 35;
      score += badgeScore;
      if (relevantBadges.length > 0) {
        comments.push(`?? �������� ������: ${relevantBadges.map(b => {
          const def = BADGE_DEFS.find(d => d.id === b);
          return def ? def.icon + ' ' + def.name : b;
        }).join(', ')}`);
      }
      maxScore += 35;
    } else {
      score += 35; // ��� ������������ �������
      maxScore += 35;
    }

    // 3. ����������� (25% ����)
    const relevantSkills = prof.criteria.skills;
    let skillScore = 0;
    let skillCount = 0;
    relevantSkills.forEach(skillId => {
      if (compScores[skillId]) {
        skillScore += compScores[skillId];
        skillCount++;
      }
    });
    if (skillCount > 0) {
      const avgSkill = skillScore / skillCount;
      score += (avgSkill / 100) * 25;
      comments.push(`?? ������� �����������: ${relevantSkills.filter(s => (compScores[s] || 0) > 50).map(s => {
        const c = COMPETENCIES.find(cc => cc.id === s);
        return c ? c.icon + ' ' + c.name : s;
      }).join(', ')}`);
    }
    maxScore += 25;

    // ������� �������������
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    return {
      ...prof,
      score: percentage,
      comments
    };
  });

  // ���������� �� �������������
  scored.sort((a, b) => b.score - a.score);

  // ��������� HTML
  container.innerHTML = scored.map(prof => {
    const level = prof.score >= 70 ? 'high' : prof.score >= 40 ? 'medium' : 'low';
    const levelText = prof.score >= 70 ? '?? �������� ����������' : prof.score >= 40 ? '?? ������� ����������' : '?? ���� ���������';

    return `
      <div class="recommendation-card rarity-${level}">
        <div class="rec-header">
          <span class="rec-icon">${prof.icon}</span>
          <div class="rec-info">
            <strong>${prof.name}</strong>
            <p>${prof.desc}</p>
          </div>
          <div class="rec-score">
            <span class="rec-pct">${prof.score}%</span>
            <span class="rec-level">${levelText}</span>
          </div>
        </div>
        <div class="rec-comments">
          ${prof.comments.map(c => `<div class="rec-comment">${c}</div>`).join('')}
        </div>
      </div>`;
  }).join('');
}

function calcCompetencies(obs) {
  const scores = {};
  COMPETENCIES.forEach(c => scores[c.id] = 0);
  let counts = {};
  COMPETENCIES.forEach(c => counts[c.id] = 0);

  obs.forEach(o => {
    const tasks = KTP.filter(t => t.track === o.track && t.day === o.day);
    tasks.forEach(task => {
      task.skills.forEach(skill => {
        if (scores[skill] !== undefined) {
          scores[skill] += (o.independence + o.quality) / 2 + (o.initiative ? 1 : 0);
          counts[skill]++;
        }
      });
    });
  });

  // ������������ 0-100
  const maxPossible = 6; // max per observation
  const result = {};
  COMPETENCIES.forEach(c => {
    result[c.id] = counts[c.id] > 0
      ? Math.min(100, Math.round((scores[c.id] / counts[c.id] / maxPossible) * 100))
      : 0;
  });
  return result;
}

function renderRadarChart(scores) {
  const canvas = document.getElementById('radar-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W/2, cy = H/2, R = Math.min(W,H)/2 - 30;
  const N = COMPETENCIES.length;

  ctx.clearRect(0, 0, W, H);

  // Grid
  for (let r = 1; r <= 5; r++) {
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
      const rr = (r/5) * R;
      const x = cx + Math.cos(angle) * rr;
      const y = cy + Math.sin(angle) * rr;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Axes
  COMPETENCIES.forEach((c, i) => {
    const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * R, cy + Math.sin(angle) * R);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.stroke();

    // Labels
    const lx = cx + Math.cos(angle) * (R + 20);
    const ly = cy + Math.sin(angle) * (R + 20);
    ctx.font = '11px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(c.icon, lx, ly);
  });

  // Data polygon
  ctx.beginPath();
  COMPETENCIES.forEach((c, i) => {
    const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
    const val = (scores[c.id] || 0) / 100;
    const x = cx + Math.cos(angle) * R * val;
    const y = cy + Math.sin(angle) * R * val;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
  grad.addColorStop(0, 'rgba(237,118,21,0.35)');
  grad.addColorStop(1, 'rgba(237,118,21,0.15)');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = '#ed7615';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Dots
  COMPETENCIES.forEach((c, i) => {
    const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
    const val = (scores[c.id] || 0) / 100;
    const x = cx + Math.cos(angle) * R * val;
    const y = cy + Math.sin(angle) * R * val;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI*2);
    ctx.fillStyle = '#ed7615';
    ctx.fill();
  });
}

function renderCompBars(scores) {
  const el = document.getElementById('comp-bars');
  el.innerHTML = COMPETENCIES.map(c => `
    <div class="comp-bar-row">
      <span class="comp-bar-icon">${c.icon}</span>
      <span class="comp-bar-name">${c.name}</span>
      <div class="comp-bar-track">
        <div class="comp-bar-fill" style="width:${scores[c.id]}%;background:${c.color}80;border-right:2px solid ${c.color}"></div>
      </div>
      <span class="comp-bar-val">${scores[c.id]}%</span>
    </div>`).join('');
}

function renderDISC(obs) {
  // ������������ �� ������ �������
  const rawScores = {D:0, I:0, S:0, C:0};
  const counts = {D:0, I:0, S:0, C:0};

  obs.forEach(o => {
    const tasks = KTP.filter(t => t.track === o.track && t.day === o.day);
    tasks.forEach(task => {
      task.skills.forEach(skill => {
        for (const [type, skills] of Object.entries(DISC_SKILL_MAP)) {
          if (skills.includes(skill)) {
            rawScores[type] += (o.independence + o.quality) / 2 + (o.initiative ? 0.5 : 0);
            counts[type]++;
          }
        }
      });
    });
  });

  // ������������ 0-100 (min 10 ��� �����������)
  const maxVal = Math.max(...Object.values(rawScores), 1);
  const disc = {};
  for (const t of ['D','I','S','C']) {
    disc[t] = counts[t] > 0
      ? Math.max(10, Math.round((rawScores[t] / maxVal) * 100))
      : 10;
  }

  // ����� DISC �� config.js
  const colors = DISC_COLORS; // {D:'#EF4444', I:'#FBBF24', S:'#22C55E', C:'#3B82F6'}

  // ������ � ����������
  const labels = {
    D:{label:'�������������', color:colors.D, desc:'�������������, ���������'},
    I:{label:'�������',       color:colors.I, desc:'�������, ���������'},
    S:{label:'������������',  color:colors.S, desc:'���������, ��������'},
    C:{label:'������������',  color:colors.C, desc:'��������, ������'}
  };

  const dominant = Object.entries(disc).sort((a,b) => b[1]-a[1])[0];

  // ������ ����� � �������
  document.getElementById('disc-bars').innerHTML = ['D','I','S','C'].map(t => `
    <div class="disc-row">
      <div class="disc-type-label" style="color:${labels[t].color}">${t}</div>
      <div class="disc-bar-wrap">
        <div class="disc-bar-inner" style="width:${disc[t]}%;background:linear-gradient(90deg,${labels[t].color}90,${labels[t].color})">
          <span class="disc-bar-pct">${disc[t]}%</span>
        </div>
      </div>
      <div class="disc-type-desc">${labels[t].desc}</div>
    </div>`).join('');

  // ������������ ���
  document.getElementById('disc-dominant').innerHTML =
    `<span style="color:${labels[dominant[0]].color}">������������ ���: ${dominant[0]} � ${labels[dominant[0]].label}</span>`;

  // �����-���� DISC
  const comboHtml = '<h3 style="font-size:0.8rem;color:var(--muted);margin:12px 0 8px;font-weight:600;">�����-���� DISC</h3>' +
    Object.entries(DISC_COMBO).map(([key, val]) => `
      <div class="disc-row" style="margin-bottom:6px;">
        <div class="disc-type-label" style="color:${val.color}">${key}</div>
        <div class="disc-type-desc"><strong>${val.label}</strong> � ${val.desc}</div>
      </div>`).join('');

  // ��������� ����� ����� disc-dominant
  const domEl = document.getElementById('disc-dominant');
  if (domEl && domEl.parentNode) {
    const comboContainer = document.createElement('div');
    comboContainer.innerHTML = comboHtml;
    domEl.parentNode.appendChild(comboContainer);
  }
}

function renderCareer(obs, badges) {
  const trackCounts = {bio:0, eng:0, media:0};
  obs.forEach(o => trackCounts[o.track] = (trackCounts[o.track] || 0) + 1);
  const top = Object.entries(trackCounts).sort((a,b) => b[1]-a[1]);
  const primary = top[0]?.[0] || 'bio';

  const profiles = {
    bio: {
      icon:'??', title:'BioTech �������������',
      roles: ['����������', '������', '������'],
      desc: '������� ��������� � ������� ��������, �������� � ������� ������������.',
      clubs: ['?? ������ ����', '?? ��������', '?? �����������']
    },
    eng: {
      icon:'??', title:'������� ��������',
      roles: ['������������', 'IoT-�����������', '�������'],
      desc: '���������� � ������������ ����������, ������������ � �������������.',
      clubs: ['?? �������������', '?? �����������', '??? ����������������']
    },
    media: {
      icon:'??', title:'�����-������',
      roles: ['�������', 'SMM-����������', '���������'],
      desc: '������ � �������� ��������, ������������ � ������ � ����������.',
      clubs: ['?? �����������������', '?? Digital-�����', '??? ������������']
    }
  };

  const p = profiles[primary];
  document.getElementById('career-content').innerHTML = `
    <div class="career-hero">
      <span class="career-hero-icon">${p.icon}</span>
      <div>
        <strong>${p.title}</strong>
        <p>${p.desc}</p>
      </div>
    </div>
    <div class="career-roles">
      ${p.roles.map(r => `<span class="career-role-chip">${r}</span>`).join('')}
    </div>
    <div class="career-clubs-title">������������� ������:</div>
    <div class="career-clubs">
      ${p.clubs.map(c => `<span class="career-club">${c}</span>`).join('')}
    </div>`;
}

// =============================================
//  �������� 5: �������
// =============================================

function renderDashboard() {
  const squad = state.filterSquad;
  const shift = state.filterShift;
  let list = state.students;
  if (squad) list = list.filter(s => s.squad == squad);
  if (shift) list = list.filter(s => s.shift == shift);

  const totalObs   = state.observations.filter(o => list.find(s => s.id === o.student_id)).length;
  const totalBdgs  = state.badges.filter(b => list.find(s => s.id === b.student_id) && b.earned).length;

  let avgScore = 0;
  const obsForList = state.observations.filter(o => list.find(s => s.id === o.student_id));
  if (obsForList.length) {
    avgScore = (obsForList.reduce((sum, o) => sum + (o.independence + o.quality) / 2, 0) / obsForList.length).toFixed(1);
  }

  var dbTotal = ge('db-total');
  var dbTasks = ge('db-tasks');
  var dbBadges = ge('db-badges');
  var dbAvg = ge('db-avg');
  if (dbTotal) dbTotal.textContent = list.length;
  if (dbTasks) dbTasks.textContent = totalObs;
  if (dbBadges) dbBadges.textContent = totalBdgs;
  if (dbAvg) dbAvg.textContent = avgScore;

  const grid = document.getElementById('db-student-grid');
  if (!list.length) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-icon">??</div><p>��� ���������� ��� ��������� ��������</p></div>';
    return;
  }

  grid.innerHTML = list.map(s => {
    const obs = state.observations.filter(o => o.student_id === s.id);
    const bdgs = state.badges.filter(b => b.student_id === s.id && b.earned);
    const score = obs.length
      ? (obs.reduce((sum, o) => sum + (o.independence + o.quality) / 2, 0) / obs.length).toFixed(1)
      : '�';
    const progress = Math.round((obs.length / 30) * 100);
    const trackCounts = {bio:0, eng:0, media:0};
    obs.forEach(o => trackCounts[o.track]++);
    const dominantTrack = Object.entries(trackCounts).sort((a,b) => b[1]-a[1])[0];
    const trackIcon = {bio:'??', eng:'??', media:'??'}[dominantTrack?.[0]] || '??';

    return `<div class="db-student-card" onclick="openStudentTalents('${s.id}')">
      <div class="db-sc-top">
        <div class="db-sc-avatar">${(s.first_name?.[0]||'')+(s.last_name?.[0]||'')}</div>
        <div class="db-sc-info">
          <strong>${s.first_name} ${s.last_name}</strong>
          <span>����� ${s.squad} � ����� ${s.shift} � ${s.grade} ��</span>
        </div>
        <div class="db-sc-track">${trackIcon}</div>
      </div>
      <div class="db-sc-progress">
        <div class="db-sc-bar"><div style="width:${progress}%;background:var(--orange)"></div></div>
        <span>${progress}%</span>
      </div>
      <div class="db-sc-stats">
        <div><span>${obs.length}</span><small>�������</small></div>
        <div><span>${bdgs.length}</span><small>�������</small></div>
        <div><span>${score}</span><small>����</small></div>
      </div>
      <div class="db-sc-badges">${bdgs.slice(0,5).map(b=>`<span>${b.icon}</span>`).join('')}</div>
    </div>`;
  }).join('');

  // ��������� ������ ������, �����������, ����������� � �������
  renderClubsSection(grid.parentElement, null);
  renderActivitiesSection(grid.parentElement);
  renderEnglishSection(grid.parentElement);
  renderCampTeam(grid.parentElement);
}

function setFilter(type, val) {
  if (type === 'squad') state.filterSquad = val;
  if (type === 'shift') state.filterShift = val;
  renderDashboard();

  document.querySelectorAll(`.filter-pill[data-filter="${type}"]`).forEach(p => p.classList.remove('active'));
  document.querySelector(`.filter-pill[data-filter="${type}"][data-val="${val}"]`)?.classList.add('active');
}

function openStudentTalents(id) {
  state.currentStudentId = id;
  navigateTo('talents');
  setTimeout(() => {
    const sel = document.getElementById('talent-student-select');
    sel.value = id;
    sel.dispatchEvent(new Event('change'));
  }, 150);
}

// =============================================
//  �������
// =============================================

function v(id) {
  return document.getElementById(id)?.value || '';
}

function showToast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = msg;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.classList.add('show'), 50);
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, 2800);
}

// -- �������� ����������� ������ (����������� ����������) ----------------
function getUnlockedClubs(studentId) {
  const obs = state.observations.filter(o => o.student_id === studentId);
  const maxDay = obs.length > 0 ? Math.max(...obs.map(o => o.day)) :0;
  return CAMP_CLUBS.map(club => ({
    ...club,
    unlocked: maxDay >= club.unlockDay
  }));
}

// -- ������ �������� "� ������" ----------------
function renderCampPage() {
  // ����� (���������)
  const tracksContainer = document.getElementById('camp-tracks');
  if (tracksContainer) {
    tracksContainer.innerHTML = `
      <h3 style="font-size:0.85rem;color:var(--orange);margin-bottom:12px">?? ��� ��������������� �����</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">
        <div>
          <h4 style="font-size:0.8rem;color:var(--white);margin-bottom:6px">?? �����</h4>
          ${TRACK_PROFESSIONS.media.map(p => `<div style="font-size:0.75rem;color:var(--muted);margin-bottom:4px">� <strong style="color:var(--white)">${p.title}</strong> � ${p.desc}</div>`).join('')}
        </div>
        <div>
          <h4 style="font-size:0.8rem;color:var(--white);margin-bottom:6px">?? ���������</h4>
          ${TRACK_PROFESSIONS.eng.map(p => `<div style="font-size:0.75rem;color:var(--muted);margin-bottom:4px">� <strong style="color:var(--white)">${p.title}</strong> � ${p.desc}</div>`).join('')}
        </div>
        <div>
          <h4 style="font-size:0.8rem;color:var(--white);margin-bottom:6px">?? �������������</h4>
          ${TRACK_PROFESSIONS.bio.map(p => `<div style="font-size:0.75rem;color:var(--muted);margin-bottom:4px">� <strong style="color:var(--white)">${p.title}</strong> � ${p.desc}</div>`).join('')}
        </div>
      </div>
    `;
  }

  // �����
  const clubsContainer = document.getElementById('camp-clubs');
  if (clubsContainer) {
    clubsContainer.innerHTML = `
      <h3 style="font-size:0.85rem;color:var(--orange);margin-bottom:12px">??? ����� �� ���������</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px">
        ${CAMP_CLUBS.map(club => `
          <div class="gc">
            <div style="font-size:1.5rem;margin-bottom:6px">${club.icon}</div>
            <strong style="display:block;font-size:0.85rem;margin-bottom:4px">${club.name}</strong>
            <p style="font-size:0.7rem;color:var(--muted);margin:0">${club.desc}</p>
            ${!club.active ? '<div style="font-size:0.65rem;color:var(--orange);background:var(--orange-dim);padding:2px 8px;border-radius:10px;display:inline-block;margin-top:6px">?? ����������� � �������� ����</div>' : ''}
          </div>
        `).join('')}
      </div>
      <table style="width:100%;margin-top:12px;font-size:0.75rem;color:var(--muted)">
        <tr><th style="text-align:left;color:var(--white)">����</th><th style="text-align:left;color:var(--white)">��������</th><th style="text-align:left;color:var(--white)">�����������</th></tr>
        <tr><td>�����</td><td>������, ��������, �������� � ��������</td><td>�</td></tr>
        <tr><td>����������</td><td>�����, ���, ����������</td><td>�</td></tr>
        <tr><td>������</td><td>�����, �������, ������� ����, �����, ������ ����</td><td>����������� � �������� �������� ����-���������</td></tr>
        <tr><td>�����</td><td>FIFA, Gran Turismo, Nintendo Wii, Roblox, Minecraft, Just Dance, PlayStation</td><td>����������� � �������� �������� ����-���������</td></tr>
      </table>
    `;
  }

  // ����������
  const actContainer = document.getElementById('camp-activities');
  if (actContainer) {
    renderActivitiesSection(actContainer);
  }

  // ����������
  const engContainer = document.getElementById('camp-english');
  if (engContainer) {
    renderEnglishSection(engContainer);
  }

  // �������
  const teamContainer = document.getElementById('camp-team');
  if (teamContainer) {
    renderCampTeam(teamContainer);
  }
}

// -- ������ ������ ������ �� �������� ----------------
function renderClubsSection(container, studentId) {
  const clubs = studentId ? getUnlockedClubs(studentId) : CAMP_CLUBS;
  const html = `
    <div class="clubs-section" style="margin-top:20px">
      <h3 style="font-size:0.85rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px">
        ??? ����� ������
      </h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px">
        ${clubs.map(club => `
          <div class="gc ${club.unlocked ? '' : 'locked'}" style="opacity:${club.unlocked ? '1' : '0.5'};position:relative">
            <div style="font-size:1.5rem;margin-bottom:6px">${club.icon}</div>
            <strong style="display:block;font-size:0.85rem;margin-bottom:4px">${club.name}</strong>
            <p style="font-size:0.7rem;color:var(--muted);margin:0">${club.desc}</p>
            ${!club.unlocked ? '<div style="position:absolute;top:8px;right:8px;font-size:0.65rem;color:var(--orange);background:var(--orange-dim);padding:2px 8px;border-radius:10px">?? ���� ' + club.unlockDay + '+</div>' : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', html);
}

// -- ������ �������� ����������� ----------------
function renderActivitiesSection(container) {
  const html = `
    <div class="activities-section" style="margin-top:20px">
      <h3 style="font-size:0.85rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px">
        ?? ���������� � �������� ���������
      </h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div>
          <h4 style="font-size:0.75rem;color:var(--orange);margin-bottom:8px">������� ����������</h4>
          ${EVENING_ACTIVITIES.day.map(a => `
            <div class="gc" style="padding:8px;margin-bottom:6px">
              <strong style="font-size:0.8rem">${a.name}</strong>
              <p style="font-size:0.65rem;color:var(--muted);margin:2px 0 0">${a.desc}</p>
            </div>
          `).join('')}
        </div>
        <div>
          <h4 style="font-size:0.75rem;color:var(--orange);margin-bottom:8px">�������� ���������</h4>
          ${EVENING_ACTIVITIES.evening.map(a => `
            <div class="gc" style="padding:8px;margin-bottom:6px">
              <strong style="font-size:0.8rem">${a.name}</strong>
              <p style="font-size:0.65rem;color:var(--muted);margin:2px 0 0">${a.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', html);
}

// -- ������ ����������� ����� ----------------
function renderEnglishSection(container) {
  const html = `
    <div class="english-section" style="margin-top:20px">
      <h3 style="font-size:0.85rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px">
        ?? �������� ������������
      </h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px">
        ${ENGLISH_COMPONENTS.map(e => `
          <div class="gc">
            <strong style="font-size:0.8rem">${e.name}</strong>
            <p style="font-size:0.65rem;color:var(--muted);margin:2px 0 0">${e.desc}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', html);
}

// -- ������ ������� ������ ----------------
function renderCampTeam(container) {
  const html = `
    <div class="team-section" style="margin-top:20px">
      <h3 style="font-size:0.85rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px">
        ?? ������� ������
      </h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px">
        ${CAMP_TEAM.map(m => `
          <div class="gc">
            <div style="display:flex;justify-content:space-between;align-items:flex-start">
              <div>
                <strong style="font-size:0.8rem">${m.name}</strong>
                <p style="font-size:0.65rem;color:var(--orange);margin:2px 0">${m.alias}</p>
              </div>
            </div>
            <p style="font-size:0.65rem;color:var(--muted);margin:4px 0 0">${m.role}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', html);
}

