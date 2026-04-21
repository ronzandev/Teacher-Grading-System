// ============================================================
//  UPHSD GRADING SYSTEM — DATA LAYER
// ============================================================
const DB_KEY = 'uphsd_db';

const SEED = {
  users: [
    { id:'u1', username:'admin',       password:'admin123',   role:'admin',   name:'System Administrator'  },
    { id:'u2', username:'prof.santos', password:'teacher123', role:'teacher', name:'Prof. Maria Santos'    },
    { id:'u3', username:'prof.reyes',  password:'teacher123', role:'teacher', name:'Prof. Jose Reyes'      }
  ],
  classes: [
    { id:'c1', name:'BSCS 2A', subject:'Data Structures & Algorithms', teacherId:'u2', teacherName:'Prof. Maria Santos', semester:'1st Sem 2024-2025', room:'Room 301', schedule:'MWF 7:30-9:00 AM'   },
    { id:'c2', name:'BSCS 2B', subject:'Data Structures & Algorithms', teacherId:'u2', teacherName:'Prof. Maria Santos', semester:'1st Sem 2024-2025', room:'Room 302', schedule:'MWF 10:30-12:00 NN' },
    { id:'c3', name:'BSIT 3A', subject:'Web Development',              teacherId:'u3', teacherName:'Prof. Jose Reyes',   semester:'1st Sem 2024-2025', room:'Lab 201',  schedule:'TTh 1:00-4:00 PM'   }
  ],
  students: [
    { id:'s1',  classId:'c1', studentId:'2022-0001', name:'Adriano, Juan Miguel',     email:'jm.adriano@uphsd.edu.ph',   address:'123 Rizal St., Las Pinas City',     phone:'09171234567', gender:'Male',   birthday:'2003-05-12' },
    { id:'s2',  classId:'c1', studentId:'2022-0002', name:'Bautista, Angela Rose',    email:'ar.bautista@uphsd.edu.ph',  address:'456 Aguinaldo Blvd., Imus, Cavite', phone:'09281234567', gender:'Female', birthday:'2003-08-20' },
    { id:'s3',  classId:'c1', studentId:'2022-0003', name:'Cruz, Carlo David',        email:'cd.cruz@uphsd.edu.ph',      address:'789 Lakandula St., Dasmarinas',     phone:'09391234567', gender:'Male',   birthday:'2002-11-30' },
    { id:'s4',  classId:'c1', studentId:'2022-0004', name:'Dela Rosa, Maria Elena',   email:'me.delarosa@uphsd.edu.ph',  address:'321 Padre Burgos Ave., Bacoor',     phone:'09451234567', gender:'Female', birthday:'2003-02-14' },
    { id:'s5',  classId:'c1', studentId:'2022-0005', name:'Espinosa, Kevin Joseph',   email:'kj.espinosa@uphsd.edu.ph',  address:'654 Mabini St., Cavite City',       phone:'09561234567', gender:'Male',   birthday:'2003-07-07' },
    { id:'s6',  classId:'c2', studentId:'2022-0006', name:'Fernandez, Lovely Grace',  email:'lg.fernandez@uphsd.edu.ph', address:'111 Del Pilar St., Gen. Trias',     phone:'09671234567', gender:'Female', birthday:'2003-03-22' },
    { id:'s7',  classId:'c2', studentId:'2022-0007', name:'Garcia, Mark Anthony',     email:'ma.garcia@uphsd.edu.ph',    address:'222 Bonifacio St., Tagaytay',       phone:'09781234567', gender:'Male',   birthday:'2003-09-15' },
    { id:'s8',  classId:'c2', studentId:'2022-0008', name:'Hernandez, Sofia Bianca',  email:'sb.hernandez@uphsd.edu.ph', address:'333 Rizal Ave., Trece Martires',    phone:'09891234567', gender:'Female', birthday:'2002-12-05' },
    { id:'s9',  classId:'c3', studentId:'2022-0009', name:'Ignacio, Rafael Louis',    email:'rl.ignacio@uphsd.edu.ph',   address:'444 Luna St., Cavite City',         phone:'09101234567', gender:'Male',   birthday:'2001-06-18' },
    { id:'s10', classId:'c3', studentId:'2022-0010', name:'Javellana, Camille Faith', email:'cf.javellana@uphsd.edu.ph', address:'555 Burgos St., Naic, Cavite',      phone:'09201234567', gender:'Female', birthday:'2001-11-29' },
    { id:'s11', classId:'c3', studentId:'2022-0011', name:'Katigbak, Aldrin Russ',    email:'ar.katigbak@uphsd.edu.ph',  address:'666 Mabini St., Alfonso, Cavite',   phone:'09301234567', gender:'Male',   birthday:'2001-04-03' },
    { id:'s12', classId:'c3', studentId:'2022-0012', name:'Lim, Diana Marie',         email:'dm.lim@uphsd.edu.ph',       address:'777 Rizal Blvd., Maragondon',       phone:'09401234567', gender:'Female', birthday:'2001-07-14' }
  ],
  quizzes: [
    { id:'q1', classId:'c1', title:'Quiz 1 - Arrays & Linked Lists', totalScore:50, date:'2024-08-15' },
    { id:'q2', classId:'c1', title:'Quiz 2 - Stacks & Queues',       totalScore:50, date:'2024-09-05' },
    { id:'q3', classId:'c1', title:'Quiz 3 - Trees & Graphs',        totalScore:50, date:'2024-09-26' },
    { id:'q4', classId:'c2', title:'Quiz 1 - Arrays & Linked Lists', totalScore:50, date:'2024-08-16' },
    { id:'q5', classId:'c3', title:'Quiz 1 - HTML/CSS Basics',       totalScore:50, date:'2024-08-14' },
    { id:'q6', classId:'c3', title:'Quiz 2 - JavaScript Essentials', totalScore:50, date:'2024-09-10' }
  ],
  assignments: [
    { id:'a1', classId:'c1', title:'Lab 1 - Linked List Implementation', totalScore:100, dueDate:'2024-08-22', type:'Lab'      },
    { id:'a2', classId:'c1', title:'Lab 2 - Stack Calculator',           totalScore:100, dueDate:'2024-09-12', type:'Lab'      },
    { id:'a3', classId:'c1', title:'Project - DSA Final Output',         totalScore:100, dueDate:'2024-10-31', type:'Project'  },
    { id:'a4', classId:'c2', title:'Lab 1 - Array Manipulation',         totalScore:100, dueDate:'2024-08-23', type:'Lab'      },
    { id:'a5', classId:'c3', title:'Activity 1 - Portfolio Website',     totalScore:100, dueDate:'2024-08-30', type:'Activity' },
    { id:'a6', classId:'c3', title:'Activity 2 - JavaScript App',        totalScore:100, dueDate:'2024-09-20', type:'Activity' }
  ],
  exams: [
    { id:'e1', classId:'c1', title:'Midterm Examination', totalScore:100, date:'2024-09-28', type:'Midterm' },
    { id:'e2', classId:'c1', title:'Final Examination',   totalScore:100, date:'2024-11-23', type:'Final'   },
    { id:'e3', classId:'c2', title:'Midterm Examination', totalScore:100, date:'2024-09-28', type:'Midterm' },
    { id:'e4', classId:'c3', title:'Midterm Examination', totalScore:100, date:'2024-09-27', type:'Midterm' }
  ],
  scores: {
    's1_q1':45,'s1_q2':42,'s1_q3':47, 's2_q1':48,'s2_q2':46,'s2_q3':44,
    's3_q1':38,'s3_q2':35,'s3_q3':40, 's4_q1':50,'s4_q2':49,'s4_q3':48,
    's5_q1':30,'s5_q2':28,'s5_q3':32,
    's1_a1':88,'s1_a2':92,'s1_a3':85, 's2_a1':95,'s2_a2':90,'s2_a3':92,
    's3_a1':72,'s3_a2':68,'s3_a3':70, 's4_a1':98,'s4_a2':96,'s4_a3':100,
    's5_a1':55,'s5_a2':60,'s5_a3':50,
    's1_e1':78,'s1_e2':82, 's2_e1':88,'s2_e2':90,
    's3_e1':65,'s3_e2':60, 's4_e1':95,'s4_e2':98,
    's5_e1':48,'s5_e2':45,
    's6_q4':46,'s7_q4':42,'s8_q4':49,
    's6_a4':90,'s7_a4':82,'s8_a4':95,
    's6_e3':85,'s7_e3':78,'s8_e3':92,
    's9_q5':44,'s9_q6':47,'s10_q5':49,'s10_q6':48,'s11_q5':38,'s11_q6':42,'s12_q5':50,'s12_q6':49,
    's9_a5':88,'s9_a6':85,'s10_a5':95,'s10_a6':92,'s11_a5':70,'s11_a6':75,'s12_a5':98,'s12_a6':96,
    's9_e4':82,'s10_e4':90,'s11_e4':68,'s12_e4':95
  },
  sessions: [
    { id:'ss1', classId:'c1', date:'2024-08-12', topic:'Introduction to DSA'   },
    { id:'ss2', classId:'c1', date:'2024-08-14', topic:'Arrays and Complexity' },
    { id:'ss3', classId:'c1', date:'2024-08-16', topic:'Linked Lists'          },
    { id:'ss4', classId:'c2', date:'2024-08-12', topic:'Introduction to DSA'   },
    { id:'ss5', classId:'c3', date:'2024-08-13', topic:'HTML/CSS Fundamentals' },
    { id:'ss6', classId:'c3', date:'2024-08-15', topic:'CSS Layouts & Flexbox' }
  ],
  attendance: {
    's1_ss1':'present','s1_ss2':'present','s1_ss3':'late',
    's2_ss1':'present','s2_ss2':'present','s2_ss3':'present',
    's3_ss1':'absent', 's3_ss2':'present','s3_ss3':'present',
    's4_ss1':'present','s4_ss2':'present','s4_ss3':'present',
    's5_ss1':'present','s5_ss2':'absent', 's5_ss3':'absent',
    's6_ss4':'present','s7_ss4':'present','s8_ss4':'late',
    's9_ss5':'present','s9_ss6':'present',
    's10_ss5':'present','s10_ss6':'present',
    's11_ss5':'late','s11_ss6':'absent',
    's12_ss5':'present','s12_ss6':'present'
  },
  activityLog: [
    { text:'Grades updated for BSCS 2A',       time:'2 hours ago' },
    { text:'New student added to BSIT 3A',      time:'Yesterday'   },
    { text:'Attendance recorded for BSCS 2B',   time:'2 days ago'  },
    { text:'Quiz 3 scores entered for BSCS 2A', time:'3 days ago'  }
  ]
};

const DB = {
  _d: null,
  load() {
    try { const r=localStorage.getItem(DB_KEY); this._d=r?JSON.parse(r):JSON.parse(JSON.stringify(SEED)); }
    catch(e) { this._d=JSON.parse(JSON.stringify(SEED)); }
    return this;
  },
  save() { localStorage.setItem(DB_KEY,JSON.stringify(this._d)); },
  reset() { this._d=JSON.parse(JSON.stringify(SEED)); this.save(); },
  getUser(u,p) { return this._d.users.find(x=>x.username===u&&x.password===p)||null; },
  getClasses(role,uid) { return role==='admin'?[...this._d.classes]:this._d.classes.filter(c=>c.teacherId===uid); },
  getClass(id) { return this._d.classes.find(c=>c.id===id)||null; },
  addClass(c)  { c.id='c'+Date.now(); this._d.classes.push(c); this.save(); return c; },
  updateClass(id,d) { const i=this._d.classes.findIndex(c=>c.id===id); if(i>=0){Object.assign(this._d.classes[i],d);this.save();} },
  deleteClass(id) { this._d.classes=this._d.classes.filter(c=>c.id!==id); this._d.students=this._d.students.filter(s=>s.classId!==id); this.save(); },
  getStudents(cid) { const l=cid?this._d.students.filter(s=>s.classId===cid):[...this._d.students]; return l.sort((a,b)=>a.name.localeCompare(b.name)); },
  getStudent(id) { return this._d.students.find(s=>s.id===id)||null; },
  addStudent(s) { s.id='s'+Date.now(); this._d.students.push(s); this.logActivity('Student added: '+s.name); this.save(); return s; },
  updateStudent(id,d) { const i=this._d.students.findIndex(s=>s.id===id); if(i>=0){Object.assign(this._d.students[i],d);this.save();} },
  deleteStudent(id) { this._d.students=this._d.students.filter(s=>s.id!==id); this.save(); },
  getQuizzes(cid) { return this._d.quizzes.filter(q=>q.classId===cid); },
  addQuiz(q) { q.id='q'+Date.now(); this._d.quizzes.push(q); this.save(); return q; },
  updateQuiz(id,d) { const i=this._d.quizzes.findIndex(q=>q.id===id); if(i>=0){Object.assign(this._d.quizzes[i],d);this.save();} },
  deleteQuiz(id) { this._d.quizzes=this._d.quizzes.filter(q=>q.id!==id); this.save(); },
  getAssignments(cid) { return this._d.assignments.filter(a=>a.classId===cid); },
  addAssignment(a) { a.id='a'+Date.now(); this._d.assignments.push(a); this.save(); return a; },
  updateAssignment(id,d) { const i=this._d.assignments.findIndex(a=>a.id===id); if(i>=0){Object.assign(this._d.assignments[i],d);this.save();} },
  deleteAssignment(id) { this._d.assignments=this._d.assignments.filter(a=>a.id!==id); this.save(); },
  getExams(cid) { return this._d.exams.filter(e=>e.classId===cid); },
  addExam(e) { e.id='e'+Date.now(); this._d.exams.push(e); this.save(); return e; },
  updateExam(id,d) { const i=this._d.exams.findIndex(e=>e.id===id); if(i>=0){Object.assign(this._d.exams[i],d);this.save();} },
  deleteExam(id) { this._d.exams=this._d.exams.filter(e=>e.id!==id); this.save(); },
  getScore(sid,iid) { const v=this._d.scores[sid+'_'+iid]; return v!==undefined?v:''; },
  setScore(sid,iid,sc) { this._d.scores[sid+'_'+iid]=sc===''?'':parseFloat(sc); this.save(); },
  getSessions(cid) { return this._d.sessions.filter(s=>s.classId===cid).sort((a,b)=>b.date.localeCompare(a.date)); },
  addSession(s) { s.id='ss'+Date.now(); this._d.sessions.push(s); this.logActivity('Session recorded'); this.save(); return s; },
  deleteSession(id) { this._d.sessions=this._d.sessions.filter(s=>s.id!==id); this.save(); },
  getAttendance(sid,ssid) { return this._d.attendance[sid+'_'+ssid]||'present'; },
  setAttendance(sid,ssid,st) { this._d.attendance[sid+'_'+ssid]=st; this.save(); },
  computeGrade(sid,cid) {
    const quizzes=this.getQuizzes(cid), assignments=this.getAssignments(cid), exams=this.getExams(cid);
    const pct=(items)=>{
      if(!items.length) return null;
      let tot=0,pos=0;
      items.forEach(it=>{ const s=this.getScore(sid,it.id); if(s!==''){tot+=parseFloat(s);pos+=it.totalScore;} });
      return pos?(tot/pos)*100:null;
    };
    const qA=pct(quizzes), aA=pct(assignments), eA=pct(exams);
    const parts=[];
    if(qA!==null) parts.push({val:qA,w:0.20});
    if(aA!==null) parts.push({val:aA,w:0.30});
    if(eA!==null) parts.push({val:eA,w:0.50});
    if(!parts.length) return {quiz:'N/A',assignment:'N/A',exam:'N/A',final:'N/A',status:'N/A'};
    const tw=parts.reduce((s,p)=>s+p.w,0);
    const final=parts.reduce((s,p)=>s+p.val*(p.w/tw),0);
    return {
      quiz:      qA!==null?qA.toFixed(1):'N/A',
      assignment:aA!==null?aA.toFixed(1):'N/A',
      exam:      eA!==null?eA.toFixed(1):'N/A',
      final:     final.toFixed(1),
      status:    final>=75?'PASS':'FAIL'
    };
  },
  attendanceSummary(sid,cid) {
    const sessions=this.getSessions(cid);
    let p=0,a=0,l=0;
    sessions.forEach(s=>{ const v=this.getAttendance(sid,s.id); if(v==='present')p++; else if(v==='absent')a++; else if(v==='late')l++; });
    return {present:p,absent:a,late:l,total:sessions.length};
  },
  logActivity(t) { this._d.activityLog.unshift({text:t,time:'Just now'}); if(this._d.activityLog.length>20)this._d.activityLog.pop(); },
  getActivityLog() { return this._d.activityLog.slice(0,8); }
};

DB.load();
