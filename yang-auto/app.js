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
      if (k === "wechat") openWechat("", false);
      else openLead(k, o.dataset.car || cfg.car || "", o.dataset.title);
    }
    var c = e.target.closest("[data-copy]");
    if (c) copyText(c.dataset.copy, c).then(function (ok) { if (ok) flashCopied(c); });
    if (e.target.tagName === "DIALOG") e.target.close();
  });

  // ---- WeChat: show how to add the store, with the shopper's message when there is one ----
  function openWechat(note, copied) {
    wxDlg.dataset.mode = note ? "note" : "plain";
    $("[data-wx-ok]", wxDlg).hidden = !copied;
    $("[data-wx-note-text]", wxDlg).textContent = note;
    var noteBtn = $(".wx-note [data-copy]", wxDlg);
    noteBtn.dataset.copy = note;
    $$("[data-copy]", wxDlg).forEach(function (b) { b.classList.remove("done"); });
    if (copied) noteBtn.classList.add("done");
    openDlg(wxDlg);
  }

  // ---- clipboard (the async API needs https; the textarea fallback covers plain http previews) ----
  function copyText(text, from) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacyCopy(text, from); });
    }
    return Promise.resolve(legacyCopy(text, from));
  }
  function legacyCopy(text, from) {
    // Inside an open modal dialog the rest of the page is inert, so the textarea goes in the dialog.
    var host = (from && from.closest("dialog")) || document.body;
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;font-size:16px";
    host.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) {}
    host.removeChild(ta);
    return ok;
  }
  function flashCopied(b) {
    // The clipboard holds one thing, so only the latest copy shows as copied.
    var dlg = b.closest("dialog");
    if (dlg) {
      $$("[data-copy]", dlg).forEach(function (x) { x.classList.remove("done"); });
      var ok = $("[data-wx-ok]", dlg);
      if (ok) ok.hidden = true;
    }
    b.classList.add("done");
    clearTimeout(b._t);
    b._t = setTimeout(function () { b.classList.remove("done"); }, 2000);
  }

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
  function leadPayload(fields, button) {
    return {
      form_type: fields.form_type,
      fields: fields,
      car: fields.car || null,
      car_label: fields.car && cfg.cars ? cfg.cars[fields.car] || null : null,
      source: {
        utm: source.utm || {},
        referrer: source.referrer || "",
        landing_page: source.landing_page || "",
        first_seen: source.first_seen || "",
        page: location.pathname + location.search,
        button: button,
        language: doc.dataset.lang,
        submitted_at: new Date().toISOString()
      }
    };
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
      fields.form_type = fields.form_type || form.dataset.form;
      var payload = leadPayload(fields, form.closest("dialog") ? (lastButton || "dialog") : "form:" + fields.form_type);
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

  // ---- find my car: one tap to WeChat, text or call, with budget and type in the message ----
  var reach = $("[data-reach-form]");
  if (reach) {
    var said = function (sel) {
      var o = sel.options[sel.selectedIndex];
      return o && o.value ? o.dataset[doc.dataset.lang === "en" ? "sayEn" : "sayZh"] : "";
    };
    var reachMessage = function () {
      var parts = [said(reach.elements.budget), said(reach.elements.body_type)].filter(Boolean);
      if (doc.dataset.lang === "en") {
        if (!parts.length) return "Hi, I'm looking to buy a used car. What do you have in stock right now?";
        var s = parts.join(", and ");
        return "Hi, I'm looking to buy a used car. " + s.charAt(0).toUpperCase() + s.slice(1) + ". Do you have anything that fits?";
      }
      if (!parts.length) return "您好，我想买辆二手车，请问现在有哪些车在售？";
      return "您好，我想买辆二手车，" + parts.join("，") + "。有合适的车吗？";
    };
    var sms = $("[data-reach=sms]", reach);
    var smsTo = sms.getAttribute("href");
    // "?&body=" is the form both iOS Messages and Android messaging apps read.
    var updateReach = function () { sms.setAttribute("href", smsTo + "?&body=" + encodeURIComponent(reachMessage())); };
    reach.addEventListener("change", updateReach);
    $$("[data-lang-toggle]").forEach(function (b) { b.addEventListener("click", updateReach); });
    updateReach();
    reach.addEventListener("submit", function (e) { e.preventDefault(); });
    reach.addEventListener("click", function (e) {
      var a = e.target.closest("[data-reach]");
      if (!a) return;
      var msg = reachMessage();
      if (a.dataset.reach === "wechat") copyText(msg).then(function (ok) { openWechat(msg, ok); });
      // With a lead endpoint set, each tap is also logged with its source; without one nothing is sent.
      if (cfg.endpoint && navigator.sendBeacon) {
        var fields = { form_type: "find_car", action: a.dataset.reach, message: msg };
        if (reach.elements.budget.value) fields.budget = reach.elements.budget.value;
        if (reach.elements.body_type.value) fields.body_type = reach.elements.body_type.value;
        navigator.sendBeacon(cfg.endpoint, JSON.stringify(leadPayload(fields, a.dataset.button)));
      }
    });
  }
})();
