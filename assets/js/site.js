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
  const inAppName = /MicroMessenger/i.test(ua) ? '微信' : /\bQQ\//i.test(ua) ? 'QQ' : /Weibo/i.test(ua) ? '微博' : /DingTalk/i.test(ua) ? '钉钉' : '';
  // 右上角「···」菜单里那一项：iPhone 的微信写「在 Safari 中打开」，安卓写「在浏览器打开」
  const openIn = isIOS ? '在 Safari 中打开' : '在浏览器打开';
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
    dockMeta.textContent = inApp ? inAppName + '里要先点右上角「···」，选「' + openIn + '」' : '免费 · 安卓完整版 ' + androidLink.dataset.size + '，建议连 Wi‑Fi 下载';
    $('.pick__opt--android').classList.add('is-mine');
    // 第 2 条：「下载 → 允许安装 → 继续安装 → 打开」只对安卓手机说
    $('.flow').classList.add('is-on');
  } else if (isIOS) {
    dockBtn.href = iosLink.href;
    dockBtn.textContent = '下载';
    dockMeta.textContent = inApp ? inAppName + '里要先点右上角「···」，选「' + openIn + '」' : '免费 · App Store · iOS 18 以上';
    $('.pick__opt--ios').classList.add('is-mine');
    // iPhone 上 App Store 放前面、用主按钮的样子
    iosLink.parentNode.insertBefore(iosLink, androidLink);
    iosLink.classList.replace('btn--glass', 'btn--grad');
    androidLink.classList.replace('btn--grad', 'btn--glass');
    $('.assure').hidden = true;
    $('#androidFine').hidden = true;
    $('#iosNote').hidden = false;
  }

  /* ---------- 在微信、QQ 这类 App 里打开：下载卡最上面提示先用浏览器打开（按钮照旧能点，有的版本放行） ---------- */
  if (inApp) {
    const tip = $('#inAppTip');
    tip.innerHTML = '';
    const b = document.createElement('b');
    b.textContent = inAppName + '里不能直接下载：';
    tip.append(b, '点右上角「···」，选「' + openIn + '」，再点下载。');
    tip.hidden = false;
    // 点安卓安装包时弹出的那一层也按这个 App、这台手机写
    $('#wechat p').textContent = inAppName + '里不能直接下载安装包。点右上角「···」，选「' + openIn + '」，再点「下载安卓版」。';
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
  // 苹果各区同步有先后（2026-11-26 美国区一时查不到、别的区都有），所以几个区一起查：
  // 任何一个区查到就算上架；每个区都明确答「没有」才写「即将上架」；网不通、查不全时按钮照旧。
  const STORE_REGIONS = ['us', 'cn', 'hk', 'sg', 'gb'];
  // 页面加载完再查，网慢时不拖住页面
  const afterLoad = (fn) => (document.readyState === 'complete'
    ? setTimeout(fn, 300)
    : window.addEventListener('load', () => setTimeout(fn, 300), { once: true }));
  afterLoad(function checkStore() {
    const links = $$('a[href*="apps.apple.com"]');
    if (!links.length) return;
    const stamp = Date.now();
    const scripts = [];
    let done = false, no = 0;
    const finish = (live) => {
      if (done) return;
      done = true;
      // 别的区的回答可能还在路上：回调换成什么都不做的（删掉的话晚到的回答会报「没定义」）
      STORE_REGIONS.forEach((c) => { window['__gtStore_' + c + stamp] = () => {}; });
      scripts.forEach((s) => s.remove());
      if (live !== false) return; // 上架了，或者查不到（网不通）：按钮照旧
      links.forEach((a) => {
        a.setAttribute('aria-disabled', 'true');
        a.removeAttribute('href');
        a.textContent = a === dockBtn ? '即将上架' : 'App Store 即将上架';
      });
      $('#iosSoon').hidden = false;
      $('#iosNote').hidden = true;
      if (isIOS) dockMeta.textContent = 'iPhone 版正在上架 App Store';
    };
    STORE_REGIONS.forEach((c) => {
      const cb = '__gtStore_' + c + stamp;
      const s = document.createElement('script');
      window[cb] = (data) => {
        if (data && data.resultCount > 0) finish(true);
        else if (++no === STORE_REGIONS.length) finish(false);
      };
      s.onerror = () => finish(null);
      s.src = 'https://itunes.apple.com/lookup?id=6834806101&country=' + c + '&callback=' + cb;
      scripts.push(s);
      document.head.append(s);
    });
    setTimeout(() => finish(null), 8000);
  });
})();
