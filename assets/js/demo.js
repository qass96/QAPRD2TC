/* demo.js — 상단 사용 예시 자동 데모
   가짜 마우스 커서가 예시 칩 → 변환 버튼을 천천히 클릭하고
   TC 행이 하나씩 쫙 나타나는 흐름을 반복 재생한다. (의존성 없음) */
(function () {
  var stage = document.getElementById("demo-stage");
  if (!stage) return;
  var win = document.getElementById("demo-window");
  var cursor = document.getElementById("demo-cursor");
  var chip = document.querySelector("[data-demo-chip]");
  var genBtn = document.getElementById("demo-generate");
  var ta = document.getElementById("demo-textarea");
  var tbody = document.getElementById("demo-tbody");
  if (!(win && cursor && chip && genBtn && ta && tbody)) return;

  var lines = [
    "## 로그인",
    "- 이메일과 비밀번호로 로그인할 수 있어야 한다. (필수)",
    "- 비밀번호 5회 오류 시 계정을 잠근다."
  ];
  // [TC ID, 시나리오, 유형, 우선순위]
  var rows = [
    ["TC1", "유효한 이메일·비밀번호로 로그인", "정상", "High"],
    ["TC2", "비밀번호 형식 오류 입력", "예외", "Mid"],
    ["TC3", "비밀번호 5회 연속 오류 → 계정 잠금", "경계", "High"],
    ["TC4", "미가입 이메일로 로그인 시도", "예외", "Mid"],
    ["TC5", "이메일 미입력 상태로 변환 실행", "예외", "Low"]
  ];
  var typeCls = { "정상": "dc-n", "예외": "dc-e", "경계": "dc-b" };
  var priCls = { "High": "dc-ph", "Mid": "dc-pm", "Low": "dc-pl" };

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function cellsHtml(r) {
    return '<td class="dc-id">' + r[0] + "</td>" +
      "<td>" + esc(r[1]) + "</td>" +
      '<td><span class="dc-tag ' + typeCls[r[2]] + '">' + r[2] + "</span></td>" +
      '<td class="dc-pri ' + priCls[r[3]] + '">' + r[3] + "</td>";
  }

  var timers = [];
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function at(ms, fn) { timers.push(setTimeout(fn, ms)); }

  function moveCursorTo(el) {
    var s = stage.getBoundingClientRect();
    var r = el.getBoundingClientRect();
    var x = r.left - s.left + r.width / 2;
    var y = r.top - s.top + r.height / 2;
    cursor.style.transform = "translate(" + x + "px," + y + "px)";
  }
  function clickPulse(el, press) {
    cursor.classList.remove("clicking");
    void cursor.offsetWidth; // 재생 리셋
    cursor.classList.add("clicking");
    if (press !== false) el.classList.add("demo-press");
    at(300, function () { cursor.classList.remove("clicking"); });
    at(340, function () { if (press !== false) el.classList.remove("demo-press"); });
  }

  function reset() {
    ta.innerHTML = "";
    tbody.innerHTML = "";
    chip.classList.remove("demo-active");
    var s = stage.getBoundingClientRect();
    cursor.style.transition = "none";
    cursor.style.transform = "translate(" + (s.width * 0.14) + "px," + (s.height * 0.92) + "px)";
    void cursor.offsetWidth;
    cursor.style.transition = "";
  }

  function addLine(text) {
    var span = document.createElement("span");
    span.textContent = text;
    ta.appendChild(span);
    void span.offsetWidth;
    span.classList.add("show");
  }
  function addRow(r) {
    var tr = document.createElement("tr");
    tr.className = "demo-row";
    tr.innerHTML = cellsHtml(r);
    tbody.appendChild(tr);
    void tr.offsetWidth;
    tr.classList.add("show");
  }

  function cycle() {
    clearTimers();
    reset();
    // 실제 동작대로: 예시 버튼 클릭 → 입력칸이 채워짐 → 변환
    at(700, function () { moveCursorTo(chip); });
    at(1650, function () { clickPulse(chip); chip.classList.add("demo-active"); });
    lines.forEach(function (l, i) { at(1900 + i * 360, function () { addLine(l); }); });
    at(3200, function () { moveCursorTo(genBtn); });
    at(4150, function () { clickPulse(genBtn); });
    rows.forEach(function (r, i) { at(4500 + i * 340, function () { addRow(r); }); });
    at(4500 + rows.length * 340 + 2800, cycle); // 잠깐 멈췄다가 다시 반복
  }

  function showFinalStatic() {
    ta.innerHTML = "";
    lines.forEach(function (l) {
      var span = document.createElement("span");
      span.textContent = l;
      span.classList.add("show");
      ta.appendChild(span);
    });
    chip.classList.add("demo-active");
    tbody.innerHTML = rows.map(function (r) {
      return '<tr class="demo-row show">' + cellsHtml(r) + "</tr>";
    }).join("");
    cursor.style.display = "none";
  }

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || typeof IntersectionObserver === "undefined") {
    showFinalStatic();
    return;
  }

  // 화면에 보일 때만 재생(성능 절약 + 스크롤로 들어오면 처음부터)
  var running = false;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && !running) { running = true; cycle(); }
      else if (!e.isIntersecting && running) { running = false; clearTimers(); }
    });
  }, { threshold: 0.25 });
  io.observe(win);
})();
