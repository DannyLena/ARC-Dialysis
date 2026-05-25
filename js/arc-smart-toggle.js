(function(){
  var toggle   = document.getElementById('arcHMToggle');
  var overlay  = document.getElementById('arcMachineOverlay');
  var closeBtn = document.getElementById('arcMachineClose');
  var content  = document.getElementById('arcMachineContent');
  var smartBtn  = document.getElementById('arcSmartBtn');
  var smartPop  = document.getElementById('arcSmartPopup');
  var smartClose= document.getElementById('arcSmartPopupClose');
  if(!toggle) return;
  var loaded = false;

  var labelHuman   = document.getElementById('arcHMHuman');
  var labelMachine = document.getElementById('arcHMMachine');

  function setLabels(on){
    if(labelHuman)   labelHuman.style.color   = on ? 'rgba(255,255,255,0.35)' : '#ffffff';
    if(labelMachine) labelMachine.style.color = on ? '#ffffff' : 'rgba(255,255,255,0.35)';
  }
  setLabels(false);

  function openMachine(){
    toggle.setAttribute('aria-checked','true');
    setLabels(true);
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    closeBtn.focus();
    if(!loaded){
      fetch('/new-site/llms.txt')
        .then(function(r){ if(!r.ok) throw new Error(); return r.text(); })
        .then(function(txt){ content.innerHTML = renderMD(txt); loaded=true; })
        .catch(function(){ content.innerHTML='<div class="arc-machine-loading">⚠ llms.txt not found at /new-site/llms.txt</div>'; });
    }
  }
  function closeMachine(){
    toggle.setAttribute('aria-checked','false');
    setLabels(false);
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
    toggle.focus();
  }

  toggle.addEventListener('click', function(){ toggle.getAttribute('aria-checked')==='true' ? closeMachine() : openMachine(); });
  toggle.addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggle.click(); }});
  closeBtn.addEventListener('click', closeMachine);

  // Smart popup
  if(smartBtn && smartPop && smartClose){
    smartBtn.addEventListener('click', function(){ smartPop.classList.add('active'); smartClose.focus(); });
    smartClose.addEventListener('click', function(){ smartPop.classList.remove('active'); smartBtn.focus(); });
    smartPop.addEventListener('click', function(e){ if(e.target===smartPop) smartPop.classList.remove('active'); });
  }

  document.addEventListener('keydown', function(e){
    if(e.key==='Escape'){
      if(overlay.classList.contains('active')) closeMachine();
      if(smartPop && smartPop.classList.contains('active')){ smartPop.classList.remove('active'); if(smartBtn) smartBtn.focus(); }
    }
  });

  function renderMD(text){
    var lines=text.split('\n'),html='',inList=false,inTable=false,tHead=true;
    for(var i=0;i<lines.length;i++){
      var l=lines[i];
      if(/^---+$/.test(l.trim())){if(inList){html+='</ul>';inList=false;}if(inTable){html+='</tbody></table>';inTable=false;}html+='<hr>';continue;}
      if(l.startsWith('### ')){if(inList){html+='</ul>';inList=false;}html+='<h3>'+inl(l.slice(4))+'</h3>';continue;}
      if(l.startsWith('## ')){if(inList){html+='</ul>';inList=false;}html+='<h2>'+inl(l.slice(3))+'</h2>';continue;}
      if(l.startsWith('# ')){if(inList){html+='</ul>';inList=false;}html+='<h1>'+inl(l.slice(2))+'</h1>';continue;}
      if(l.startsWith('> ')){if(inList){html+='</ul>';inList=false;}html+='<blockquote>'+inl(l.slice(2))+'</blockquote>';continue;}
      if(l.startsWith('|')){
        if(!inTable){html+='<table>';inTable=true;tHead=true;}
        var cells=l.split('|').filter(function(c,idx,a){return idx>0&&idx<a.length-1;});
        if(cells.every(function(c){return /^[-: ]+$/.test(c);})){html+='</thead><tbody>';tHead=false;continue;}
        var tag=tHead?'th':'td';
        html+='<tr>'+cells.map(function(c){return '<'+tag+'>'+inl(c.trim())+'</'+tag+'>';}).join('')+'</tr>';
        continue;
      } else if(inTable){html+='</tbody></table>';inTable=false;tHead=true;}
      if(l.startsWith('- ')){if(!inList){html+='<ul>';inList=true;}html+='<li>'+inl(l.slice(2))+'</li>';continue;}
      else if(inList){html+='</ul>';inList=false;}
      if(l.trim()==='') continue;
      html+='<p>'+inl(l)+'</p>';
    }
    if(inList) html+='</ul>';
    if(inTable) html+='</tbody></table>';
    return html;
  }
  function inl(t){
    return t
      .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,'<em>$1</em>')
      .replace(/`([^`]+)`/g,'<code style="background:rgba(255,255,255,0.08);padding:1px 5px;border-radius:3px;font-size:0.9em">$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
  }
})();
