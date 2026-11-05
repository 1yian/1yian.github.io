// Language toggle, filters, dialogs, and lead capture. No dependencies.
(function () {
  var doc = document.documentElement;
  var cfg = window.YANG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // ---- language ----
  function applyLang(l) {
    doc.dataset.lang = l;
    doc.lang = l === "en" ? "en" : "zh-Hans";
    document.title = l === "en" ? doc.dataset.titleEn : doc.dataset.titleZh;
    $$("option[data-zh]").forEach(function (o) { o.textContent = o.dataset[l]; });
    $$("[data-ph-zh]").forEach(function (i) { i.placeholder = i.dataset["ph" + (l === "en" ? "En" : "Zh")]; });
    try { localStorage.setItem("yang_lang", l); } catch (e) {}
  }
  $$("[data-lang-toggle]").forEach(function (b) {
    b.addEventListener("click", function () { applyLang(doc.dataset.lang === "en" ? "zh" : "en"); });
  });
  applyLang(doc.dataset.lang === "en" ? "en" : "zh");
  $$("[data-year]").forEach(function (e) { e.textContent = new Date().getFullYear(); });

  // ---- source tracking (first touch kept, latest UTM wins if present) ----
  var KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"];
  function readStore() { try { return JSON.parse(localStorage.getItem("yang_src") || "null"); } catch (e) { return null; } }
  function initSource() {
    var q = new URLSearchParams(location.search), found = {}, any = false;
    KEYS.forEach(function (k) { if (q.get(k)) { found[k] = q.get(k); any = true; } });
    var stored = readStore();
    if (!stored || any) {
      stored = { utm: found, referrer: document.referrer || "", landing_page: location.pathname + location.search, first_seen: new Date().toISOString() };
      try { localStorage.setItem("yang_src", JSON.stringify(stored)); } catch (e) {}
    }
    return stored;
  }
  var source = initSource();

  // ---- dialogs ----
  var lastButton = "";
  var leadDlg = $("#lead-dialog"), wxDlg = $("#wechat-dialog");
  function openDlg(d) { if (d.showModal) d.showModal(); else d.setAttribute("open", ""); }
  function openLead(kind, carId, title) {
    var f = $("form.lead", leadDlg);
    f.reset();
    resetStatus(f);
    f.dataset.form = kind;
    f.elements.form_type.value = kind;
    f.elements.car.value = carId || "";
    $$("[data-dlg-title]", leadDlg).forEach(function (e) { e.hidden = e.dataset.dlgTitle !== (title || kind); });
    $$("[data-only]", leadDlg).forEach(function (e) { e.hidden = e.dataset.only !== kind; });
    var cn = $("[data-dlg-car]", leadDlg);
    cn.textContent = carId && cfg.cars && cfg.cars[carId] ? cfg.cars[carId] : "";
    cn.hidden = !cn.textContent;
    openDlg(leadDlg);
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-button],[data-open]");
    if (b && b.dataset.button) lastButton = b.dataset.button;
    var o = e.target.closest("[data-open]");
    if (o) {
      var k = o.dataset.open;
      if (k === "wechat") openDlg(wxDlg);
      else openLead(k, o.dataset.car || cfg.car || "", o.dataset.title);
    }
    var c = e.target.closest("[data-copy]");
    if (c && navigator.clipboard) navigator.clipboard.writeText(c.dataset.copy);
    if (e.target.tagName === "DIALOG") e.target.close();
  });

  // ---- filters ----
  var chips = $$("[data-filter]");
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      chips.forEach(function (x) { x.classList.toggle("on", x === c); });
      var f = c.dataset.filter, shown = 0;
      $$("[data-grid] .car").forEach(function (card) {
        var ok = f === "all" || card.dataset.tags.split(" ").indexOf(f) > -1;
        card.hidden = !ok;
        if (ok) shown++;
      });
      $(".empty").hidden = shown > 0;
    });
  });

  // ---- lead capture ----
  // JSON is sent as text/plain so the POST is a CORS "simple request" (no preflight), which
  // Google Apps Script, Cloudflare Workers and most webhook receivers accept as is.
  function resetStatus(form) {
    var s = $(".status", form);
    if (s) { s.hidden = true; s.removeAttribute("data-state"); }
  }
  function setStatus(form, state) {
    var s = $(".status", form);
    if (!s) return;
    s.dataset.state = state;
    s.hidden = false;
  }
  $$("form.lead").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (form.elements.company && form.elements.company.value) { setStatus(form, "ok"); return; } // honeypot
      var fields = {};
      Array.prototype.forEach.call(form.elements, function (el) {
        if (el.name && el.name !== "company" && el.value !== "" && el.type !== "submit") fields[el.name] = el.value;
      });
      var payload = {
        form_type: fields.form_type || form.dataset.form,
        fields: fields,
        car: fields.car || null,
        car_label: fields.car && cfg.cars ? cfg.cars[fields.car] || null : null,
        source: {
          utm: source.utm || {},
          referrer: source.referrer || "",
          landing_page: source.landing_page || "",
          first_seen: source.first_seen || "",
          page: location.pathname + location.search,
          button: form.closest("dialog") ? (lastButton || "dialog") : "form:" + (fields.form_type || form.dataset.form),
          language: doc.dataset.lang,
          submitted_at: new Date().toISOString()
        }
      };
      if (!cfg.endpoint) { setStatus(form, "preview"); return; } // preview mode: send nothing
      var btn = $("button[type=submit]", form);
      btn.disabled = true;
      fetch(cfg.endpoint, { method: "POST", headers: { "Content-Type": "text/plain;charset=UTF-8" }, body: JSON.stringify(payload) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); setStatus(form, "ok"); form.reset(); })
        .catch(function () { setStatus(form, "err"); })
        .then(function () { btn.disabled = false; });
    });
    form.addEventListener("input", function () { resetStatus(form); });
  });
})();
