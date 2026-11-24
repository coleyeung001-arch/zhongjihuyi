// 中几互译 下载页（2026-11-23 改版）。没有这段脚本时页面照样能看、能下载；它只做这些：
// 按手机认出安卓还是 iPhone（底部下载条、下载卡里先给哪个），微信里拦下安装包提示用浏览器打开，
// 安卓点了下载以后说一下怎么装，查 App Store 上架了没有，顶栏滚到浅色区换成白的，常见问题一次只开一个。
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const ua = navigator.userAgent || '';
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  // 微信、QQ、微博、钉钉里的网页不让直接下安装包
  const inApp = /MicroMessenger|\bQQ\/|Weibo|DingTalk/i.test(ua);
  const lock = (on) => { document.documentElement.style.overflow = on ? 'hidden' : ''; };

  const androidLink = $('#getAndroid');
  const iosLink = $('#getIos');
  const dockBtn = $('#dockBtn');
  const dockMeta = $('#dockMeta');

  /* ---------- 按手机换：底部下载条、下载卡里先给哪个 ---------- */
  if (isAndroid) {
    dockBtn.href = androidLink.href;
    dockBtn.textContent = '下载';
    // 大小跟着下载按钮的 data-size 走（发版工具只改那一处）
    dockMeta.textContent = inApp ? '微信里要先点右上角「···」，选「在浏览器打开」' : '免费 · 安卓完整版 ' + androidLink.dataset.size + '，建议连 Wi‑Fi 下载';
    $('.pick__opt--android').classList.add('is-mine');
    // 第 2 条：「下载 → 允许安装 → 继续安装 → 打开」只对安卓手机说
    $('.flow').classList.add('is-on');
  } else if (isIOS) {
    dockBtn.href = iosLink.href;
    dockBtn.textContent = '下载';
    dockMeta.textContent = '免费 · App Store · iOS 18 以上';
    $('.pick__opt--ios').classList.add('is-mine');
    // iPhone 上 App Store 放前面、用主按钮的样子
    iosLink.parentNode.insertBefore(iosLink, androidLink);
    iosLink.classList.replace('btn--glass', 'btn--grad');
    androidLink.classList.replace('btn--grad', 'btn--glass');
    $('.assure').hidden = true;
    $('#androidFine').hidden = true;
  }

  /* ---------- 安卓版还没公开（<html data-android-soon>）：安卓下载按钮写「即将开放」、不能点 ---------- */
  // 检查脚本测正常下载时设 window.__gtAndroidLive = true
  if (document.documentElement.hasAttribute('data-android-soon') && !window.__gtAndroidLive) {
    $$('a[href$=".apk"]').forEach((a) => { a.removeAttribute('href'); a.setAttribute('aria-disabled', 'true'); });
    androidLink.textContent = '安卓版即将开放';
    androidLink.classList.replace('btn--grad', 'btn--glass');
    $('#androidFine').hidden = true;
    $('.flow').classList.remove('is-on');
    if (!isIOS) $('#androidSoon').hidden = false;
    if (isAndroid) {
      dockBtn.href = '#contact';
      dockBtn.textContent = '联系作者';
      dockMeta.textContent = '安卓版马上开放，有问题先加作者微信';
    }
  }

  /* ---------- iPhone 测试版（TestFlight）：iPhone 上默认展开、测试链接用主按钮 ---------- */
  const beta = $('#getBeta');
  if (isIOS && beta) {
    $('#beta').open = true;
    beta.classList.replace('btn--glass', 'btn--grad');
  }

  /* ---------- 底部下载条：滚过下载卡以后才浮出来 ---------- */
  const dock = $('#dock');
  const card = $('#download');
  if ('IntersectionObserver' in window && dock && card) {
    dock.classList.add('dock--away');
    new IntersectionObserver(([e]) => {
      // 下载卡在屏幕里，或者还在下面（没滚到）：不出来；已经滚到上面去了：出来
      dock.classList.toggle('dock--away', e.isIntersecting || e.boundingClientRect.top > 0);
    }).observe(card);
  }

  /* ---------- 顶栏：首屏看不见了就换成白的 ---------- */
  const nav = $('.nav');
  const hero = $('.hero');
  if ('IntersectionObserver' in window && nav && hero) {
    new IntersectionObserver(([e]) => nav.classList.toggle('nav--light', !e.isIntersecting), { rootMargin: '-56px 0px 0px 0px' }).observe(hero);
  }

  /* ---------- 往下滚时出场、数字从 0 数上去（照参考页；系统关了动效就全都直接显示） ---------- */
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = $$('[data-reveal]');
  // 一组里的卡片一张接一张出来
  $$('[data-reveal="group"]').forEach((g) => Array.from(g.children).forEach((c, i) => c.style.setProperty('--i', String(Math.min(i, 8)))));
  const counters = $$('[data-count]');
  function countUp(el) {
    const to = parseInt(el.dataset.target || el.textContent, 10);
    if (!to) return;
    const t0 = performance.now(), dur = 1100;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      el.textContent = String(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function show(el) {
    if (el.classList.contains('is-in')) return;
    el.classList.add('is-in');
    if (!still) $$('[data-count]', el).forEach(countUp);
  }
  if (still || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-in'));
  } else {
    // 数字先记下终点、从 0 开始；没出场以前看不见，不会闪一下
    counters.forEach((c) => { c.dataset.target = c.textContent; c.textContent = '0'; });
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
    // 保险：观察器没触发时，屏幕里的东西也别一直藏着；跳到页面中间（点了目录、#faq）也一样
    const sweep = () => reveals.forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) show(el); });
    window.addEventListener('load', () => setTimeout(sweep, 1800));
    window.addEventListener('hashchange', () => setTimeout(sweep, 400));
  }

  /* ---------- 常见问题一次只开一个（不认 details name 的浏览器也一样） ---------- */
  $$('.qa').forEach((d) => d.addEventListener('toggle', () => {
    if (d.open) $$('.qa').forEach((o) => { if (o !== d && o.open) o.open = false; });
  }));

  /* ---------- 弹出的小面板 ---------- */
  let lastFocus = null;
  const focusables = (root) => $$('a[href], button:not([disabled])', root).filter((el) => !el.closest('[hidden]'));
  function openLayer(el, from) {
    lastFocus = from || document.activeElement;
    el.hidden = false;
    lock(true);
    const f = focusables(el)[0];
    if (f) f.focus({ preventScroll: true });
  }
  function closeLayer(el) {
    el.hidden = true;
    lock(false);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  $$('.sheet').forEach((s) => s.addEventListener('click', (e) => {
    if (e.target === s || e.target.closest('[data-close]')) closeLayer(s);
  }));
  document.addEventListener('keydown', (e) => {
    const open = $$('.sheet').find((el) => !el.hidden);
    if (!open) return;
    if (e.key === 'Escape') { e.preventDefault(); closeLayer(open); return; }
    if (e.key === 'Tab') { // 焦点只在打开的这一层里转
      const list = focusables(open);
      if (!list.length) return;
      const first = list[0], last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  $('#install .steps').innerHTML = $('#steps').innerHTML;

  // 点了安卓安装包：微信里先教怎么用浏览器打开；安卓手机上开始下载后说一下怎么装
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href$=".apk"]');
    if (!a) return;
    if (inApp) { e.preventDefault(); openLayer($('#wechat'), a); return; }
    if (isAndroid) setTimeout(() => openLayer($('#install'), a), 700);
  });
  $('#copyUrl').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const url = location.href.split('#')[0] + '#download';
    let ok = false;
    try { await navigator.clipboard.writeText(url); ok = true; } catch (_) {
      const t = document.createElement('textarea');
      t.value = url; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.append(t); t.select();
      try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
      t.remove();
    }
    btn.textContent = ok ? '已复制，到浏览器里粘贴打开' : '复制不了，请点右上角「···」';
  });

  /* ---------- 联系作者：复制微信号、抖音号 ---------- */
  $$('[data-copy]').forEach((btn) => {
    const label = btn.textContent;
    let timer = 0;
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      let ok = false;
      try { await navigator.clipboard.writeText(text); ok = true; } catch (_) {
        const t = document.createElement('textarea');
        t.value = text; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
        document.body.append(t); t.select();
        try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
        t.parentNode.removeChild(t);
      }
      btn.textContent = ok ? btn.dataset.done : '复制不了，请长按上面的字复制';
      clearTimeout(timer);
      timer = setTimeout(() => { btn.textContent = label; }, 2600);
    });
  });

  /* ---------- App Store 上架了没有：没上架时按钮写「即将上架」，上架后自动能点 ---------- */
  // 页面加载完再查，网慢时不拖住页面
  const afterLoad = (fn) => (document.readyState === 'complete'
    ? setTimeout(fn, 300)
    : window.addEventListener('load', () => setTimeout(fn, 300), { once: true }));
  afterLoad(function checkStore() {
    const links = $$('a[href*="apps.apple.com"]');
    if (!links.length) return;
    const cb = '__gtStore' + Date.now();
    const s = document.createElement('script');
    let done = false;
    const finish = (live) => {
      if (done) return;
      done = true;
      try { delete window[cb]; } catch (_) { window[cb] = undefined; }
      s.remove();
      if (live !== false) return; // 上架了，或者查不到（网不通）：按钮照旧
      links.forEach((a) => {
        a.setAttribute('aria-disabled', 'true');
        a.removeAttribute('href');
        a.textContent = a === dockBtn ? '即将上架' : 'App Store 即将上架';
      });
      $('#iosSoon').hidden = false;
      $('#iosNote').hidden = true;
      // iPhone 上：App Store 还没上架时，底部按钮带去「先装测试版」那一块（TestFlight）
      if (isIOS && $('#beta')) {
        dockBtn.removeAttribute('aria-disabled');
        dockBtn.href = '#beta';
        dockBtn.textContent = '装测试版';
        dockMeta.textContent = '正式版还在上架，先装测试版';
        dockBtn.addEventListener('click', () => { $('#beta').open = true; });
      } else if (isIOS) dockMeta.textContent = 'iPhone 版正在上架 App Store';
    };
    window[cb] = (data) => finish(!!(data && data.resultCount > 0));
    s.onerror = () => finish(null);
    setTimeout(() => finish(null), 8000);
    s.src = 'https://itunes.apple.com/lookup?id=6834806101&country=us&callback=' + cb;
    document.head.append(s);
  });
})();
