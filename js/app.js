// ============================================================
//  UPHSD GRADING SYSTEM — APP LOGIC
// ============================================================

let currentUser    = null;
let currentClassId = null;
let currentStudentId = null;
let modalCallback  = null;
let sidebarOpen    = true;

// ── BOOT ─────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  bindLogin();
  bindModal();
  bindTopbar();
  bindSidebar();
});

// ── TOAST ───────────────────────────────────────────────────
function toast(msg, type='') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast' + (type?' '+type:'');
  el.classList.remove('hidden');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.add('hidden'), 3000);
}

// ═════════════════════════════════ LOGIN ════════════════════
function bindLogin() {
  const tabs = document.querySelectorAll('.role-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const role = tab.dataset.role;
      document.getElementById('loginTitle').textContent =
        role === 'admin' ? 'Administrator Sign In' : 'Faculty Sign In';
      document.getElementById('loginHint').innerHTML =
        role === 'admin'
          ? 'Use <strong>admin / admin123</strong>'
          : 'Use <strong>prof.santos / teacher123</strong>';
    });
  });

  document.getElementById('btnLogin').addEventListener('click', doLogin);
  document.getElementById('loginPass').addEventListener('keydown', e => { if(e.key==='Enter') doLogin(); });
}

function doLogin() {
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value;
  const user = DB.getUser(u, p);
  if (!user) {
    document.getElementById('loginError').textContent = 'Invalid username or password.';
    return;
  }
  currentUser = user;
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('appShell').classList.remove('hidden');
  initApp();
}

// ═════════════════════════════════ APP INIT ═════════════════
function initApp() {
  document.getElementById('topbarUser').textContent = currentUser.name + ' (' + currentUser.role + ')';
  document.getElementById('sidebarUserInfo').innerHTML = `<strong>${currentUser.name}</strong>${currentUser.role}`;

  populateClassSelector();
  renderDashboard();
  navigate('dashboard');
}

function populateClassSelector() {
  const sel = document.getElementById('classSelector');
  const classes = DB.getClasses(currentUser.role, currentUser.id);
  sel.innerHTML = '<option value="">— Select Class —</option>';
  classes.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.name + ' — ' + c.subject;
    sel.appendChild(opt);
  });
  if (currentClassId) sel.value = currentClassId;
}

// ── TOPBAR ──────────────────────────────────────────────────
function bindTopbar() {
  document.getElementById('classSelector').addEventListener('change', function() {
    currentClassId = this.value || null;
    refreshCurrentPage();
  });
  document.getElementById('btnLogout').addEventListener('click', () => {
    currentUser = null; currentClassId = null; currentStudentId = null;
    document.getElementById('appShell').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('loginUser').value = '';
    document.getElementById('loginPass').value = '';
    document.getElementById('loginError').textContent = '';
  });
}

// ── SIDEBAR ─────────────────────────────────────────────────
function bindSidebar() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => navigate(item.dataset.page));
  });
  document.getElementById('sidebarToggle').addEventListener('click', () => {
    sidebarOpen = !sidebarOpen;
    document.getElementById('sidebar').classList.toggle('collapsed', !sidebarOpen);
    document.getElementById('mainContent').classList.toggle('expanded', !sidebarOpen);
  });
}

let currentPage = 'dashboard';

function navigate(page) {
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');

  const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navItem) navItem.classList.add('active');

  const titles = { dashboard:'Dashboard', classes:'Classes', students:'Students',
    attendance:'Attendance', assignments:'Assignments', grades:'Grade Book', reports:'Reports' };
  document.getElementById('topbarTitle').textContent = titles[page] || '';

  switch(page) {
    case 'dashboard':   renderDashboard(); break;
    case 'classes':     renderClasses(); break;
    case 'students':    renderStudents(); break;
    case 'attendance':  renderAttendancePage(); break;
    case 'assignments': renderAssignmentsPage(); break;
    case 'grades':      renderGradebook(); break;
    case 'reports':     renderReports(); break;
  }
}

function refreshCurrentPage() {
  if (currentPage && currentPage !== 'student-detail') navigate(currentPage);
}

// ═════════════════════════════════ DASHBOARD ════════════════
function renderDashboard() {
  const classes  = DB.getClasses(currentUser.role, currentUser.id);
  const students = DB.getStudents(null).filter(s => classes.find(c => c.id === s.classId));
  const totalStudents = students.length;

  // stats
  let passCount = 0;
  students.forEach(s => {
    const g = DB.computeGrade(s.id, s.classId);
    if (g.status === 'PASS') passCount++;
  });
  const passRate = totalStudents ? Math.round((passCount/totalStudents)*100) : 0;

  document.getElementById('statsGrid').innerHTML = `
    <div class="stat-card">
      <div class="stat-icon">◫</div>
      <div class="stat-value">${classes.length}</div>
      <div class="stat-label">Classes</div>
    </div>
    <div class="stat-card gold">
      <div class="stat-icon">✦</div>
      <div class="stat-value">${totalStudents}</div>
      <div class="stat-label">Total Students</div>
    </div>
    <div class="stat-card green">
      <div class="stat-icon">◎</div>
      <div class="stat-value">${passRate}%</div>
      <div class="stat-label">Passing Rate</div>
    </div>
    <div class="stat-card blue">
      <div class="stat-icon">▤</div>
      <div class="stat-value">${classes.length}</div>
      <div class="stat-label">Active Subjects</div>
    </div>`;

  // class list
  const dashClasses = document.getElementById('dashClasses');
  dashClasses.innerHTML = '';
  if (!classes.length) { dashClasses.innerHTML = '<p style="color:var(--ink-faint);font-size:13px;">No classes assigned.</p>'; }
  classes.forEach(c => {
    const count = DB.getStudents(c.id).length;
    const div = document.createElement('div');
    div.className = 'dash-class-item';
    div.innerHTML = `
      <div>
        <div class="dash-class-name">${c.name}</div>
        <div class="dash-class-sub">${c.subject}</div>
      </div>
      <span class="dash-class-count">${count} students</span>`;
    div.addEventListener('click', () => {
      currentClassId = c.id;
      document.getElementById('classSelector').value = c.id;
      navigate('students');
    });
    dashClasses.appendChild(div);
  });

  // activity
  const activity = document.getElementById('dashActivity');
  activity.innerHTML = '';
  DB.getActivityLog().forEach(a => {
    activity.innerHTML += `
      <div class="activity-item">
        <div class="activity-dot"></div>
        <div><div>${a.text}</div><div class="activity-time">${a.time}</div></div>
      </div>`;
  });
}

// ═════════════════════════════════ CLASSES ══════════════════
function renderClasses() {
  const classes = DB.getClasses(currentUser.role, currentUser.id);
  const grid = document.getElementById('classGrid');
  grid.innerHTML = '';

  if (!classes.length) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-icon">◫</div><p>No classes yet. Add one!</p></div>';
    return;
  }

  classes.forEach(c => {
    const count = DB.getStudents(c.id).length;
    const card = document.createElement('div');
    card.className = 'class-card';
    card.innerHTML = `
      <div class="class-card-header">
        <div class="class-card-name">${c.name}</div>
        <div class="class-card-subject">${c.subject}</div>
      </div>
      <div class="class-card-body">
        <div class="class-card-meta">
          <span>👤 ${c.teacherName}</span>
          <span>📅 ${c.semester}</span>
          <span>🏫 ${c.room}</span>
          <span>⏰ ${c.schedule}</span>
        </div>
      </div>
      <div class="class-card-footer">
        <span class="class-student-count">${count} student${count!==1?'s':''}</span>
        <div class="class-card-actions">
          <button class="btn-icon" onclick="editClass('${c.id}')">✏ Edit</button>
          <button class="btn-danger" onclick="confirmDeleteClass('${c.id}')">✕</button>
        </div>
      </div>`;
    card.querySelector('.class-card-header').addEventListener('click', () => {
      currentClassId = c.id;
      document.getElementById('classSelector').value = c.id;
      navigate('students');
    });
    grid.appendChild(card);
  });

  document.getElementById('btnAddClass').onclick = () => openClassModal();
}

function openClassModal(cls = null) {
  const isEdit = !!cls;
  openModal(isEdit ? 'Edit Class' : 'Add New Class', `
    <div class="form-group"><label>Class Name</label>
      <input type="text" id="f-name" value="${cls?.name||''}" placeholder="e.g. BSCS 2A"/></div>
    <div class="form-group"><label>Subject</label>
      <input type="text" id="f-subject" value="${cls?.subject||''}" placeholder="e.g. Data Structures"/></div>
    <div class="form-group"><label>Teacher Name</label>
      <input type="text" id="f-teacher" value="${cls?.teacherName||currentUser.name}" placeholder="Teacher name"/></div>
    <div class="form-row">
      <div class="form-group"><label>Room</label>
        <input type="text" id="f-room" value="${cls?.room||''}" placeholder="Room 301"/></div>
      <div class="form-group"><label>Semester</label>
        <input type="text" id="f-sem" value="${cls?.semester||'1st Sem 2024-2025'}" placeholder="1st Sem 2024-2025"/></div>
    </div>
    <div class="form-group"><label>Schedule</label>
      <input type="text" id="f-sched" value="${cls?.schedule||''}" placeholder="MWF 7:30-9:00 AM"/></div>
  `, () => {
    const data = {
      name:        document.getElementById('f-name').value.trim(),
      subject:     document.getElementById('f-subject').value.trim(),
      teacherName: document.getElementById('f-teacher').value.trim(),
      teacherId:   cls?.teacherId || currentUser.id,
      room:        document.getElementById('f-room').value.trim(),
      semester:    document.getElementById('f-sem').value.trim(),
      schedule:    document.getElementById('f-sched').value.trim()
    };
    if (!data.name || !data.subject) { toast('Name and subject are required.','error'); return false; }
    if (isEdit) { DB.updateClass(cls.id, data); toast('Class updated!','success'); }
    else        { DB.addClass(data); toast('Class added!','success'); }
    populateClassSelector();
    renderClasses();
    renderDashboard();
    return true;
  });
}

function editClass(id) {
  const cls = DB.getClass(id);
  if (cls) openClassModal(cls);
}

function confirmDeleteClass(id) {
  const cls = DB.getClass(id);
  openModal('Delete Class', `<p>Delete <strong>${cls?.name}</strong>? This will also remove all its students.</p>`, () => {
    DB.deleteClass(id);
    if (currentClassId === id) { currentClassId = null; document.getElementById('classSelector').value = ''; }
    toast('Class deleted.','success');
    populateClassSelector();
    renderClasses();
    renderDashboard();
    return true;
  }, 'Delete', 'btn-danger');
}

// ═════════════════════════════════ STUDENTS ═════════════════
function renderStudents() {
  const noMsg = document.getElementById('noClassMsg');
  const grid  = document.getElementById('studentGrid');
  const search = (document.getElementById('studentSearch')?.value || '').toLowerCase();

  if (!currentClassId) {
    noMsg.classList.remove('hidden');
    grid.innerHTML = '';
    document.getElementById('btnAddStudent').onclick = null;
    return;
  }
  noMsg.classList.add('hidden');

  const students = DB.getStudents(currentClassId)
    .filter(s => !search || s.name.toLowerCase().includes(search) || s.studentId.includes(search));

  grid.innerHTML = '';
  if (!students.length) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-icon">✦</div><p>No students found.</p></div>';
  } else {
    students.forEach(s => renderStudentCard(s, grid));
  }

  document.getElementById('btnAddStudent').onclick = () => openStudentModal();
  document.getElementById('studentSearch').oninput  = () => renderStudents();
}

function renderStudentCard(s, container) {
  const grade = DB.computeGrade(s.id, s.classId);
  const initials = s.name.split(',')[0].trim().substring(0,2).toUpperCase();
  const card = document.createElement('div');
  card.className = 'student-card';
  card.innerHTML = `
    <div class="student-card-actions">
      <button class="btn-icon" onclick="event.stopPropagation();editStudent('${s.id}')">✏</button>
      <button class="btn-danger" onclick="event.stopPropagation();confirmDeleteStudent('${s.id}')">✕</button>
    </div>
    <div class="student-avatar">${initials}</div>
    <div class="student-name">${s.name}</div>
    <div class="student-id">${s.studentId}</div>
    <span class="student-grade-badge ${grade.status==='PASS'?'badge-pass':grade.status==='FAIL'?'badge-fail':'badge-nd'}">
      ${grade.final !== 'N/A' ? grade.final+'% — ' : ''}${grade.status}
    </span>`;
  card.addEventListener('click', () => openStudentDetail(s.id));
  container.appendChild(card);
}

function openStudentModal(stu = null) {
  const isEdit = !!stu;
  const classes = DB.getClasses(currentUser.role, currentUser.id);
  const classOptions = classes.map(c =>
    `<option value="${c.id}" ${(stu?.classId||currentClassId)===c.id?'selected':''}>${c.name}</option>`).join('');

  openModal(isEdit ? 'Edit Student' : 'Add New Student', `
    <div class="form-group"><label>Full Name (Last, First MI.)</label>
      <input type="text" id="f-sname" value="${stu?.name||''}" placeholder="Santos, Maria C."/></div>
    <div class="form-row">
      <div class="form-group"><label>Student ID</label>
        <input type="text" id="f-sid" value="${stu?.studentId||''}" placeholder="2022-0001"/></div>
      <div class="form-group"><label>Class</label>
        <select id="f-scls">${classOptions}</select></div>
    </div>
    <div class="form-group"><label>Email</label>
      <input type="email" id="f-semail" value="${stu?.email||''}" placeholder="student@uphsd.edu.ph"/></div>
    <div class="form-group"><label>Address</label>
      <input type="text" id="f-saddr" value="${stu?.address||''}" placeholder="Street, City"/></div>
    <div class="form-row">
      <div class="form-group"><label>Phone</label>
        <input type="text" id="f-sphone" value="${stu?.phone||''}" placeholder="09XXXXXXXXX"/></div>
      <div class="form-group"><label>Gender</label>
        <select id="f-sgender">
          <option ${stu?.gender==='Male'?'selected':''}>Male</option>
          <option ${stu?.gender==='Female'?'selected':''}>Female</option>
        </select></div>
    </div>
    <div class="form-group"><label>Birthday</label>
      <input type="date" id="f-sbday" value="${stu?.birthday||''}"/></div>
  `, () => {
    const data = {
      name:      document.getElementById('f-sname').value.trim(),
      studentId: document.getElementById('f-sid').value.trim(),
      classId:   document.getElementById('f-scls').value,
      email:     document.getElementById('f-semail').value.trim(),
      address:   document.getElementById('f-saddr').value.trim(),
      phone:     document.getElementById('f-sphone').value.trim(),
      gender:    document.getElementById('f-sgender').value,
      birthday:  document.getElementById('f-sbday').value
    };
    if (!data.name || !data.studentId) { toast('Name and Student ID required.','error'); return false; }
    if (isEdit) { DB.updateStudent(stu.id, data); toast('Student updated!','success'); }
    else        { DB.addStudent(data); toast('Student added!','success'); }
    renderStudents();
    renderDashboard();
    return true;
  });
}

function editStudent(id) {
  const s = DB.getStudent(id);
  if (s) openStudentModal(s);
}

function confirmDeleteStudent(id) {
  const s = DB.getStudent(id);
  openModal('Delete Student', `<p>Delete <strong>${s?.name}</strong>? This cannot be undone.</p>`, () => {
    DB.deleteStudent(id);
    toast('Student deleted.','success');
    renderStudents();
    renderDashboard();
    return true;
  }, 'Delete', 'btn-danger');
}

// ═════════════════════════════════ STUDENT DETAIL ════════════
function openStudentDetail(studentId) {
  currentStudentId = studentId;
  const s = DB.getStudent(studentId);
  if (!s) return;

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-student-detail').classList.add('active');
  document.getElementById('topbarTitle').textContent = 'Student Detail';
  document.getElementById('btnBackStudents').onclick = () => navigate('students');

  const initials = s.name.split(',')[0].trim().substring(0,2).toUpperCase();
  const cls = DB.getClass(s.classId);
  document.getElementById('studentDetailHeader').innerHTML = `
    <div class="student-detail-banner">
      <div class="detail-avatar">${initials}</div>
      <div>
        <div class="detail-name">${s.name}</div>
        <div class="detail-meta">${s.studentId} &nbsp;·&nbsp; ${cls?.name||''} &nbsp;·&nbsp; ${cls?.subject||''}</div>
      </div>
    </div>`;

  // bind tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      renderTab(this.dataset.tab, s);
    });
  });

  // activate first tab
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.tab-btn[data-tab="school-info"]').classList.add('active');
  renderTab('school-info', s);
}

function renderTab(tab, s) {
  const cls = DB.getClass(s.classId);
  const container = document.getElementById('tabContent');

  switch(tab) {
    case 'school-info':    container.innerHTML = renderSchoolInfo(s, cls); break;
    case 'personal-info':  container.innerHTML = renderPersonalInfo(s); break;
    case 'quizzes':        renderGradeTab(s, 'quizzes'); break;
    case 'assignments-tab':renderGradeTab(s, 'assignments'); break;
    case 'major-exams':    renderGradeTab(s, 'exams'); break;
    case 'attendance-tab': renderStudentAttendance(s); break;
    case 'grade-summary':  container.innerHTML = renderGradeSummary(s); break;
  }
}

function renderSchoolInfo(s, cls) {
  return `<div class="table-wrap"><div class="table-toolbar"><h4>School Information</h4></div>
    <div style="padding:20px">
      <div class="info-grid">
        <div class="info-item"><label>Student ID</label><span>${s.studentId}</span></div>
        <div class="info-item"><label>Full Name</label><span>${s.name}</span></div>
        <div class="info-item"><label>Class / Section</label><span>${cls?.name||'—'}</span></div>
        <div class="info-item"><label>Subject</label><span>${cls?.subject||'—'}</span></div>
        <div class="info-item"><label>Semester</label><span>${cls?.semester||'—'}</span></div>
        <div class="info-item"><label>Room</label><span>${cls?.room||'—'}</span></div>
        <div class="info-item"><label>Schedule</label><span>${cls?.schedule||'—'}</span></div>
        <div class="info-item"><label>Faculty</label><span>${cls?.teacherName||'—'}</span></div>
      </div>
    </div></div>`;
}

function renderPersonalInfo(s) {
  return `<div class="table-wrap"><div class="table-toolbar"><h4>Personal Information</h4>
    <button class="btn-primary" onclick="editStudent('${s.id}');renderTab('personal-info',DB.getStudent('${s.id}'))">✏ Edit</button>
    </div>
    <div style="padding:20px">
      <div class="info-grid">
        <div class="info-item"><label>Email</label><span>${s.email||'—'}</span></div>
        <div class="info-item"><label>Phone</label><span>${s.phone||'—'}</span></div>
        <div class="info-item"><label>Address</label><span>${s.address||'—'}</span></div>
        <div class="info-item"><label>Gender</label><span>${s.gender||'—'}</span></div>
        <div class="info-item"><label>Birthday</label><span>${s.birthday||'—'}</span></div>
      </div>
    </div></div>`;
}

function renderGradeTab(s, type) {
  const container = document.getElementById('tabContent');
  let items, addFn, title, cols;

  if (type === 'quizzes') {
    items  = DB.getQuizzes(s.classId);
    addFn  = () => openItemModal('quiz', s.classId, null, () => renderGradeTab(s,'quizzes'));
    title  = 'Quizzes';
    cols   = ['Title','Date','Total Score','Score','Percentage'];
  } else if (type === 'assignments') {
    items  = DB.getAssignments(s.classId);
    addFn  = () => openItemModal('assignment', s.classId, null, () => renderGradeTab(s,'assignments'));
    title  = 'Assignments & Projects';
    cols   = ['Title','Type','Due Date','Total Score','Score','Percentage'];
  } else {
    items  = DB.getExams(s.classId);
    addFn  = () => openItemModal('exam', s.classId, null, () => renderGradeTab(s,'exams'));
    title  = 'Major Examinations';
    cols   = ['Title','Type','Date','Total Score','Score','Percentage'];
  }

  let rows = '';
  items.forEach(it => {
    const sc    = DB.getScore(s.id, it.id);
    const pct   = sc !== '' ? ((parseFloat(sc)/it.totalScore)*100).toFixed(1) + '%' : '—';
    const meta  = type === 'quizzes'     ? `<td>${it.date}</td>` :
                  type === 'assignments' ? `<td><span class="status-chip chip-late">${it.type}</span></td><td>${it.dueDate}</td>` :
                                           `<td><span class="status-chip chip-present">${it.type}</span></td><td>${it.date}</td>`;
    rows += `<tr>
      <td>${it.title}</td>
      ${meta}
      <td><span style="font-family:'DM Mono',monospace">${it.totalScore}</span></td>
      <td><input class="grade-input" type="number" min="0" max="${it.totalScore}"
        value="${sc}" placeholder="—"
        onchange="DB.setScore('${s.id}','${it.id}',this.value);renderGradeTab(DB.getStudent('${s.id}'),'${type}')"/></td>
      <td><span style="font-family:'DM Mono',monospace;font-weight:600">${pct}</span></td>
    </tr>`;
  });

  const thCols = cols.map(c=>`<th>${c}</th>`).join('') + '<th></th>';

  container.innerHTML = `
    <div class="table-wrap">
      <div class="table-toolbar">
        <h4>${title}</h4>
        <button class="btn-primary" onclick="(${addFn.toString()})()">+ Add</button>
      </div>
      ${items.length ? `<table><thead><tr>${thCols}</tr></thead><tbody>${rows}</tbody></table>`
                     : '<div class="empty-state" style="padding:40px"><p>No items yet.</p></div>'}
    </div>`;
}

function renderStudentAttendance(s) {
  const container = document.getElementById('tabContent');
  const sessions  = DB.getSessions(s.classId);
  const summary   = DB.attendanceSummary(s.id, s.classId);
  const pct       = summary.total ? Math.round((summary.present/summary.total)*100) : 0;

  let rows = '';
  sessions.forEach(ss => {
    const att = DB.getAttendance(s.id, ss.id);
    rows += `<tr>
      <td>${ss.date}</td>
      <td>${ss.topic}</td>
      <td>
        <select class="att-select" onchange="DB.setAttendance('${s.id}','${ss.id}',this.value)">
          <option value="present" ${att==='present'?'selected':''}>Present</option>
          <option value="absent"  ${att==='absent' ?'selected':''}>Absent</option>
          <option value="late"    ${att==='late'   ?'selected':''}>Late</option>
        </select>
      </td>
      <td><span class="status-chip chip-${att}">${att.charAt(0).toUpperCase()+att.slice(1)}</span></td>
    </tr>`;
  });

  container.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px">
      <div class="stat-card"><div class="stat-value">${summary.total}</div><div class="stat-label">Sessions</div></div>
      <div class="stat-card green"><div class="stat-value">${summary.present}</div><div class="stat-label">Present</div></div>
      <div class="stat-card"><div class="stat-value" style="color:#c0392b">${summary.absent}</div><div class="stat-label">Absent</div></div>
      <div class="stat-card gold"><div class="stat-value">${summary.late}</div><div class="stat-label">Late</div></div>
    </div>
    <div class="table-wrap">
      <div class="table-toolbar"><h4>Attendance Record</h4>
        <span style="font-size:12px;color:var(--ink-faint)">Attendance rate: <strong>${pct}%</strong></span>
      </div>
      ${sessions.length
        ? `<table><thead><tr><th>Date</th><th>Topic</th><th>Mark</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`
        : '<div class="empty-state" style="padding:40px"><p>No sessions recorded yet.</p></div>'}
    </div>`;
}

function renderGradeSummary(s) {
  const g = DB.computeGrade(s.id, s.classId);
  const statusClass = g.status==='PASS'?'badge-pass':g.status==='FAIL'?'badge-fail':'badge-nd';

  return `
    <div class="grade-summary-grid">
      <div class="grade-box">
        <div class="grade-box-val">${g.quiz}</div>
        <div class="grade-box-lbl">Quiz Average</div>
        <div style="font-size:11px;color:var(--ink-faint);margin-top:4px">Weight: 20%</div>
      </div>
      <div class="grade-box gold">
        <div class="grade-box-val">${g.assignment}</div>
        <div class="grade-box-lbl">Assignment Average</div>
        <div style="font-size:11px;color:var(--ink-faint);margin-top:4px">Weight: 30%</div>
      </div>
      <div class="grade-box">
        <div class="grade-box-val">${g.exam}</div>
        <div class="grade-box-lbl">Exam Average</div>
        <div style="font-size:11px;color:var(--ink-faint);margin-top:4px">Weight: 50%</div>
      </div>
      <div class="grade-box green">
        <div class="grade-box-val">${g.final}</div>
        <div class="grade-box-lbl">Final Grade</div>
        <div style="margin-top:6px"><span class="student-grade-badge ${statusClass}">${g.status}</span></div>
      </div>
    </div>
    <div class="table-wrap">
      <div class="table-toolbar"><h4>Grade Breakdown</h4></div>
      <table>
        <thead><tr><th>Component</th><th>Weight</th><th>Score (%)</th><th>Weighted</th></tr></thead>
        <tbody>
          <tr><td>Quizzes</td><td>20%</td>
            <td><span style="font-family:'DM Mono',monospace">${g.quiz}</span></td>
            <td><span style="font-family:'DM Mono',monospace">${g.quiz!=='N/A'?(parseFloat(g.quiz)*0.20).toFixed(1):'—'}</span></td></tr>
          <tr><td>Assignments & Projects</td><td>30%</td>
            <td><span style="font-family:'DM Mono',monospace">${g.assignment}</span></td>
            <td><span style="font-family:'DM Mono',monospace">${g.assignment!=='N/A'?(parseFloat(g.assignment)*0.30).toFixed(1):'—'}</span></td></tr>
          <tr><td>Major Examinations</td><td>50%</td>
            <td><span style="font-family:'DM Mono',monospace">${g.exam}</span></td>
            <td><span style="font-family:'DM Mono',monospace">${g.exam!=='N/A'?(parseFloat(g.exam)*0.50).toFixed(1):'—'}</span></td></tr>
          <tr style="background:var(--cream);font-weight:700">
            <td colspan="2"><strong>Final Grade</strong></td>
            <td colspan="2"><strong style="font-family:'DM Mono',monospace;font-size:16px">${g.final}%</strong>
              <span class="student-grade-badge ${statusClass}" style="margin-left:8px">${g.status}</span></td></tr>
        </tbody>
      </table>
    </div>`;
}

// ═════════════════════════════════ ITEM MODAL (quiz/asn/exam) ══
function openItemModal(type, classId, item, onDone) {
  const isEdit = !!item;
  const isQuiz = type==='quiz', isAssign = type==='assignment', isExam = type==='exam';
  const title  = isEdit ? `Edit ${type.charAt(0).toUpperCase()+type.slice(1)}`
                        : `Add ${type.charAt(0).toUpperCase()+type.slice(1)}`;

  const typeSelect = (isAssign||isExam) ? `<div class="form-group"><label>Type</label>
    <select id="f-type">
      ${isAssign
        ? '<option>Lab</option><option>Activity</option><option>Project</option><option>Assignment</option>'
        : '<option>Midterm</option><option>Final</option><option>Long Quiz</option>'}
    </select></div>` : '';

  const dateLabel  = isQuiz ? 'Date' : isAssign ? 'Due Date' : 'Date';

  openModal(title, `
    <div class="form-group"><label>Title</label>
      <input type="text" id="f-ititle" value="${item?.title||''}" placeholder="${type} title"/></div>
    ${typeSelect}
    <div class="form-row">
      <div class="form-group"><label>${dateLabel}</label>
        <input type="date" id="f-idate" value="${item?.date||item?.dueDate||''}"/></div>
      <div class="form-group"><label>Total Score</label>
        <input type="number" id="f-itotal" value="${item?.totalScore||50}" min="1"/></div>
    </div>
  `, () => {
    const data = {
      classId,
      title:      document.getElementById('f-ititle').value.trim(),
      totalScore: parseFloat(document.getElementById('f-itotal').value)||50,
    };
    if (isAssign||isExam) data.type = document.getElementById('f-type').value;
    const d = document.getElementById('f-idate').value;
    if (isAssign) data.dueDate = d; else data.date = d;
    if (!data.title) { toast('Title required.','error'); return false; }

    if (isEdit) {
      if (isQuiz) DB.updateQuiz(item.id, data);
      else if (isAssign) DB.updateAssignment(item.id, data);
      else DB.updateExam(item.id, data);
      toast('Updated!','success');
    } else {
      if (isQuiz) DB.addQuiz(data);
      else if (isAssign) DB.addAssignment(data);
      else DB.addExam(data);
      toast('Added!','success');
    }
    onDone && onDone();
    return true;
  });
}

// ═════════════════════════════════ ATTENDANCE PAGE ══════════
function renderAttendancePage() {
  const container = document.getElementById('attendancePage');

  if (!currentClassId) {
    container.innerHTML = '<div class="no-class-banner">⚠ Please select a class first.</div>';
    document.getElementById('btnAddSession').onclick = null;
    return;
  }

  const sessions = DB.getSessions(currentClassId);
  const students = DB.getStudents(currentClassId);

  let rows = '';
  sessions.forEach(ss => {
    let p=0,a=0,l=0;
    students.forEach(s => {
      const v = DB.getAttendance(s.id, ss.id);
      if(v==='present')p++; else if(v==='absent')a++; else if(v==='late')l++;
    });
    rows += `<tr>
      <td>${ss.date}</td>
      <td>${ss.topic}</td>
      <td><span class="status-chip chip-present">${p}</span></td>
      <td><span class="status-chip chip-absent">${a}</span></td>
      <td><span class="status-chip chip-late">${l}</span></td>
      <td>
        <button class="btn-icon" onclick="openSessionAttendance('${ss.id}')">📋 Mark</button>
        <button class="btn-danger" onclick="confirmDeleteSession('${ss.id}')">✕</button>
      </td>
    </tr>`;
  });

  container.innerHTML = `
    <div class="table-wrap">
      <div class="table-toolbar"><h4>Sessions</h4></div>
      ${sessions.length
        ? `<table><thead><tr><th>Date</th><th>Topic</th><th>Present</th><th>Absent</th><th>Late</th><th>Actions</th></tr></thead>
           <tbody>${rows}</tbody></table>`
        : '<div class="empty-state" style="padding:40px"><p>No sessions yet.</p></div>'}
    </div>`;

  document.getElementById('btnAddSession').onclick = () => {
    openModal('New Attendance Session', `
      <div class="form-group"><label>Date</label>
        <input type="date" id="f-ssdate" value="${new Date().toISOString().split('T')[0]}"/></div>
      <div class="form-group"><label>Topic / Lesson</label>
        <input type="text" id="f-sstopic" placeholder="e.g. Introduction to Arrays"/></div>
    `, () => {
      const d = document.getElementById('f-ssdate').value;
      const t = document.getElementById('f-sstopic').value.trim();
      if (!d) { toast('Date required.','error'); return false; }
      DB.addSession({ classId: currentClassId, date:d, topic:t||'No topic' });
      toast('Session added!','success');
      renderAttendancePage();
      return true;
    });
  };
}

function openSessionAttendance(sessionId) {
  const ss = DB._d.sessions.find(s => s.id === sessionId);
  if (!ss) return;
  const students = DB.getStudents(currentClassId);

  let rows = students.map(s => {
    const att = DB.getAttendance(s.id, sessionId);
    return `<tr>
      <td>${s.studentId}</td><td>${s.name}</td>
      <td>
        <select class="att-select" id="att-${s.id}">
          <option value="present" ${att==='present'?'selected':''}>Present</option>
          <option value="absent"  ${att==='absent' ?'selected':''}>Absent</option>
          <option value="late"    ${att==='late'   ?'selected':''}>Late</option>
        </select>
      </td>
    </tr>`;
  }).join('');

  openModal(`Attendance: ${ss.date} — ${ss.topic}`,
    `<table><thead><tr><th>ID</th><th>Name</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`,
    () => {
      students.forEach(s => {
        const v = document.getElementById('att-'+s.id)?.value || 'present';
        DB.setAttendance(s.id, sessionId, v);
      });
      toast('Attendance saved!','success');
      renderAttendancePage();
      return true;
    }, 'Save Attendance');
}

function confirmDeleteSession(id) {
  openModal('Delete Session', '<p>Delete this session? Attendance records will be lost.</p>', () => {
    DB.deleteSession(id);
    toast('Session deleted.','success');
    renderAttendancePage();
    return true;
  }, 'Delete', 'btn-danger');
}

// ═════════════════════════════════ ASSIGNMENTS PAGE ═════════
function renderAssignmentsPage() {
  const container = document.getElementById('assignmentsPage');

  if (!currentClassId) {
    container.innerHTML = '<div class="no-class-banner">⚠ Please select a class first.</div>';
    document.getElementById('btnAddAssignment').onclick = null;
    return;
  }

  const assignments = DB.getAssignments(currentClassId);
  const students    = DB.getStudents(currentClassId);

  let html = '';
  if (!assignments.length) {
    html = '<div class="empty-state"><div class="empty-icon">◈</div><p>No assignments yet.</p></div>';
  } else {
    assignments.forEach(a => {
      let rows = students.map(s => {
        const sc  = DB.getScore(s.id, a.id);
        const pct = sc !== '' ? ((parseFloat(sc)/a.totalScore)*100).toFixed(1)+'%' : '—';
        return `<tr>
          <td>${s.studentId}</td><td>${s.name}</td>
          <td><input class="grade-input" type="number" min="0" max="${a.totalScore}"
            value="${sc}" placeholder="—"
            onchange="DB.setScore('${s.id}','${a.id}',this.value)"/></td>
          <td><span style="font-family:'DM Mono',monospace">${pct}</span></td>
        </tr>`;
      }).join('');

      html += `
        <div class="table-wrap" style="margin-bottom:20px">
          <div class="table-toolbar">
            <div>
              <h4>${a.title}</h4>
              <span style="font-size:11px;color:var(--ink-faint)">
                <span class="status-chip chip-late" style="margin-right:6px">${a.type}</span>
                Due: ${a.dueDate||'—'} &nbsp;·&nbsp; Total: ${a.totalScore} pts
              </span>
            </div>
            <div style="display:flex;gap:6px">
              <button class="btn-icon" onclick="openItemModal('assignment','${currentClassId}',DB.getAssignments('${currentClassId}').find(x=>x.id==='${a.id}'),renderAssignmentsPage)">✏</button>
              <button class="btn-danger" onclick="DB.deleteAssignment('${a.id}');toast('Deleted','success');renderAssignmentsPage()">✕</button>
            </div>
          </div>
          <table><thead><tr><th>ID</th><th>Student</th><th>Score / ${a.totalScore}</th><th>%</th></tr></thead>
          <tbody>${rows}</tbody></table>
        </div>`;
    });
  }

  container.innerHTML = html;
  document.getElementById('btnAddAssignment').onclick = () =>
    openItemModal('assignment', currentClassId, null, renderAssignmentsPage);
}

// ═════════════════════════════════ GRADE BOOK ═══════════════
function renderGradebook() {
  const container = document.getElementById('gradebookPage');

  if (!currentClassId) {
    container.innerHTML = '<div class="no-class-banner">⚠ Please select a class first.</div>';
    document.getElementById('btnExportCSV').onclick = null;
    return;
  }

  const students = DB.getStudents(currentClassId);
  const quizzes  = DB.getQuizzes(currentClassId);
  const assigns  = DB.getAssignments(currentClassId);
  const exams    = DB.getExams(currentClassId);

  const qCols = quizzes.map(q => `<th title="${q.title}">Q${quizzes.indexOf(q)+1}</th>`).join('');
  const aCols = assigns.map(a => `<th title="${a.title}">A${assigns.indexOf(a)+1}</th>`).join('');
  const eCols = exams.map(e   => `<th title="${e.title}">E${exams.indexOf(e)+1}</th>`).join('');

  let rows = '';
  students.forEach((s, i) => {
    const g   = DB.computeGrade(s.id, s.classId);
    const qSc = quizzes.map(q => { const sc=DB.getScore(s.id,q.id); return `<td style="font-family:'DM Mono',monospace;font-size:12px">${sc!==''?sc:'—'}</td>`; }).join('');
    const aSc = assigns.map(a => { const sc=DB.getScore(s.id,a.id); return `<td style="font-family:'DM Mono',monospace;font-size:12px">${sc!==''?sc:'—'}</td>`; }).join('');
    const eSc = exams.map(e   => { const sc=DB.getScore(s.id,e.id); return `<td style="font-family:'DM Mono',monospace;font-size:12px">${sc!==''?sc:'—'}</td>`; }).join('');
    const sc  = g.status==='PASS'?'badge-pass':g.status==='FAIL'?'badge-fail':'badge-nd';
    rows += `<tr>
      <td style="font-weight:600">${i+1}</td>
      <td style="white-space:nowrap">${s.name}</td>
      <td style="font-family:'DM Mono',monospace;font-size:11px">${s.studentId}</td>
      ${qSc}${aSc}${eSc}
      <td style="font-family:'DM Mono',monospace;font-weight:700">${g.quiz}</td>
      <td style="font-family:'DM Mono',monospace;font-weight:700">${g.assignment}</td>
      <td style="font-family:'DM Mono',monospace;font-weight:700">${g.exam}</td>
      <td style="font-family:'DM Mono',monospace;font-weight:800;font-size:14px">${g.final}</td>
      <td><span class="student-grade-badge ${sc}">${g.status}</span></td>
    </tr>`;
  });

  container.innerHTML = `
    <div class="gradebook-table-wrap">
      <div class="table-toolbar"><h4>Grade Book — ${DB.getClass(currentClassId)?.name}</h4>
        <span style="font-size:11px;color:var(--ink-faint)">
          Q=Quiz&nbsp; A=Assignment&nbsp; E=Exam | Weights: Q20% A30% E50%
        </span>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th><th>Name</th><th>ID</th>
            ${qCols||'<th>Quizzes</th>'}
            ${aCols||'<th>Assignments</th>'}
            ${eCols||'<th>Exams</th>'}
            <th>Quiz%</th><th>Assign%</th><th>Exam%</th>
            <th>Final%</th><th>Status</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;

  document.getElementById('btnExportCSV').onclick = () => exportCSV(students, quizzes, assigns, exams);
}

function exportCSV(students, quizzes, assigns, exams) {
  const cls = DB.getClass(currentClassId);
  let csv = `UPHSD Grade Export — ${cls?.name} — ${cls?.subject}\n`;
  csv += `Student ID,Name,${quizzes.map(q=>q.title).join(',')},${assigns.map(a=>a.title).join(',')},${exams.map(e=>e.title).join(',')},Quiz%,Assignment%,Exam%,Final%,Status\n`;
  students.forEach(s => {
    const g = DB.computeGrade(s.id, s.classId);
    const qSc = quizzes.map(q => DB.getScore(s.id,q.id)).join(',');
    const aSc = assigns.map(a => DB.getScore(s.id,a.id)).join(',');
    const eSc = exams.map(e   => DB.getScore(s.id,e.id)).join(',');
    csv += `${s.studentId},"${s.name}",${qSc},${aSc},${eSc},${g.quiz},${g.assignment},${g.exam},${g.final},${g.status}\n`;
  });
  const blob = new Blob([csv], { type:'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `grades_${cls?.name?.replace(/\s+/g,'_')}.csv`;
  a.click();
  toast('CSV exported!','success');
}

// ═════════════════════════════════ REPORTS ══════════════════
function renderReports() {
  const container = document.getElementById('reportsPage');
  const classes   = DB.getClasses(currentUser.role, currentUser.id);

  let html = '<div class="report-grid">';
  classes.forEach(c => {
    const students = DB.getStudents(c.id);
    let pass=0, fail=0, total=students.length;
    let qSum=0, aSum=0, eSum=0, fSum=0, cnt=0;
    students.forEach(s => {
      const g = DB.computeGrade(s.id, c.id);
      if (g.status==='PASS') pass++; else if(g.status==='FAIL') fail++;
      if (g.final!=='N/A') { qSum+=parseFloat(g.quiz)||0; aSum+=parseFloat(g.assignment)||0; eSum+=parseFloat(g.exam)||0; fSum+=parseFloat(g.final); cnt++; }
    });
    const rate = total ? Math.round((pass/total)*100) : 0;
    const avgQ = cnt ? (qSum/cnt).toFixed(1) : '—';
    const avgA = cnt ? (aSum/cnt).toFixed(1) : '—';
    const avgE = cnt ? (eSum/cnt).toFixed(1) : '—';
    const avgF = cnt ? (fSum/cnt).toFixed(1) : '—';

    let stuRows = students.map(s => {
      const g = DB.computeGrade(s.id, c.id);
      const sc = g.status==='PASS'?'badge-pass':g.status==='FAIL'?'badge-fail':'badge-nd';
      return `<tr>
        <td>${s.name}</td>
        <td style="font-family:'DM Mono',monospace">${g.quiz}</td>
        <td style="font-family:'DM Mono',monospace">${g.assignment}</td>
        <td style="font-family:'DM Mono',monospace">${g.exam}</td>
        <td style="font-family:'DM Mono',monospace;font-weight:700">${g.final}</td>
        <td><span class="student-grade-badge ${sc}">${g.status}</span></td>
      </tr>`;
    }).join('');

    html += `
      <div class="table-wrap">
        <div class="table-toolbar">
          <div>
            <h4>${c.name} — ${c.subject}</h4>
            <span style="font-size:11px;color:var(--ink-faint)">${c.teacherName} · ${c.semester}</span>
          </div>
          <span class="student-grade-badge ${rate>=75?'badge-pass':'badge-fail'}">${rate}% passing</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0;border-bottom:1px solid var(--cream-dark)">
          ${[['Quiz Avg',avgQ],['Assign Avg',avgA],['Exam Avg',avgE],['Final Avg',avgF]].map(([l,v])=>`
            <div style="padding:14px;text-align:center;border-right:1px solid var(--cream-dark)">
              <div style="font-family:'DM Serif Display',serif;font-size:22px;color:var(--maroon-dark)">${v}</div>
              <div style="font-size:10px;color:var(--ink-faint);text-transform:uppercase;letter-spacing:.5px">${l}</div>
            </div>`).join('')}
        </div>
        <table>
          <thead><tr><th>Student</th><th>Quiz%</th><th>Assign%</th><th>Exam%</th><th>Final%</th><th>Status</th></tr></thead>
          <tbody>${stuRows||'<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--ink-faint)">No students</td></tr>'}</tbody>
        </table>
      </div>`;
  });
  html += '</div>';
  container.innerHTML = html;
}

// ═════════════════════════════════ MODAL ════════════════════
function bindModal() {
  document.getElementById('modalClose').addEventListener('click',  closeModal);
  document.getElementById('modalCancel').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });
  document.getElementById('modalConfirm').addEventListener('click', () => {
    if (modalCallback && modalCallback() !== false) closeModal();
  });
}

function openModal(title, bodyHTML, onConfirm, confirmLabel='Save', confirmClass='btn-primary') {
  document.getElementById('modalTitle').textContent   = title;
  document.getElementById('modalBody').innerHTML      = bodyHTML;
  document.getElementById('modalConfirm').textContent = confirmLabel;
  document.getElementById('modalConfirm').className   = confirmClass;
  document.getElementById('modalOverlay').classList.remove('hidden');
  modalCallback = onConfirm;
  // focus first input
  setTimeout(() => { const inp = document.querySelector('#modalBody input'); if(inp) inp.focus(); }, 100);
}

function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
  modalCallback = null;
}
