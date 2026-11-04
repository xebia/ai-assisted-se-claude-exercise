// Copy button on every code block. Works from file:// too: falls back to execCommand
// where the async clipboard API is not allowed.
(function () {
  var icon = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' +
    '<rect x="5" y="5" width="9" height="9" rx="1.5"/><path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5"/></svg>';
  var tick = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 8.5l3 3 7-7"/></svg>';

  function fallback(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    return ok ? Promise.resolve() : Promise.reject();
  }
  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () { return fallback(text); });
    }
    return fallback(text);
  }

  document.querySelectorAll('pre').forEach(function (pre) {
    var code = pre.querySelector('code') || pre;
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'xb-copy';
    btn.innerHTML = icon + '<span>Copy</span>';
    btn.setAttribute('aria-label', 'Copy to clipboard');
    btn.addEventListener('click', function () {
      // Drop the final newline so a pasted command does not run on its own.
      copy(code.innerText.replace(/\n$/, '')).then(function () {
        btn.classList.add('is-done'); btn.innerHTML = tick + '<span>Copied</span>';
      }, function () {
        btn.innerHTML = icon + '<span>Select and copy</span>';
      }).then(function () {
        setTimeout(function () { btn.classList.remove('is-done'); btn.innerHTML = icon + '<span>Copy</span>'; }, 1800);
      });
    });
    pre.appendChild(btn);
  });
})();
