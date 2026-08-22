/* ============================================================
   VESPERA 晚调 — 共享脚本
   主题切换 / 头部滚动 / 光标氛围 / 滚动显现 / Markdown 渲染
   ============================================================ */
(function(){
  "use strict";
  var $ = function(s){ return document.querySelector(s); };
  var $$ = function(s){ return Array.prototype.slice.call(document.querySelectorAll(s)); };
  window.Vespera = { $: $, $$: $$ };

  /* ---- cursor glow ---- */
  var glow = $("#glow");
  if(glow){
    document.addEventListener("mousemove", function(e){
      glow.style.setProperty("--mx", e.clientX + "px");
      glow.style.setProperty("--my", e.clientY + "px");
    }, {passive:true});
  }

  /* ---- header scroll ---- */
  var header = $("#site-header");
  function onScroll(){
    if(header) header.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, {passive:true});
  onScroll();

  /* ---- theme toggle ---- */
  function applyTheme(t){
    var root = document.documentElement;
    root.classList.add("animating");
    root.setAttribute("data-theme", t);
    try{ localStorage.setItem("vespera-theme", t); }catch(e){}
    setTimeout(function(){ root.classList.remove("animating"); }, 600);
  }
  window.Vespera.applyTheme = applyTheme;
  var themeToggle = $("#themeToggle");
  if(themeToggle){
    themeToggle.addEventListener("click", function(){
      var cur = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      applyTheme(cur);
    });
  }

  /* ---- reveal on scroll ---- */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, {threshold:.12, rootMargin:"0px 0px -8% 0px"});
  $$(".reveal").forEach(function(el){ io.observe(el); });

  /* ---- 轻量 Markdown 渲染 ---- */
  function esc(s){
    return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }
  function inline(s){
    s = esc(s);
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return s;
  }
  function mdToHtml(md){
    var lines = String(md||"").replace(/\r\n/g,"\n").split("\n");
    var html = "", i = 0, list = null;
    function closeList(){ if(list){ html += "</"+list+">"; list = null; } }
    while(i < lines.length){
      var line = lines[i];
      var code = line.match(/^```(\w*)\s*$/);
      if(code){
        closeList();
        var buf = [];
        i++;
        while(i < lines.length && !/^```\s*$/.test(lines[i])){ buf.push(lines[i]); i++; }
        i++;
        html += "<pre><code>"+esc(buf.join("\n"))+"</code></pre>";
        continue;
      }
      var h = line.match(/^(#{1,6})\s+(.*)$/);
      if(h){ closeList(); var lv = h[1].length; html += "<h"+lv+">"+inline(h[2])+"</h"+lv+">"; i++; continue; }
      if(/^\s*---+\s*$/.test(line)){ closeList(); html += "<hr>"; i++; continue; }
      var bq = line.match(/^>\s?(.*)$/);
      if(bq){ closeList(); html += "<blockquote>"+inline(bq[1])+"</blockquote>"; i++; continue; }
      var ul = line.match(/^\s*[-*+]\s+(.*)$/);
      if(ul){ if(list!=="ul"){ closeList(); html += "<ul>"; list="ul"; } html += "<li>"+inline(ul[1])+"</li>"; i++; continue; }
      var ol = line.match(/^\s*\d+\.\s+(.*)$/);
      if(ol){ if(list!=="ol"){ closeList(); html += "<ol>"; list="ol"; } html += "<li>"+inline(ol[1])+"</li>"; i++; continue; }
      if(line.trim()===""){ closeList(); i++; continue; }
      closeList();
      html += "<p>"+inline(line)+"</p>";
      i++;
    }
    closeList();
    return html;
  }
  window.Vespera.mdToHtml = mdToHtml;
})();