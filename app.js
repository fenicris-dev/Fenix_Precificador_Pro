/* ═══════════════════════════════════════════════════════════
   FÊNIX v4.1 — app.js  (rebuild completo — funções globais)
═══════════════════════════════════════════════════════════ */

/* ── ESTADO ── */
var S = {
  empresaAtiva: null, empresas: [], config: { os_mes:20, margem_min:15 },
  contas: [], despesasFixas: [], despesasVar: [], metas: {},
  templates: [], banco: [], resultado: null, pagina: 1, dark: false,
  tipos: { lucro:'perc', comis:'perc' },
  comisBase: { cmv:false, mob:false },
  mobTipo: 'terceirizada',
  regime: 'simples',
};
var POR_PAG = 12;
var SIMPLES_ALIQ = { prod:4.0, serv:6.0 };
var MEI_VALS = { comercio:72.90, servico:76.90, ambos:81.90 };

/* ── TABELA CARNEO 2026 ── */
var CARNEO_TAB = [
  { ate:2259.20,  aliq:0,     ded:0      },
  { ate:2826.65,  aliq:0.075, ded:169.44 },
  { ate:3751.05,  aliq:0.15,  ded:381.44 },
  { ate:4664.68,  aliq:0.225, ded:662.77 },
  { ate:Infinity, aliq:0.275, ded:896.00 },
];
var DESCONTO_SIMPL  = 884.96;
var ISENCAO_EFETIVA = 5000.00;

/* ── CONTAS PADRÃO ── */
var CONTAS_PADRAO = [
  { id:1,  nome:'Reposição de Produtos / Estoque',  grupo:'Operacional',    pct:15, cor:'#2980b9' },
  { id:2,  nome:'Reposição de Ferramentas',          grupo:'Operacional',    pct:5,  cor:'#1a5276' },
  { id:3,  nome:'Manutenção de Veículos',            grupo:'Operacional',    pct:3,  cor:'#148f77' },
  { id:4,  nome:'IPVA / Licenciamento',              grupo:'Operacional',    pct:2,  cor:'#0e6655' },
  { id:5,  nome:'Aluguel do Imóvel',                 grupo:'Infraestrutura', pct:8,  cor:'#7d6608' },
  { id:6,  nome:'Água',                              grupo:'Infraestrutura', pct:1,  cor:'#2e86c1' },
  { id:7,  nome:'Energia Elétrica',                  grupo:'Infraestrutura', pct:2,  cor:'#d35400' },
  { id:8,  nome:'Internet',                          grupo:'Infraestrutura', pct:1,  cor:'#6c3483' },
  { id:9,  nome:'Marketing / Publicidade',           grupo:'Crescimento',    pct:5,  cor:'#e74c3c' },
  { id:10, nome:'Pró-labore',                        grupo:'Pessoal',        pct:20, cor:'#1e8449' },
  { id:11, nome:'Treinamento e Eventos',             grupo:'Crescimento',    pct:3,  cor:'#f39c12' },
  { id:12, nome:'Reserva de Emergência',             grupo:'Proteção',       pct:10, cor:'#922b21' },
  { id:13, nome:'Crescimento da Empresa',            grupo:'Crescimento',    pct:10, cor:'#7d3c98' },
  { id:14, nome:'Distribuição de Lucros',            grupo:'Pessoal',        pct:5,  cor:'#27ae60' },
];
var DESPESAS_FIXAS_PADRAO = [
  { id:1, nome:'Aluguel',              valor:0, _input:'' },
  { id:2, nome:'Energia Elétrica',     valor:0, _input:'' },
  { id:3, nome:'Água',                 valor:0, _input:'' },
  { id:4, nome:'Internet / Telefone',  valor:0, _input:'' },
  { id:5, nome:'Pró-labore',           valor:0, _input:'' },
  { id:6, nome:'Contador',             valor:0, _input:'' },
  { id:7, nome:'IPVA / Licenciamento', valor:0, _input:'' },
  { id:8, nome:'Software / Assinaturas',valor:0,_input:'' },
];
var DESPESAS_VAR_PADRAO = [
  { id:1, nome:'Comissão de Vendas (%fat)', valor:0, tipo:'perc', _input:'' },
  { id:2, nome:'Insumos / Consumíveis',     valor:0, tipo:'valor',_input:'' },
  { id:3, nome:'Frete / Entrega',           valor:0, tipo:'valor',_input:'' },
];
var CORES = ['#2980b9','#1a5276','#148f77','#0e6655','#7d6608','#e74c3c',
             '#8e44ad','#d35400','#1e8449','#922b21','#7d3c98','#f39c12'];
var LINHAS = [
  { id:'lr_cmv',      label:'Produto / Mercadoria (CMV)', cor:'#2980b9', icon:'fa-box'           },
  { id:'lr_mob',      label:'Mão de Obra Direta',         cor:'#1a5276', icon:'fa-person-digging' },
  { id:'lr_insumos',  label:'Insumos / Consumíveis',      cor:'#16a085', icon:'fa-flask'          },
  { id:'lr_infra',    label:'Infraestrutura rateada',     cor:'#0e6655', icon:'fa-plug'           },
  { id:'lr_prolabore',label:'Pró-labore rateado',         cor:'#1e8449', icon:'fa-user-tie'       },
  { id:'lr_comis',    label:'Comissão de Indicação',      cor:'#8e44ad', icon:'fa-handshake'      },
  { id:'lr_imp',      label:'Impostos | Fatia "Governo"', cor:'#e74c3c', icon:'fa-landmark'       },
  { id:'lr_lucro',    label:'Lucro Real',                 cor:'#27ae60', icon:'fa-chart-line'     },
];

/* ════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════ */
function el(id) { return document.getElementById(id); }
function fmt(v)  { return (v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }
function fmtS(v) { return v>=1000?'R$\u00a0'+v.toLocaleString('pt-BR',{maximumFractionDigits:0}):fmt(v); }
function fmtD(d) { if(!d) return '—'; var p=d.split('-'); return p[2]+'/'+p[1]+'/'+p[0]; }
function regLbl(r){ return {mei:'MEI',simples:'Simples Nacional',carneo:'Carnê-Leão',manual:'Manual'}[r]||r; }
function genUid() { return Date.now().toString(36)+Math.random().toString(36).slice(2); }

function parseMoney(s) {
  if(!s) return 0;
  return parseFloat(String(s).replace(/R\$\s?/g,'').replace(/\./g,'').replace(',','.')) || 0;
}
function parseDec(s) {
  if(!s) return 0;
  return parseFloat(String(s).replace(',','.')) || 0;
}

/* ════════════════════════════════════════════
   MÁSCARAS (globais)
════════════════════════════════════════════ */
function maskMoney(input) {
  var v = input.value.replace(/\D/g,'');
  if(!v){ input.value=''; return; }
  v = (parseInt(v,10)/100).toFixed(2);
  input.value = 'R$ '+v.replace('.',',').replace(/\B(?=(\d{3})+(?!\d))/g,'.');
}
function maskDec(input) {
  var v = input.value.replace(/[^\d,]/g,'');
  var p = v.split(',');
  if(p.length>2) v = p[0]+','+p.slice(1).join('');
  if(p[1]&&p[1].length>2) v = p[0]+','+p[1].slice(0,2);
  input.value = v;
}
function maskDecimal(input){ maskDec(input); }
function maskTel(input) {
  var v = input.value.replace(/\D/g,'').slice(0,11);
  if(v.length>=7) v='('+v.slice(0,2)+') '+v.slice(2,7)+'-'+v.slice(7);
  else if(v.length>=3) v='('+v.slice(0,2)+') '+v.slice(2);
  else if(v.length>0)  v='('+v;
  input.value = v;
}

/* ════════════════════════════════════════════
   FISCAL 2026
════════════════════════════════════════════ */
function calcCarneo(base) {
  if(base <= ISENCAO_EFETIVA) return { imp:0, aliq:0 };
  for(var i=0;i<CARNEO_TAB.length;i++){
    var f=CARNEO_TAB[i];
    if(base<=f.ate) return { imp:Math.max(base*f.aliq-f.ded-DESCONTO_SIMPL,0), aliq:f.aliq*100 };
  }
  return { imp:0, aliq:0 };
}

function impostoRegime(regime, cmv, mob) {
  var fat = cmv + mob;
  if(fat<=0) return { imp:0, meiFixo:0, aliqEf:0, aliqP:'—', aliqS:'—', alerta:'' };
  if(regime==='mei'){
    var fixo=(cmv>0&&mob>0)?MEI_VALS.ambos:mob>0?MEI_VALS.servico:MEI_VALS.comercio;
    return { imp:0, meiFixo:fixo, aliqEf:0, aliqP:'fixo/mês', aliqS:'fixo/mês',
             alerta:'MEI: R$ '+fixo.toFixed(2).replace('.',',')+'/mês fixos — não incide por OS.' };
  }
  if(regime==='simples'){
    var imp=cmv*(SIMPLES_ALIQ.prod/100)+mob*(SIMPLES_ALIQ.serv/100);
    return { imp:imp, meiFixo:0, aliqEf:(imp/fat*100),
             aliqP:SIMPLES_ALIQ.prod.toFixed(2)+'%', aliqS:SIMPLES_ALIQ.serv.toFixed(2)+'%', alerta:'' };
  }
  if(regime==='carneo'){
    var res=calcCarneo(fat);
    return { imp:res.imp, meiFixo:0, aliqEf:res.aliq,
             aliqP:res.aliq.toFixed(1)+'%', aliqS:res.aliq.toFixed(1)+'%',
             alerta:'Carnê-Leão 2026: isento até R$ 5.000/mês. Imposto real depende do total mensal.' };
  }
  var pct=parseDec(el('imposto_manual')?el('imposto_manual').value:'0');
  var impM=fat*(pct/100);
  return { imp:impM, meiFixo:0, aliqEf:pct, aliqP:pct.toFixed(1)+'%', aliqS:pct.toFixed(1)+'%', alerta:'' };
}

/* ════════════════════════════════════════════
   RATEIO AUTOMÁTICO
════════════════════════════════════════════ */
function calcRateioAuto() {
  var osMes = S.config.os_mes||20;
  var infra=0, prolabore=0;
  S.despesasFixas.forEach(function(d){
    var v=parseMoney(d._input)||d.valor||0;
    if(d.nome.toLowerCase().includes('pró-labore')||d.nome.toLowerCase().includes('prolabore')) prolabore+=v;
    else infra+=v;
  });
  return { infra:infra/osMes, prolabore:prolabore/osMes, porOS:(infra+prolabore)/osMes };
}

function totalDespesasFixas() {
  return S.despesasFixas.reduce(function(a,d){ return a+(parseMoney(d._input)||d.valor||0); },0);
}

/* ════════════════════════════════════════════
   MOTOR DE CÁLCULO
════════════════════════════════════════════ */
function calcEngine(overrides) {
  overrides = overrides||{};
  var cmv      = overrides.cmv!==undefined ? overrides.cmv : parseMoney(el('cmv')?el('cmv').value:'');
  var mobRaw   = parseMoney(el('mob')?el('mob').value:'');
  var mob      = S.mobTipo==='propria' ? 0 : (overrides.mob!==undefined?overrides.mob:mobRaw);
  var mobProp  = S.mobTipo==='propria' ? mobRaw : 0;
  var insumos  = parseMoney(el('insumos')?el('insumos').value:'');
  var auto     = calcRateioAuto();
  var infra    = parseMoney(el('infra')?el('infra').value:'')||auto.infra;
  var prolabore= parseMoney(el('prolabore')?el('prolabore').value:'')||auto.prolabore+mobProp;
  var lucroInp = overrides.lucro!==undefined ? overrides.lucro :
                 (S.tipos.lucro==='perc'?parseDec(el('lucro_val')?el('lucro_val').value:''):
                                          parseMoney(el('lucro_val')?el('lucro_val').value:''));
  var comisInp = S.tipos.comis==='perc' ? parseDec(el('comis_val')?el('comis_val').value:'') :
                                           parseMoney(el('comis_val')?el('comis_val').value:'');

  var custoDireto   = cmv+mob+insumos;
  var custoIndireto = infra+prolabore;
  var custoBase     = custoDireto+custoIndireto;

  var comisAtiva = S.comisBase.cmv||S.comisBase.mob;
  var baseComis  = 0;
  if(S.comisBase.cmv) baseComis+=cmv;
  if(S.comisBase.mob) baseComis+=mob;
  var vComis = comisAtiva ? (S.tipos.comis==='perc'?baseComis*(comisInp/100):comisInp) : 0;

  var reg  = impostoRegime(S.regime, cmv, mob);
  var vImp = reg.imp;

  var custoTotal = custoBase+vComis+vImp;
  var percVar    = S.tipos.lucro==='perc' ? lucroInp : 0;
  var divisor    = (100-percVar)/100;

  if(divisor<=0||(cmv+mobRaw)<=0) return null;

  var lucroFixo  = S.tipos.lucro==='moeda' ? lucroInp : 0;
  var precoFinal = (custoTotal+lucroFixo)/divisor;
  var vLucro     = precoFinal-custoTotal;
  var lucroPerc  = vLucro/precoFinal*100;

  return { cmv:cmv, mob:mob, mobPropria:mobProp, insumos:insumos, infra:infra, prolabore:prolabore,
           custoDireto:custoDireto, custoIndireto:custoIndireto, custoBase:custoBase,
           vComis:vComis, vImp:vImp, vLucro:vLucro, lucroPerc:lucroPerc,
           precoFinal:precoFinal, custoTotal:custoTotal,
           baseComis:baseComis, comisAtiva:comisAtiva, comisInp:comisInp, lucroInp:lucroInp,
           reg:reg, regime:S.regime, aliqEf:reg.aliqEf, meiFixo:reg.meiFixo||0,
           rateioAuto:auto };
}

/* ════════════════════════════════════════════
   LIVE ROWS
════════════════════════════════════════════ */
function buildLiveRows() {
  var cont=el('live_rows'); if(!cont) return;
  cont.innerHTML=LINHAS.map(function(l){
    return '<div class="sk-item zero" id="'+l.id+'">'
      +'<div class="sk-top"><div class="sk-left">'
      +'<span class="sk-dot" style="background:'+l.cor+'"></span>'
      +'<i class="fa-solid '+l.icon+'" style="color:'+l.cor+';font-size:.72rem"></i>'
      +'<span class="sk-name">'+l.label+'</span>'
      +'<span class="sk-pct" id="'+l.id+'_pct" style="background:'+l.cor+'">— %</span>'
      +'</div><span class="sk-val" id="'+l.id+'_val" style="color:'+l.cor+'">R$ —</span></div>'
      +'<div class="sk-bar"><div class="sk-fill" id="'+l.id+'_bar" style="background:'+l.cor+';width:0%"></div></div>'
      +'</div>';
  }).join('');
}

function updateRow(id, valor, total) {
  var wrap=el(id); if(!wrap) return;
  var pct=total>0?(valor/total*100):0;
  wrap.classList.toggle('zero',valor<=0);
  el(id+'_val').innerText=valor>0?fmt(valor):'R$ —';
  el(id+'_pct').innerText=valor>0?pct.toFixed(1)+'%':'— %';
  el(id+'_bar').style.width=(valor>0?pct:0)+'%';
}

/* ════════════════════════════════════════════
   LIVE CALC — dispara a cada digitação
════════════════════════════════════════════ */
function liveCalc() {
  // Preview OS
  if(el('pv_os'))      el('pv_os').innerText      = (el('os_num')?el('os_num').value:'')||'—';
  if(el('pv_data'))    el('pv_data').innerText    = el('os_data')&&el('os_data').value?fmtD(el('os_data').value):'—';
  if(el('pv_cliente')) el('pv_cliente').innerText = (el('cliente')?el('cliente').value:'')||'—';
  if(el('hint_os_mes'))el('hint_os_mes').innerText = S.config.os_mes||20;

  var r = calcEngine();

  // Custo total bar
  if(el('custo_total_live')) el('custo_total_live').innerText = r?fmt(r.custoTotal):'R$ 0,00';

  // Subtotais grupos
  if(r){
    ['cd','ci','ce','ct','cm'].forEach(function(g){
      var eEl=el('sub_'+g);
      if(eEl) eEl.innerText=fmt(g==='cd'?r.custoDireto:g==='ci'?r.custoIndireto:g==='ce'?r.vComis:g==='ct'?r.vImp:r.vLucro||0);
    });
  } else {
    ['cd','ci','ce','ct','cm'].forEach(function(g){ var e=el('sub_'+g); if(e) e.innerText='R$ 0,00'; });
  }

  // Alerta recompra
  var cmvVal=parseMoney(el('cmv')?el('cmv').value:'');
  var ra=el('recompra_alert');
  if(ra){ ra.classList.toggle('show',cmvVal>0); if(cmvVal>0&&el('recompra_val')) el('recompra_val').innerText=fmt(cmvVal); }

  // Rateio hint
  if(r&&el('rateio_hint_val')) el('rateio_hint_val').innerText=fmt(r.rateioAuto.porOS);

  // MOB própria info
  var mi=el('mob_info'); if(mi) mi.classList.toggle('show',S.mobTipo==='propria');

  // Alíquotas display
  if(r){
    var isS=S.regime==='simples';
    if(el('aliq_prod_lbl')) el('aliq_prod_lbl').innerText=isS?'':r.reg.aliqP||'—';
    if(el('aliq_serv_lbl')) el('aliq_serv_lbl').innerText=isS?'':r.reg.aliqS||'—';
    if(el('aliq_ef'))       el('aliq_ef').innerText=r.aliqEf?r.aliqEf.toFixed(2)+'%':'—';
    var al=el('regime_alert'),at=el('regime_alert_txt');
    if(al&&at){ if(r.reg.alerta){at.innerText=r.reg.alerta;al.classList.add('show');}else al.classList.remove('show'); }
  }

  // Base comissão
  if(r){
    var bi=el('comis_base_info'),bv=el('comis_base_val');
    if(bi&&bv){ bv.innerText=fmt(r.baseComis); bi.classList.toggle('visible',r.comisAtiva); }
  }

  if(!r){
    if(el('res_total')) el('res_total').innerText='R$ —,——';
    if(el('res_info'))  { el('res_info').innerText='Informe pelo menos CMV ou Mão de Obra'; el('res_info').style.color=''; }
    LINHAS.forEach(function(l){ updateRow(l.id,0,0); });
    return;
  }

  // Alerta margem mínima
  var margemMin=S.config.margem_min||15;
  var abaixo=r.lucroPerc<margemMin;
  if(el('res_total')) el('res_total').innerText=fmt(r.precoFinal);
  if(el('res_info')){
    el('res_info').innerText=abaixo?'⚠️ Margem '+r.lucroPerc.toFixed(1)+'% abaixo do mínimo ('+margemMin+'%)':'Prévia — clique em Calcular para confirmar';
    el('res_info').style.color=abaixo?'#f39c12':'';
  }

  updateRow('lr_cmv',       r.cmv,       r.precoFinal);
  updateRow('lr_mob',       r.mob,       r.precoFinal);
  updateRow('lr_insumos',   r.insumos,   r.precoFinal);
  updateRow('lr_infra',     r.infra,     r.precoFinal);
  updateRow('lr_prolabore', r.prolabore, r.precoFinal);
  updateRow('lr_comis',     r.vComis,    r.precoFinal);
  updateRow('lr_imp',       r.vImp,      r.precoFinal);
  updateRow('lr_lucro',     r.vLucro,    r.precoFinal);

  salvarRascunho();
}

/* ════════════════════════════════════════════
   TOGGLES
════════════════════════════════════════════ */
function setMobTipo(tipo) {
  S.mobTipo=tipo;
  document.querySelectorAll('.mob-tab').forEach(function(b){
    b.classList.toggle('active',b.getAttribute('data-tipo')===tipo);
  });
  liveCalc();
}

function setRegime(r) {
  S.regime=r;
  ['mei','simples','carneo','manual'].forEach(function(x){
    var t=el('tab_'+x); if(t) t.classList.toggle('active',x===r);
  });
  var mr=el('imposto_manual_row'); if(mr) mr.classList.toggle('oculto',r!=='manual');
  var isS=r==='simples';
  if(el('aliq_prod_edit')) el('aliq_prod_edit').style.display=isS?'block':'none';
  if(el('aliq_serv_edit')) el('aliq_serv_edit').style.display=isS?'block':'none';
  liveCalc();
}

function toggle(campo) {
  var btn=el('btn_'+campo);
  S.tipos[campo]=S.tipos[campo]==='perc'?'moeda':'perc';
  var isP=S.tipos[campo]==='perc';
  if(btn){ btn.innerHTML=isP?'%':'<i class="fa-solid fa-dollar-sign"></i>'; btn.classList.toggle('active',isP); }
  var inp=el(campo+'_val');
  if(inp){ inp.value=''; inp.placeholder=isP?'0,00':'R$ 0,00'; }
  liveCalc();
}

function toggleComisBase(tipo) {
  S.comisBase[tipo]=!S.comisBase[tipo];
  var t=el('tag_'+tipo); if(t) t.classList.toggle('on',S.comisBase[tipo]);
  liveCalc();
}

function toggleGrupo(id) {
  var g=el(id); if(g) g.classList.toggle('aberto');
}

function toggleDark() {
  S.dark=!S.dark;
  document.documentElement.setAttribute('data-theme',S.dark?'dark':'');
  if(el('btn_dark')) el('btn_dark').innerHTML=S.dark?'<i class="fa-solid fa-sun"></i>':'<i class="fa-solid fa-moon"></i>';
  localStorage.setItem('fenix_dark',S.dark?'1':'0');
}

/* ════════════════════════════════════════════
   VALIDAR + CALCULAR
════════════════════════════════════════════ */
function validar() {
  var ok=true;
  var osEl=el('os_num'),errOs=el('err_os');
  if(!osEl||!osEl.value.trim()){ if(osEl) osEl.classList.add('error'); if(errOs) errOs.classList.add('show'); ok=false; }
  else{ osEl.classList.remove('error'); if(errOs) errOs.classList.remove('show'); }
  var cmv=parseMoney(el('cmv')?el('cmv').value:'');
  var mob=parseMoney(el('mob')?el('mob').value:'');
  var errC=el('err_custo');
  if(cmv<=0&&mob<=0){ if(errC) errC.classList.add('show'); ok=false; }
  else{ if(errC) errC.classList.remove('show'); }
  return ok;
}

function calcular() {
  if(!validar()){ showToast('Preencha os campos obrigatórios','error'); return; }
  var r=calcEngine(); if(!r){ showToast('Verifique os dados','error'); return; }
  var baseLabel=!r.comisAtiva?'inativa':(S.comisBase.cmv&&S.comisBase.mob)?'sobre Produto + Mão de Obra':S.comisBase.cmv?'sobre Produto (CMV)':'sobre Mão de Obra';
  var saude=r.lucroPerc>=20?'Saudável':r.lucroPerc>=(S.config.margem_min||15)?'Apertado':'Perigoso';
  S.resultado=Object.assign({},r,{
    baseLabel:baseLabel, saude:saude,
    cliente:   el('cliente')?el('cliente').value.trim():'',
    clienteTel:el('cliente_tel')?el('cliente_tel').value.trim():'',
    osNum:     el('os_num')?el('os_num').value.trim():'',
    osData:    el('os_data')?el('os_data').value:'',
    osDesc:    el('os_desc')?el('os_desc').value.trim():'',
    geradoEm:  new Date().toISOString(),
  });
  mostrarResultado();
  mostrarComparativo();
  mostrarDestino();
  mostrarPontoEquilibrio();
  simularCenario();
  showToast('Precificação calculada! 🔥','success');
}

/* ════════════════════════════════════════════
   MOSTRAR RESULTADO
════════════════════════════════════════════ */
function healthBadge(lp) {
  var min=S.config.margem_min||15;
  if(lp>=20) return '<span class="health h-green"><i class="fa-solid fa-circle-check"></i> Saudável</span>';
  if(lp>=min) return '<span class="health h-yellow"><i class="fa-solid fa-triangle-exclamation"></i> Apertado</span>';
  return '<span class="health h-red"><i class="fa-solid fa-circle-xmark"></i> Perigoso</span>';
}

function animVal(elRef,end,dur) {
  dur=dur||900; var t0=performance.now();
  (function s(now){
    var p=Math.min((now-t0)/dur,1),e=p===1?1:1-Math.pow(2,-10*p);
    elRef.innerText=fmt(e*end);
    if(p<1) requestAnimationFrame(s);
  })(performance.now());
}

function mostrarResultado() {
  var r=S.resultado;
  if(el('breakdown_wrap')) el('breakdown_wrap').style.display='block';
  if(el('live_rows'))      el('live_rows').style.display='none';
  var tv=el('res_total'); if(tv) animVal(tv,r.precoFinal);
  if(el('res_info')){ el('res_info').innerHTML='<i class="fa-solid fa-user"></i> '+(r.cliente||'(sem cliente)')+' &nbsp;·&nbsp; OS '+r.osNum+' &nbsp;·&nbsp; '+fmtD(r.osData); el('res_info').style.color=''; }

  var itens=[
    {label:'Produto / Mercadoria (CMV)',  valor:r.cmv,       cor:'#2980b9',icon:'fa-box'},
    {label:'Mão de Obra Direta',           valor:r.mob,       cor:'#1a5276',icon:'fa-person-digging'},
    {label:'Mão de Obra Própria (rateada)',valor:r.mobPropria,cor:'#0e6655',icon:'fa-user-tie'},
    {label:'Insumos / Consumíveis',        valor:r.insumos,   cor:'#16a085',icon:'fa-flask'},
    {label:'Infraestrutura rateada',       valor:r.infra,     cor:'#0e6655',icon:'fa-plug'},
    {label:'Pró-labore rateado',           valor:r.prolabore, cor:'#1e8449',icon:'fa-user-tie'},
    {label:'Comissão de Indicação',        valor:r.vComis,    cor:'#8e44ad',icon:'fa-handshake',note:r.baseLabel},
    {label:'Impostos ('+regLbl(r.regime)+')',valor:r.vImp,   cor:'#e74c3c',icon:'fa-landmark'},
    {label:'Lucro Real',                   valor:r.vLucro,    cor:'#27ae60',icon:'fa-chart-line',isLucro:true},
  ];
  var html='';
  itens.forEach(function(it,i){
    if(it.valor<=0&&!it.isLucro) return;
    var p=(it.valor/r.precoFinal*100).toFixed(1);
    var hb=it.isLucro?healthBadge(r.lucroPerc):'';
    var nt=it.note&&it.note!=='inativa'?'<div class="bd-note" style="color:#8e44ad"><i class="fa-solid fa-arrow-turn-up fa-rotate-90"></i> Calculada '+it.note+' ('+fmt(r.baseComis)+')</div>':'';
    html+='<div class="bd-item" style="animation-delay:'+i*.06+'s">'
      +'<div class="bd-row"><span class="nm"><span class="bd-dot" style="background:'+it.cor+'"></span>'
      +'<i class="fa-solid '+it.icon+'" style="color:'+it.cor+';font-size:.7rem"></i>'
      +it.label+'<span class="pct-chip" style="background:'+it.cor+'">'+p+'%</span>'+hb+'</span>'
      +'<span class="am" style="color:'+it.cor+'">'+fmt(it.valor)+'</span></div>'
      +'<div class="prog-bar"><div class="prog-fill" style="background:'+it.cor+'" data-w="'+p+'"></div></div>'
      +nt+'</div>';
  });
  if(el('breakdown_list')) el('breakdown_list').innerHTML=html;
  requestAnimationFrame(function(){ document.querySelectorAll('.prog-fill').forEach(function(e){ e.style.width=e.dataset.w+'%'; }); });
  desenharPizza(itens.filter(function(x){ return x.valor>0; }), r.precoFinal);
}

function desenharPizza(itens,total) {
  var svg=el('pie_svg'),leg=el('pie_legend'); if(!svg||!leg) return;
  var cx=60,cy=60,r=50,ri=28,ang=0,paths='',legHtml='';
  itens.forEach(function(it){
    var pct=it.valor/total;
    var a1=ang*Math.PI/180,a2=(ang+pct*360)*Math.PI/180;
    var lx1=cx+r*Math.sin(a1),ly1=cy-r*Math.cos(a1);
    var lx2=cx+r*Math.sin(a2),ly2=cy-r*Math.cos(a2);
    var ix1=cx+ri*Math.sin(a1),iy1=cy-ri*Math.cos(a1);
    var ix2=cx+ri*Math.sin(a2),iy2=cy-ri*Math.cos(a2);
    var lg=pct>.5?1:0;
    paths+='<path d="M'+lx1+','+ly1+' A'+r+','+r+' 0 '+lg+' 1 '+lx2+','+ly2+' L'+ix2+','+iy2+' A'+ri+','+ri+' 0 '+lg+' 0 '+ix1+','+iy1+' Z" fill="'+it.cor+'" opacity=".9"></path>';
    ang+=pct*360;
    legHtml+='<div class="pie-leg-item"><span class="pie-leg-dot" style="background:'+it.cor+'"></span><span>'+it.label+': <strong>'+(pct*100).toFixed(1)+'%</strong></span></div>';
  });
  svg.innerHTML=paths; leg.innerHTML=legHtml;
}

/* ════════════════════════════════════════════
   SIMULADOR
════════════════════════════════════════════ */
function simularCenario() {
  if(!S.resultado) return;
  var r=S.resultado;
  var cmvD=parseFloat(el('sim_cmv')?el('sim_cmv').value:10)||0;
  var lucroN=parseFloat(el('sim_lucro')?el('sim_lucro').value:NaN);
  var sim=calcEngine({cmv:r.cmv*(1+cmvD/100),lucro:isNaN(lucroN)?r.lucroInp:lucroN});
  if(!sim){ if(el('sim_preco')) el('sim_preco').innerText='—'; return; }
  var diff=sim.precoFinal-r.precoFinal;
  if(el('sim_preco')){ el('sim_preco').innerText=fmt(sim.precoFinal); el('sim_preco').style.color=diff>=0?'#e74c3c':'#27ae60'; }
  if(el('sim_desc')) el('sim_desc').innerText=(diff>=0?'▲':'▼')+' '+fmt(Math.abs(diff))+' em relação ao preço atual | Margem: '+sim.lucroPerc.toFixed(1)+'%';
}

/* ════════════════════════════════════════════
   COMPARATIVO
════════════════════════════════════════════ */
function mostrarComparativo() {
  var r=S.resultado;
  function cenario(regime){
    var reg=impostoRegime(regime,r.cmv,r.mob);
    var custo=r.custoBase+r.vComis+reg.imp;
    var percV=S.tipos.lucro==='perc'?r.lucroInp:0;
    var div=(100-percV)/100; if(div<=0) return null;
    var lf=S.tipos.lucro==='moeda'?r.lucroInp:0;
    var pf=(custo+lf)/div;
    return {pf:pf,vImp:reg.imp,meiFixo:reg.meiFixo||0,vL:pf-custo,aliq:reg.aliqEf};
  }
  var cM=cenario('mei'),cS=cenario('simples'),cC=cenario('carneo');
  function cor(v){ return v>=0?'#27ae60':'#e74c3c'; }
  function badge(v){ return v>0?'<span class="comp-badge" style="background:rgba(39,174,96,.15);color:#1e8449">Positivo ✓</span>':'<span class="comp-badge" style="background:rgba(231,76,60,.15);color:#a93226">Negativo ✗</span>'; }
  ['mei','simples','carneo'].forEach(function(rg){ var e=el('comp_'+rg); if(e) e.classList.toggle('dest',rg===r.regime); });
  if(cM){
    var mi=el('cp_mei_imp'); if(mi) mi.innerHTML='<span style="color:#e67e22;font-weight:700">'+fmt(cM.meiFixo)+'/mês</span><span style="font-size:.65rem;color:var(--gt);display:block">R$ 0,00 por OS</span>';
    var mc=el('cp_mei_custo'); if(mc) mc.innerText=fmt(r.custoBase+r.vComis);
    var ms=el('cp_mei_sobra'); if(ms){ ms.innerText=fmt(cM.vL); ms.style.color=cor(cM.vL); }
    var mb=el('cp_mei_badge'); if(mb) mb.innerHTML=badge(cM.vL);
  }
  if(cS){
    var sp=el('cp_sim_imp_p'); if(sp) sp.innerText=fmt(r.cmv*(SIMPLES_ALIQ.prod/100));
    var ss=el('cp_sim_imp_s'); if(ss) ss.innerText=fmt(r.mob*(SIMPLES_ALIQ.serv/100));
    var sc=el('cp_sim_custo'); if(sc) sc.innerText=fmt(r.custoBase+r.vComis);
    var sv=el('cp_sim_sobra'); if(sv){ sv.innerText=fmt(cS.vL); sv.style.color=cor(cS.vL); }
    var sbg=el('cp_sim_badge'); if(sbg) sbg.innerHTML=badge(cS.vL);
  }
  if(cC){
    var ca=el('cp_car_aliq'); if(ca) ca.innerText=cC.aliq.toFixed(1)+'%';
    var ci=el('cp_car_imp');  if(ci) ci.innerText=fmt(cC.vImp);
    var cc=el('cp_car_custo');if(cc) cc.innerText=fmt(r.custoBase+r.vComis);
    var cv=el('cp_car_sobra');if(cv){ cv.innerText=fmt(cC.vL); cv.style.color=cor(cC.vL); }
    var cb=el('cp_car_badge');if(cb) cb.innerHTML=badge(cC.vL);
  }
}

/* ════════════════════════════════════════════
   DESTINO DO LUCRO
════════════════════════════════════════════ */
function mostrarDestino() {
  var r=S.resultado;
  var panel=el('destino_panel'),body=el('destino_body');
  if(!panel||!body) return;
  if(!S.contas.length){ panel.style.display='none'; return; }
  panel.style.display='block';
  var total=S.contas.reduce(function(a,c){ return a+c.pct; },0);
  var sobra=Math.max(0,100-total);
  var html='';
  var iRes=S.contas.findIndex(function(c){ return c.nome.includes('Reserva'); });
  var iCre=S.contas.findIndex(function(c){ return c.nome.includes('Crescimento'); });
  S.contas.forEach(function(c,i){
    var pef=c.pct+(i===iRes&&sobra>0?sobra/2:0)+(i===iCre&&sobra>0?sobra/2:0);
    var vl=r.vLucro*(pef/100);
    var extra=pef>c.pct?'<span style="font-size:.65rem;color:var(--acc);margin-left:4px">+'+( pef-c.pct).toFixed(1)+'% sobra</span>':'';
    html+='<div class="destino-row"><span class="dr-name"><span style="width:8px;height:8px;border-radius:50%;background:'+c.cor+';flex-shrink:0;display:inline-block"></span>'+c.nome+extra+'</span>'
      +'<span class="dr-pct">'+pef.toFixed(1)+'%</span><span class="dr-val">'+fmt(vl)+'</span></div>'
      +'<div class="destino-bar"><div class="destino-fill" style="background:'+c.cor+';width:'+pef+'%"></div></div>';
  });
  var alertClass=total>100?'over':total===100?'ok':'warn';
  var alertMsg=total>100?'⚠️ Alocação excede 100% em '+(total-100).toFixed(1)+'%!':total===100?'✅ 100% do lucro alocado.':'💡 '+sobra.toFixed(1)+'% distribuído automaticamente entre Reserva e Crescimento.';
  html+='<div class="destino-alert '+alertClass+'">'+alertMsg+'</div>';
  body.innerHTML=html;
}

/* ════════════════════════════════════════════
   PONTO DE EQUILÍBRIO
════════════════════════════════════════════ */
function mostrarPontoEquilibrio() {
  var r=S.resultado;
  var osMes=S.config.os_mes||20;
  var totalFixo=totalDespesasFixas();
  var precoSemLucro=r.custoBase+r.vComis+r.vImp;
  var osPE=r.vLucro>0?Math.ceil(totalFixo/r.vLucro):0;
  if(el('pe_os_mes'))    el('pe_os_mes').innerText   = osPE>0?osPE+' OS':'—';
  if(el('pe_fat_min'))   el('pe_fat_min').innerText  = fmtS(precoSemLucro*osMes+totalFixo);
  if(el('pe_margem_min'))el('pe_margem_min').innerText=(S.config.margem_min||15)+'%';
  if(el('pe_preco_min')) el('pe_preco_min').innerText = fmt(precoSemLucro);
}

/* ════════════════════════════════════════════
   PLANO DE CONTAS
════════════════════════════════════════════ */
function renderContasList() {
  var cont=el('contas_list'); if(!cont) return;
  cont.innerHTML=S.contas.map(function(c,i){
    return '<div class="conta-item">'
      +'<span class="conta-dot" style="background:'+c.cor+'"></span>'
      +'<div style="flex:1"><div class="conta-nome">'+c.nome+'</div><div class="conta-grupo">'+c.grupo+'</div></div>'
      +'<input class="conta-pct-inp" type="number" min="0" max="100" value="'+c.pct+'" '
      +'oninput="S.contas['+i+'].pct=parseFloat(this.value)||0;updateContaTotal()">'
      +'<span style="font-size:.75rem;color:var(--gt)">%</span>'
      +'<button class="conta-del" onclick="deletarConta('+i+')"><i class="fa-solid fa-trash"></i></button>'
      +'</div>';
  }).join('');
  updateContaTotal();
}

function updateContaTotal() {
  var total=S.contas.reduce(function(a,c){ return a+c.pct; },0);
  var bar=el('contas_total_bar'),pctEl=el('contas_total_pct'); if(!bar||!pctEl) return;
  pctEl.innerText=total.toFixed(1)+'%';
  bar.style.background=total>100?'rgba(231,76,60,.1)':total===100?'rgba(39,174,96,.1)':'rgba(243,156,18,.1)';
  bar.style.color=total>100?'#a93226':total===100?'#1e8449':'#b7770d';
  var sob=el('contas_sobra_info');
  if(sob){ var s=Math.max(0,100-total); sob.innerText=s>0?'💡 '+s.toFixed(1)+'% distribuído automaticamente entre Reserva e Crescimento.':''; sob.style.display=s>0?'block':'none'; }
}

function addConta() {
  var nome=prompt('Nome da categoria:'); if(!nome) return;
  var grupo=prompt('Grupo:','Personalizado')||'Personalizado';
  S.contas.push({id:genUid(),nome:nome,grupo:grupo,pct:5,cor:CORES[S.contas.length%CORES.length]});
  renderContasList();
}

function deletarConta(i) { S.contas.splice(i,1); renderContasList(); }

/* ════════════════════════════════════════════
   PLANO DE DESPESAS
════════════════════════════════════════════ */
function renderDespesasList() { renderDespesasFixas(); renderDespesasVar(); updateDespesasTotais(); }

function renderDespesasFixas() {
  var cont=el('despesas_fixas_list'); if(!cont) return;
  cont.innerHTML=S.despesasFixas.map(function(d,i){
    return '<div class="dep-item">'
      +'<span class="dep-item-nome">'+d.nome+'</span>'
      +'<div class="dep-item-val"><input type="text" placeholder="R$ 0,00" value="'+(d._input||'')+'" '
      +'oninput="maskMoney(this);S.despesasFixas['+i+']._input=this.value;updateDespesasTotais();liveCalc()" '
      +'style="text-align:right;font-size:.82rem;padding:5px 8px"></div>'
      +'<button class="dep-del" onclick="deletarDespesaFixa('+i+')"><i class="fa-solid fa-trash"></i></button>'
      +'</div>';
  }).join('');
}

function renderDespesasVar() {
  var cont=el('despesas_var_list'); if(!cont) return;
  cont.innerHTML=S.despesasVar.map(function(d,i){
    var ph=d.tipo==='perc'?'%':'R$ 0,00';
    var fn=d.tipo==='perc'?'maskDec(this)':'maskMoney(this)';
    return '<div class="dep-item">'
      +'<span class="dep-item-nome">'+d.nome+' <span style="font-size:.65rem;color:var(--gt)">'+(d.tipo==='perc'?'(% fat.)':'(R$)')+'</span></span>'
      +'<div class="dep-item-val"><input type="text" placeholder="'+ph+'" value="'+(d._input||'')+'" '
      +'oninput="'+fn+';S.despesasVar['+i+']._input=this.value;updateDespesasTotais()" '
      +'style="text-align:right;font-size:.82rem;padding:5px 8px"></div>'
      +'<button class="dep-del" onclick="deletarDespesaVar('+i+')"><i class="fa-solid fa-trash"></i></button>'
      +'</div>';
  }).join('');
}

function updateDespesasTotais() {
  var t=totalDespesasFixas(), osMes=S.config.os_mes||20;
  if(el('dep_total_fixas')) el('dep_total_fixas').innerText=fmt(t);
  if(el('dep_por_os'))      el('dep_por_os').innerText=fmt(t/osMes);
  if(el('dep_total_anual')) el('dep_total_anual').innerText=fmtS(t*12);
}

function adicionarDespesaFixa() {
  var nome=prompt('Nome da despesa:'); if(!nome) return;
  S.despesasFixas.push({id:genUid(),nome:nome,valor:0,_input:''});
  renderDespesasFixas();
}
function adicionarDespesaVar() {
  var nome=prompt('Nome da despesa variável:'); if(!nome) return;
  var tipo=prompt('Tipo: "perc" ou "valor":','valor')||'valor';
  S.despesasVar.push({id:genUid(),nome:nome,valor:0,tipo:tipo,_input:''});
  renderDespesasVar();
}
function deletarDespesaFixa(i) { S.despesasFixas.splice(i,1); renderDespesasFixas(); updateDespesasTotais(); }
function deletarDespesaVar(i)  { S.despesasVar.splice(i,1);   renderDespesasVar();   updateDespesasTotais(); }

/* ════════════════════════════════════════════
   SIDEBAR
════════════════════════════════════════════ */
function abrirSidebar(tab) {
  tab=tab||'geral';
  el('sidebar_ov').classList.add('open');
  el('sidebar').classList.add('open');
  switchStab(tab);
}
function fecharSidebar() {
  el('sidebar_ov').classList.remove('open');
  el('sidebar').classList.remove('open');
  salvarConfigAtual();
}
function switchStab(tab) {
  ['geral','despesas','contas','metas','templates','empresa'].forEach(function(t){
    var d=el('stab_'+t); if(d) d.style.display=t===tab?'block':'none';
  });
  document.querySelectorAll('.stab').forEach(function(b,i){
    b.classList.toggle('active',['geral','despesas','contas','metas','templates','empresa'][i]===tab);
  });
}

function salvarConfigAtual() {
  if(!S.empresaAtiva) return;
  S.config.os_mes     = parseInt(el('cfg_os_mes')?el('cfg_os_mes').value:20)||20;
  S.config.margem_min = parseInt(el('cfg_margem_min')?el('cfg_margem_min').value:15)||15;
  SIMPLES_ALIQ.prod   = parseFloat(el('cfg_aliq_prod')?el('cfg_aliq_prod').value:4)||4;
  SIMPLES_ALIQ.serv   = parseFloat(el('cfg_aliq_serv')?el('cfg_aliq_serv').value:6)||6;
  S.metas.faturamento = parseMoney(el('meta_fat')?el('meta_fat').value:'')||0;
  S.metas.os_qtd      = parseInt(el('meta_os')?el('meta_os').value:0)||0;
  S.metas.lucro       = parseMoney(el('meta_lucro')?el('meta_lucro').value:'')||0;
  var nn=el('cfg_nome_negocio'); if(nn) S.empresaAtiva.nome=nn.value;
  var ta=el('cfg_atividade');    if(ta) S.empresaAtiva.tipo=ta.value;
  S.empresaAtiva.regime = el('cfg_regime_padrao')?el('cfg_regime_padrao').value:S.regime;
  try {
    DB.salvarEmpresa(S.empresaAtiva);
    DB.salvarConfig(S.empresaAtiva.id,{
      geral:S.config, contas:S.contas,
      despesasFixas:S.despesasFixas.map(function(d){ return Object.assign({},d,{valor:parseMoney(d._input)||d.valor}); }),
      despesasVar:S.despesasVar.map(function(d){ return Object.assign({},d,{valor:parseMoney(d._input)||d.valor}); }),
      metas:S.metas, simplexAliq:SIMPLES_ALIQ, regime:S.regime,
    });
  } catch(e){ console.warn('salvarConfig error',e); }
  if(el('hint_os_mes')) el('hint_os_mes').innerText=S.config.os_mes;
  renderEmpresaSelector();
}

/* ════════════════════════════════════════════
   MULTI-EMPRESA
════════════════════════════════════════════ */
function renderEmpresaSelector() {
  var sel=el('empresa_select'); if(!sel) return;
  sel.innerHTML=S.empresas.map(function(e){
    return '<option value="'+e.id+'"'+(e.id===S.empresaAtiva.id?' selected':'')+'>'+e.nome+'</option>';
  }).join('');
}

async function trocarEmpresa(id) {
  await salvarConfigAtual();
  S.empresaAtiva=S.empresas.find(function(e){ return e.id===id; });
  localStorage.setItem('fenix_empresa_ativa',id);
  await carregarEmpresa(id);
  renderContasList(); renderDespesasList(); renderTemplatesList(); atualizarDashboard(); liveCalc();
  showToast('Empresa "'+S.empresaAtiva.nome+'" selecionada','success');
}

async function adicionarEmpresa() {
  var nome=prompt('Nome da nova empresa:'); if(!nome) return;
  var emp=await DB.salvarEmpresa({nome:nome,tipo:'misto',regime:'simples',criadaEm:new Date().toISOString()});
  S.empresas.push(emp); renderEmpresaSelector(); await trocarEmpresa(emp.id);
  showToast('Empresa "'+nome+'" criada!','success');
}

async function deletarEmpresaAtiva() {
  if(S.empresas.length<=1){ showToast('É necessário ao menos uma empresa','error'); return; }
  if(!confirm('Apagar empresa "'+S.empresaAtiva.nome+'" e todos os seus dados?')) return;
  await DB.deletarEmpresa(S.empresaAtiva.id);
  S.empresas=S.empresas.filter(function(e){ return e.id!==S.empresaAtiva.id; });
  renderEmpresaSelector(); await trocarEmpresa(S.empresas[0].id);
  showToast('Empresa removida','success');
}

/* ════════════════════════════════════════════
   TEMPLATES
════════════════════════════════════════════ */
function renderTemplatesList() {
  var cont=el('templates_list'); if(!cont) return;
  if(!S.templates.length){
    cont.innerHTML='<div class="empty-list" style="padding:20px"><i class="fa-solid fa-clone"></i><p>Nenhum template salvo.<br>Calcule uma OS e clique em "Template".</p></div>';
    return;
  }
  cont.innerHTML=S.templates.map(function(t,i){
    return '<div class="template-item" onclick="_carregarTpl('+i+')">'
      +'<div class="template-icon">'+(t.icone||'📋')+'</div>'
      +'<div style="flex:1"><div class="template-nome">'+t.nome+'</div>'
      +'<div class="template-sub">'+fmtD((t.createdAt||'').split('T')[0])+'</div></div>'
      +'<div class="template-preco">'+fmt(t.precoRef||0)+'</div>'
      +'<button class="template-del" onclick="event.stopPropagation();deletarTemplate(\''+t.id+'\')"><i class="fa-solid fa-trash"></i></button>'
      +'</div>';
  }).join('');
}

function _carregarTpl(i){ carregarTemplate(S.templates[i]); }

function carregarTemplate(tpl) {
  var d=tpl.dados;
  ['cmv','mob','insumos','infra','prolabore','comis_val','lucro_val'].forEach(function(id){
    if(d[id]&&el(id)) el(id).value=d[id];
  });
  if(d.regime) setRegime(d.regime);
  if(d.tipos) S.tipos=Object.assign({},d.tipos);
  if(d.comisBase) S.comisBase=Object.assign({},d.comisBase);
  if(d.mobTipo) setMobTipo(d.mobTipo);
  ['lucro','comis'].forEach(function(c){
    var btn=el('btn_'+c),isP=S.tipos[c]==='perc';
    if(btn){ btn.innerHTML=isP?'%':'<i class="fa-solid fa-dollar-sign"></i>'; btn.classList.toggle('active',isP); }
  });
  Object.keys(S.comisBase).forEach(function(k){ var t=el('tag_'+k); if(t) t.classList.toggle('on',S.comisBase[k]); });
  if(el('os_num')) el('os_num').value=gerarNumOS();
  if(el('os_data')) el('os_data').value=new Date().toISOString().split('T')[0];
  fecharSidebar(); liveCalc();
  showToast('Template "'+tpl.nome+'" carregado!','success');
}

async function salvarTemplate() {
  if(!S.resultado){ showToast('Calcule antes de salvar como template','error'); return; }
  var nome=prompt('Nome do template:'); if(!nome) return;
  var t={
    id:genUid(), nome:nome, icone:'📋', createdAt:new Date().toISOString(), precoRef:S.resultado.precoFinal,
    dados:{
      cmv:el('cmv')?el('cmv').value:'', mob:el('mob')?el('mob').value:'',
      insumos:el('insumos')?el('insumos').value:'', infra:el('infra')?el('infra').value:'',
      prolabore:el('prolabore')?el('prolabore').value:'',
      comis_val:el('comis_val')?el('comis_val').value:'', lucro_val:el('lucro_val')?el('lucro_val').value:'',
      regime:S.regime, tipos:Object.assign({},S.tipos), comisBase:Object.assign({},S.comisBase), mobTipo:S.mobTipo,
    },
  };
  try { var saved=await DB.salvarTemplate(S.empresaAtiva.id,t); S.templates.push(saved); }
  catch(e){ S.templates.push(t); }
  renderTemplatesList(); showToast('Template "'+nome+'" salvo!','success');
}

async function deletarTemplate(id) {
  if(!confirm('Remover este template?')) return;
  try { await DB.deletarTemplate(id); } catch(e){}
  S.templates=S.templates.filter(function(t){ return t.id!==id; });
  renderTemplatesList(); showToast('Template removido','success');
}

/* ════════════════════════════════════════════
   ARQUIVO DE OS
════════════════════════════════════════════ */
function abrirArquivo()  { renderStats(); renderLista(); el('modal_arquivo').classList.add('open'); }
function fecharArquivo() { el('modal_arquivo').classList.remove('open'); }
function atualizarBadge(){ var e=el('badge_cnt'); if(e) e.innerText=S.banco.length||''; }

function renderStats() {
  var t=S.banco.length,v=S.banco.reduce(function(a,x){ return a+(x.precoFinal||0); },0);
  var l=S.banco.reduce(function(a,x){ return a+(x.lucro?x.lucro.valor:0)||0; },0);
  if(el('stat_total')) el('stat_total').innerText=t;
  if(el('stat_vol'))   el('stat_vol').innerText=fmtS(v);
  if(el('stat_med'))   el('stat_med').innerText=t?fmtS(v/t):'R$ 0';
  if(el('stat_lucro_total')) el('stat_lucro_total').innerText=fmtS(l);
}

function renderLista() {
  renderStats();
  var q=(el('search_os')?el('search_os').value:'').toLowerCase();
  var fs=el('filter_saude')?el('filter_saude').value:'';
  var lista=S.banco.slice().sort(function(a,b){ return new Date(b.geradoEm||b.data)-new Date(a.geradoEm||a.data); });
  if(q) lista=lista.filter(function(x){ return (x.osNum||'').toLowerCase().includes(q)||(x.cliente?x.cliente.nome:'').toLowerCase().includes(q); });
  if(fs) lista=lista.filter(function(x){ return x.saudeMargem===fs; });
  var total=lista.length,pages=Math.ceil(total/POR_PAG)||1;
  if(S.pagina>pages) S.pagina=1;
  var slice=lista.slice((S.pagina-1)*POR_PAG,S.pagina*POR_PAG);
  if(el('lista_info')) el('lista_info').innerText=total+' registro'+(total!==1?'s':'');
  var cont=el('os_list'); if(!cont) return;
  if(!slice.length){
    cont.innerHTML='<div class="empty-list"><i class="fa-solid fa-box-open"></i><p>'+(S.banco.length?'Nenhuma OS encontrada.':'Nenhuma OS salva ainda!')+'</p></div>';
  } else {
    cont.innerHTML=slice.map(function(os){
      var hc=os.saudeMargem==='Saudável'?'#27ae60':os.saudeMargem==='Apertado'?'#f39c12':'#e74c3c';
      var uid=os.uid||os.osNum;
      return '<div class="os-item" onclick="carregarOS(\''+uid+'\')">'+
        '<div class="on">'+os.osNum+'</div>'+
        '<div class="om"><div class="oc">'+((os.cliente&&os.cliente.nome)||'(sem cliente)')+'</div>'+
        '<div class="od">'+fmtD(os.data)+(os.descricao?' · '+os.descricao.substring(0,28):'')+'</div></div>'+
        '<div class="op">'+fmt(os.precoFinal||0)+'</div>'+
        '<div class="oh" style="background:'+hc+'" title="'+os.saudeMargem+'"></div>'+
        '<div class="oa">'+
          '<button class="oa-btn dup" onclick="event.stopPropagation();carregarOSeDuplicar(\''+uid+'\')"><i class="fa-solid fa-copy"></i></button>'+
          '<button class="oa-btn del" onclick="event.stopPropagation();deletarOS(\''+uid+'\')"><i class="fa-solid fa-trash"></i></button>'+
        '</div></div>';
    }).join('');
  }
  var pg=el('pagination'); if(!pg) return;
  var pgHtml='';
  for(var i=1;i<=pages;i++) pgHtml+='<button class="pg-btn'+(i===S.pagina?' active':'')+'" onclick="S.pagina='+i+';renderLista()">'+i+'</button>';
  pg.innerHTML=pgHtml;
}

async function salvarOS() {
  if(!S.resultado){ showToast('Calcule antes de salvar','error'); return; }
  var r=S.resultado;
  var os={
    versao:'4.1', osNum:r.osNum, data:r.osData, geradoEm:r.geradoEm,
    cliente:{nome:r.cliente||'',whatsapp:r.clienteTel||''}, descricao:r.osDesc||'',
    custos:{cmv:r.cmv,mob:r.mob,mobPropria:r.mobPropria,insumos:r.insumos,infra:r.infra,prolabore:r.prolabore,total:r.custoTotal},
    comissao:{valor:r.vComis,base:r.baseLabel,baseValor:r.baseComis},
    impostos:{regime:r.regime,aliqEf:r.aliqEf,valor:r.vImp},
    lucro:{percentual:r.lucroPerc,valor:r.vLucro},
    precoFinal:r.precoFinal, saudeMargem:r.saude,
  };
  try {
    var saved=await DB.salvarOS(S.empresaAtiva.id,os);
    var idx=S.banco.findIndex(function(x){ return x.osNum===os.osNum; });
    if(idx>=0) S.banco[idx]=saved; else S.banco.unshift(saved);
  } catch(e){ var idx2=S.banco.findIndex(function(x){ return x.osNum===os.osNum; }); if(idx2>=0) S.banco[idx2]=os; else S.banco.unshift(os); }
  atualizarBadge(); atualizarDashboard(); exportarOSArquivo(os);
  showToast('OS '+os.osNum+' salva!','success');
}

function exportarOSArquivo(os) {
  var b=new Blob([JSON.stringify(os,null,2)],{type:'application/json'});
  var a=document.createElement('a'); a.href=URL.createObjectURL(b);
  a.download='OS_'+os.osNum+'_'+((os.cliente&&os.cliente.nome||'SemNome').replace(/\s+/g,'_'))+'.json';
  a.click(); URL.revokeObjectURL(a.href);
}

function duplicarOS() {
  if(!S.resultado){ showToast('Calcule antes de duplicar','error'); return; }
  if(el('os_num'))  el('os_num').value  = gerarNumOS();
  if(el('os_data')) el('os_data').value = new Date().toISOString().split('T')[0];
  if(el('cliente')) el('cliente').value = '';
  S.resultado=null;
  if(el('breakdown_wrap')) el('breakdown_wrap').style.display='none';
  if(el('live_rows'))      el('live_rows').style.display='flex';
  liveCalc(); showToast('OS duplicada! Preencha os novos dados.','success');
}

function gerarNumOS() {
  return new Date().getFullYear()+'-'+String(S.banco.length+1).padStart(3,'0');
}

async function carregarOS(uid) {
  var os=S.banco.find(function(x){ return (x.uid||x.osNum)===uid; }); if(!os) return;
  function sm(id,v){ if(!v||!el(id)) return; var s=String(Math.round(v*100)); el(id).value='R$ '+(parseInt(s,10)/100).toFixed(2).replace('.',',').replace(/\B(?=(\d{3})+(?!\d))/g,'.'); }
  if(el('os_num')) el('os_num').value=os.osNum||'';
  if(el('os_data')) el('os_data').value=os.data||'';
  if(el('cliente')) el('cliente').value=(os.cliente&&os.cliente.nome)||'';
  if(el('cliente_tel')) el('cliente_tel').value=(os.cliente&&os.cliente.whatsapp)||'';
  if(el('os_desc')) el('os_desc').value=os.descricao||'';
  sm('cmv',os.custos&&os.custos.cmv); sm('mob',os.custos&&(os.custos.mob||os.custos.mobPropria));
  sm('insumos',os.custos&&os.custos.insumos); sm('infra',os.custos&&os.custos.infra); sm('prolabore',os.custos&&os.custos.prolabore);
  if(os.impostos&&os.impostos.regime) setRegime(os.impostos.regime);
  fecharArquivo(); liveCalc(); showToast('OS '+os.osNum+' carregada!','success');
}

function carregarOSeDuplicar(uid) {
  carregarOS(uid).then(function(){
    setTimeout(function(){ if(el('os_num')) el('os_num').value=gerarNumOS(); if(el('os_data')) el('os_data').value=new Date().toISOString().split('T')[0]; liveCalc(); showToast('OS duplicada!','success'); },300);
  });
}

async function exportarBanco() {
  if(!S.banco.length){ showToast('Nenhuma OS para exportar','error'); return; }
  var b=new Blob([JSON.stringify({versao:'4.1',exportadoEm:new Date().toISOString(),total:S.banco.length,os:S.banco},null,2)],{type:'application/json'});
  var a=document.createElement('a'); a.href=URL.createObjectURL(b);
  a.download='fenix_'+(S.empresaAtiva.nome||'banco').replace(/\s+/g,'_')+'_'+new Date().toISOString().slice(0,10)+'.json';
  a.click(); URL.revokeObjectURL(a.href); showToast(S.banco.length+' OS exportadas!','success');
}

async function importarJSON(input) {
  var file=input.files[0]; if(!file) return;
  var reader=new FileReader();
  reader.onload=async function(e){
    try{
      var d=JSON.parse(e.target.result);
      var itens=d.os&&Array.isArray(d.os)?d.os:d.osNum?[d]:null;
      if(!itens){ showToast('JSON inválido','error'); return; }
      var add=0,upd=0;
      for(var i=0;i<itens.length;i++){
        var os=itens[i]; os.empresaId=S.empresaAtiva.id; if(!os.uid) os.uid=genUid();
        try{ await DB.salvarOS(S.empresaAtiva.id,os); }catch(e2){}
        var idx=S.banco.findIndex(function(x){ return x.osNum===os.osNum; });
        if(idx>=0){ S.banco[idx]=os; upd++; } else { S.banco.unshift(os); add++; }
      }
      atualizarBadge(); renderLista(); atualizarDashboard();
      showToast(add+' novos, '+upd+' atualizados','success');
    }catch(err){ showToast('Erro ao ler o JSON','error'); }
  };
  reader.readAsText(file); input.value='';
}

async function limparBanco() {
  if(!S.banco.length){ showToast('Arquivo já vazio','error'); return; }
  if(!confirm('Apagar TODAS as '+S.banco.length+' OS?')) return;
  for(var i=0;i<S.banco.length;i++){ try{ await DB.deletarOS(S.banco[i].uid||S.banco[i].osNum); }catch(e){} }
  S.banco=[]; atualizarBadge(); renderLista(); atualizarDashboard(); showToast('Banco limpo','success');
}

async function deletarOS(uid) {
  if(!confirm('Remover esta OS?')) return;
  try{ await DB.deletarOS(uid); }catch(e){}
  S.banco=S.banco.filter(function(x){ return (x.uid||x.osNum)!==uid; });
  atualizarBadge(); renderLista(); atualizarDashboard(); showToast('OS removida','success');
}

/* ════════════════════════════════════════════
   RELATÓRIO
════════════════════════════════════════════ */
function abrirRelatorio() { renderRelatorio(); el('modal_relatorio').classList.add('open'); }

function renderRelatorio() {
  var de=el('rel_de')?el('rel_de').value:'', ate=el('rel_ate')?el('rel_ate').value:'';
  var lista=S.banco.filter(function(os){ return (!de||os.data>=de)&&(!ate||os.data<=ate); })
                   .sort(function(a,b){ return new Date(b.data)-new Date(a.data); });
  var fat=lista.reduce(function(a,x){ return a+(x.precoFinal||0); },0);
  var lucro=lista.reduce(function(a,x){ return a+(x.lucro?x.lucro.valor:0)||0; },0);
  var imp=lista.reduce(function(a,x){ return a+(x.impostos?x.impostos.valor:0)||0; },0);
  var ticket=lista.length?fat/lista.length:0;
  var margem=fat>0?lucro/fat*100:0;
  if(el('rel_os_cnt'))  el('rel_os_cnt').innerText=lista.length;
  if(el('rel_fat'))     el('rel_fat').innerText=fmtS(fat);
  if(el('rel_lucro'))   el('rel_lucro').innerText=fmtS(lucro);
  if(el('rel_imp'))     el('rel_imp').innerText=fmtS(imp);
  if(el('rel_ticket'))  el('rel_ticket').innerText=fmtS(ticket);
  if(el('rel_margem'))  { el('rel_margem').innerText=margem.toFixed(1)+'%'; el('rel_margem').style.color=margem>=20?'#1e8449':margem>=10?'#b7770d':'#a93226'; }
  renderMetasRelatorio(fat,lista.length,lucro);
  var cont=el('rel_lista'); if(!cont) return;
  cont.innerHTML=!lista.length
    ?'<div class="empty-list"><i class="fa-solid fa-calendar-xmark"></i><p>Nenhuma OS no período.</p></div>'
    :lista.map(function(os){
      var hc=os.saudeMargem==='Saudável'?'#27ae60':os.saudeMargem==='Apertado'?'#f39c12':'#e74c3c';
      var m=os.precoFinal>0?((os.lucro?os.lucro.valor:0)/os.precoFinal*100):0;
      return '<div class="rel-os-row"><span style="font-family:\'Syne\',sans-serif;font-weight:700;color:var(--p)">'+os.osNum+'</span>'
        +'<span style="color:var(--gt)">'+((os.cliente&&os.cliente.nome)||'—')+' · '+fmtD(os.data)+'</span>'
        +'<span style="font-weight:700">'+fmt(os.precoFinal||0)+'</span>'
        +'<span style="font-weight:700;color:'+hc+'">'+m.toFixed(1)+'%</span></div>';
    }).join('');
}

function renderMetasRelatorio(fat,osQtd,lucro) {
  var cont=el('rel_metas'); if(!cont) return;
  var metas=[
    {label:'Faturamento',icon:'fa-chart-line',cor:'#2980b9',atual:fat,   meta:S.metas.faturamento||0,isMoney:true},
    {label:'Qtd. OS',    icon:'fa-file-invoice',cor:'#8e44ad',atual:osQtd,meta:S.metas.os_qtd||0,    isMoney:false},
    {label:'Lucro',      icon:'fa-piggy-bank', cor:'#27ae60',atual:lucro, meta:S.metas.lucro||0,      isMoney:true},
  ];
  cont.innerHTML=metas.map(function(m){
    var pct=m.meta>0?Math.min(m.atual/m.meta*100,100):0;
    var cor=pct>=100?'#27ae60':pct>=70?'#f39c12':'#e74c3c';
    return '<div class="meta-card">'
      +'<div class="meta-header"><span class="meta-label"><i class="fa-solid '+m.icon+'" style="color:'+m.cor+'"></i>'+m.label+'</span><span class="meta-pct" style="color:'+cor+'">'+pct.toFixed(0)+'%</span></div>'
      +'<div class="meta-bar"><div class="meta-fill" style="background:'+cor+';width:'+pct+'%"></div></div>'
      +'<div class="meta-sub"><span>Atual: <strong>'+(m.isMoney?fmtS(m.atual):m.atual)+'</strong></span><span>Meta: <strong>'+(m.isMoney?fmtS(m.meta):m.meta||'—')+'</strong></span></div>'
      +'</div>';
  }).join('');
}

function exportarRelatorio() {
  var de=el('rel_de')?el('rel_de').value:'', ate=el('rel_ate')?el('rel_ate').value:'';
  var lista=S.banco.filter(function(os){ return (!de||os.data>=de)&&(!ate||os.data<=ate); });
  var b=new Blob([JSON.stringify({periodo:{de:de,ate:ate},os:lista},null,2)],{type:'application/json'});
  var a=document.createElement('a'); a.href=URL.createObjectURL(b);
  a.download='fenix_relatorio_'+de+'_'+ate+'.json'; a.click(); URL.revokeObjectURL(a.href);
  showToast('Relatório exportado!','success');
}

/* ════════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════════ */
function atualizarDashboard() {
  var hoje=new Date();
  var d1=new Date(hoje.getFullYear(),hoje.getMonth(),1).toISOString().split('T')[0];
  var d2=hoje.toISOString().split('T')[0];
  var osMes=S.banco.filter(function(o){ return o.data>=d1&&o.data<=d2; });
  var fat=osMes.reduce(function(a,o){ return a+(o.precoFinal||0); },0);
  var lucro=osMes.reduce(function(a,o){ return a+(o.lucro?o.lucro.valor:0)||0; },0);
  var margem=fat>0?lucro/fat*100:0;
  var semMargem=margem>=20?'#27ae60':margem>=(S.config.margem_min||15)?'#f39c12':'#e74c3c';
  var metaFat=S.metas.faturamento||0;
  var semMeta=metaFat>0?(fat/metaFat>=1?'#27ae60':fat/metaFat>=.7?'#f39c12':'#e74c3c'):'#9ca3af';
  var totalFixo=totalDespesasFixas();
  var semFixos=totalFixo>0?(fat>=totalFixo?'#27ae60':fat>=totalFixo*.7?'#f39c12':'#e74c3c'):'#9ca3af';
  if(el('dash_fat'))    el('dash_fat').innerText=fmtS(fat);
  if(el('dash_os'))     el('dash_os').innerText=osMes.length;
  if(el('dash_lucro'))  el('dash_lucro').innerText=fmtS(lucro);
  if(el('dash_margem')) el('dash_margem').innerText=margem.toFixed(1)+'%';
  if(el('sem_margem'))  el('sem_margem').style.background=semMargem;
  if(el('sem_meta'))    el('sem_meta').style.background=semMeta;
  if(el('sem_fixos'))   el('sem_fixos').style.background=semFixos;
}

/* ════════════════════════════════════════════
   RASCUNHO
════════════════════════════════════════════ */
function salvarRascunho() {
  try {
    var ids=['os_num','os_data','cliente','cliente_tel','os_desc','cmv','mob','insumos','infra','prolabore','comis_val','lucro_val','imposto_manual'];
    var dados={};
    ids.forEach(function(id){ var e=el(id); if(e) dados[id]=e.value; });
    dados.tipos=S.tipos; dados.comisBase=S.comisBase; dados.regime=S.regime; dados.mobTipo=S.mobTipo;
    localStorage.setItem('fenix_rascunho_'+(S.empresaAtiva?S.empresaAtiva.id:'def'), JSON.stringify(dados));
  } catch(e){}
}

function carregarRascunho() {
  try {
    var d=JSON.parse(localStorage.getItem('fenix_rascunho_'+(S.empresaAtiva?S.empresaAtiva.id:'def'))||'null');
    if(!d) return;
    ['os_num','os_data','cliente','cliente_tel','os_desc','cmv','mob','insumos','infra','prolabore','comis_val','lucro_val','imposto_manual'].forEach(function(id){ if(d[id]&&el(id)) el(id).value=d[id]; });
    if(d.tipos) S.tipos=d.tipos;
    if(d.comisBase){ S.comisBase=d.comisBase; Object.keys(d.comisBase).forEach(function(k){ var t=el('tag_'+k); if(t) t.classList.toggle('on',d.comisBase[k]); }); }
    if(d.regime) setRegime(d.regime);
    if(d.mobTipo) setMobTipo(d.mobTipo);
    ['lucro','comis'].forEach(function(c){ var btn=el('btn_'+c),isP=S.tipos[c]==='perc'; if(btn){ btn.innerHTML=isP?'%':'<i class="fa-solid fa-dollar-sign"></i>'; btn.classList.toggle('active',isP); } });
  } catch(e){}
}

/* ════════════════════════════════════════════
   RESET
════════════════════════════════════════════ */
function resetForm() {
  ['cmv','mob','insumos','infra','prolabore','comis_val','lucro_val','imposto_manual'].forEach(function(id){ var e=el(id); if(e) e.value=''; });
  if(el('os_num'))  el('os_num').value=gerarNumOS();
  if(el('os_data')) el('os_data').value=new Date().toISOString().split('T')[0];
  if(el('cliente'))    el('cliente').value='';
  if(el('cliente_tel'))el('cliente_tel').value='';
  if(el('os_desc'))    el('os_desc').value='';
  document.querySelectorAll('input').forEach(function(i){ i.classList.remove('error'); });
  document.querySelectorAll('.field-error').forEach(function(e){ e.classList.remove('show'); });
  S.tipos={lucro:'perc',comis:'perc'}; S.comisBase={cmv:false,mob:false};
  ['lucro','comis'].forEach(function(c){ var btn=el('btn_'+c); if(btn){ btn.innerHTML='%'; btn.classList.add('active'); } var inp=el(c+'_val'); if(inp) inp.placeholder='0,00'; });
  ['tag_cmv','tag_mob'].forEach(function(id){ var t=el(id); if(t) t.classList.remove('on'); });
  S.resultado=null;
  if(el('breakdown_wrap')) el('breakdown_wrap').style.display='none';
  if(el('live_rows'))      el('live_rows').style.display='flex';
  try{ localStorage.removeItem('fenix_rascunho_'+(S.empresaAtiva?S.empresaAtiva.id:'def')); }catch(e){}
  liveCalc(); showToast('Formulário limpo!','success');
}

function resetTudo() {
  if(!confirm('Apagar TODOS os dados do Fênix?')) return;
  localStorage.clear();
  location.reload();
}

/* ════════════════════════════════════════════
   PDF
════════════════════════════════════════════ */
function gerarPDF() {
  if(!S.resultado) return;
  var r=S.resultado;
  if(!window.jspdf){ showToast('jsPDF não carregado','error'); return; }
  var doc=new window.jspdf.jsPDF({unit:'mm',format:'a4'});
  var W=doc.internal.pageSize.getWidth(), y=0;
  doc.setFillColor(4,18,115); doc.rect(0,0,W,44,'F');
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(22);
  doc.text((S.empresaAtiva?S.empresaAtiva.nome:'FÊNIX'),15,18);
  doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(170,185,255);
  doc.text('Precificação Inteligente v4.1',15,26);
  doc.setTextColor(255,255,255); doc.setFontSize(8.5);
  doc.text('OS: '+r.osNum,W-15,13,{align:'right'});
  doc.text('Data: '+fmtD(r.osData),W-15,20,{align:'right'});
  doc.text('Cliente: '+(r.cliente||'—'),W-15,27,{align:'right'});
  if(r.clienteTel) doc.text('WhatsApp: '+r.clienteTel,W-15,34,{align:'right'});
  y=52;
  if(r.osDesc){ doc.setFillColor(248,249,254); doc.roundedRect(15,y,W-30,10,2,2,'F'); doc.setFont('helvetica','italic'); doc.setFontSize(8.5); doc.setTextColor(100,100,120); doc.text(r.osDesc.substring(0,90),18,y+6.5); y+=14; }
  doc.setFillColor(240,243,255); doc.roundedRect(15,y,W-30,24,4,4,'F');
  doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(4,18,115);
  doc.text('PREÇO SUGERIDO AO CLIENTE',W/2,y+8,{align:'center'});
  doc.setFontSize(20); doc.text(fmt(r.precoFinal),W/2,y+19,{align:'center'});
  y+=32;
  doc.setFontSize(9); doc.setFont('helvetica','bold'); doc.setTextColor(120,125,150);
  doc.text('COMPOSIÇÃO DO PREÇO',15,y); y+=2;
  doc.setDrawColor(210,215,230); doc.setLineWidth(0.4); doc.line(15,y,W-15,y); y+=6;
  var itens=[
    {l:'Produto / CMV',          v:r.cmv,       c:[41,128,185]},
    {l:'Mão de Obra',            v:r.mob+r.mobPropria,c:[26,82,118]},
    {l:'Insumos / Consumíveis',  v:r.insumos,   c:[22,160,133]},
    {l:'Infraestrutura rateada', v:r.infra,      c:[14,102,85]},
    {l:'Pró-labore rateado',     v:r.prolabore,  c:[30,132,73]},
    {l:'Comissão ('+r.baseLabel+')',v:r.vComis,  c:[142,68,173]},
    {l:'Impostos ('+regLbl(r.regime)+')',v:r.vImp,c:[231,76,60]},
    {l:'Lucro Real',             v:r.vLucro,     c:[39,174,96]},
  ].filter(function(x){ return x.v>0; });
  itens.forEach(function(it,i){
    if(y>245) return;
    var p=(it.v/r.precoFinal*100).toFixed(1);
    if(i%2===0){ doc.setFillColor(248,249,254); doc.rect(15,y-4,W-30,10,'F'); }
    doc.setFillColor(it.c[0],it.c[1],it.c[2]); doc.circle(20,y+1,2,'F');
    doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(50,50,60); doc.text(it.l,26,y+2);
    doc.setTextColor(150,155,165); doc.setFontSize(8.5); doc.text(p+'%',W/2,y+2,{align:'center'});
    doc.setFont('helvetica','bold'); doc.setFontSize(9.5); doc.setTextColor(it.c[0],it.c[1],it.c[2]); doc.text(fmt(it.v),W-15,y+2,{align:'right'});
    doc.setFillColor(215,220,230); doc.roundedRect(15,y+4.2,W-30,2,1,1,'F');
    doc.setFillColor(it.c[0],it.c[1],it.c[2]); doc.roundedRect(15,y+4.2,(W-30)*(parseFloat(p)/100),2,1,1,'F');
    y+=14;
  });
  y+=4; doc.setDrawColor(210,215,230); doc.line(15,y,W-15,y); y+=7;
  var lp=r.lucroPerc,hL,hRGB;
  if(lp>=20){hL='Margem Saudável ✓';hRGB=[39,174,96];}else if(lp>=(S.config.margem_min||15)){hL='Margem Apertada ⚠';hRGB=[243,156,18];}else{hL='Margem Perigosa ✗';hRGB=[231,76,60];}
  doc.setFillColor(hRGB[0]*.15+240,hRGB[1]*.15+240,hRGB[2]*.15+240); doc.roundedRect(15,y,80,10,2,2,'F');
  doc.setTextColor(hRGB[0],hRGB[1],hRGB[2]); doc.setFont('helvetica','bold'); doc.setFontSize(8.5); doc.text(hL,55,y+6.5,{align:'center'});
  doc.setTextColor(80,80,100); doc.setFont('helvetica','normal'); doc.text('Lucro: '+lp.toFixed(1)+'% sobre o preço final',W-15,y+6.5,{align:'right'});
  y+=16;
  doc.setFillColor(4,18,115); doc.roundedRect(15,y,W-30,12,3,3,'F');
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(10);
  doc.text('PREÇO FINAL DE VENDA',22,y+7.5); doc.text(fmt(r.precoFinal),W-15,y+7.5,{align:'right'});
  doc.setDrawColor(200,205,220); doc.setLineWidth(0.3); doc.line(15,270,W-15,270);
  doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(170,175,185);
  doc.text('© Cristiano Fênix — 2026 | Fênix Soluções Tecnológicas',W/2,276,{align:'center'});
  doc.text('Gerado em '+new Date().toLocaleDateString('pt-BR')+' às '+new Date().toLocaleTimeString('pt-BR'),W/2,281,{align:'center'});
  doc.save('OS_'+r.osNum+'_'+(r.cliente||'SemNome').replace(/\s+/g,'_')+'.pdf');
  showToast('PDF gerado!','success');
}

/* ════════════════════════════════════════════
   WHATSAPP
════════════════════════════════════════════ */
function enviarWhatsApp() {
  if(!S.resultado) return;
  var r=S.resultado, lp=r.lucroPerc, hE=lp>=20?'🟢':lp>=10?'🟡':'🔴';
  var linhas=[];
  if(r.cmv>0)         linhas.push('📦 Produto/CMV:    '+fmt(r.cmv)+' ('+(r.cmv/r.precoFinal*100).toFixed(1)+'%)');
  if(r.mob+r.mobPropria>0) linhas.push('👷 Mão de Obra:    '+fmt(r.mob+r.mobPropria)+' ('+((r.mob+r.mobPropria)/r.precoFinal*100).toFixed(1)+'%)');
  if(r.insumos>0)     linhas.push('🧪 Insumos:        '+fmt(r.insumos)+' ('+(r.insumos/r.precoFinal*100).toFixed(1)+'%)');
  if(r.vComis>0)      linhas.push('🤝 Comissão:       '+fmt(r.vComis)+' ('+(r.vComis/r.precoFinal*100).toFixed(1)+'%)');
  linhas.push('🏛️ Impostos:       '+fmt(r.vImp)+' ('+(r.vImp/r.precoFinal*100).toFixed(1)+'%)');
  linhas.push('📈 Lucro Real:     '+fmt(r.vLucro)+' ('+lp.toFixed(1)+'%)');
  var msg='🔥 *'+(S.empresaAtiva?S.empresaAtiva.nome:'FÊNIX')+' — PRECIFICAÇÃO*\n'
    +'━━━━━━━━━━━━━━━━━\n📋 *OS:* '+r.osNum+'  👤 *'+(r.cliente||'—')+'*\n📅 '+fmtD(r.osData)+(r.osDesc?'\n📝 '+r.osDesc:'')+'\n'
    +'━━━━━━━━━━━━━━━━━\n💰 *Preço: '+fmt(r.precoFinal)+'*\n━━━━━━━━━━━━━━━━━\n'
    +linhas.join('\n')+'\n━━━━━━━━━━━━━━━━━\n'
    +hE+' Margem: '+(lp>=20?'Saudável ✓':lp>=10?'Apertada ⚠':'Perigosa ✗')+'\n_Fênix Soluções Tecnológicas_';
  var tel=r.clienteTel.replace(/\D/g,'');
  window.open((tel.length>=10?'https://wa.me/55'+tel:'https://wa.me/')+'?text='+encodeURIComponent(msg),'_blank');
  showToast('Abrindo WhatsApp...','success');
}

/* ════════════════════════════════════════════
   ONBOARDING
════════════════════════════════════════════ */
var _obStep=0;
var OB_STEPS=[
  { icon:'🔥', title:'Bem-vindo ao Fênix!',
    sub:'Sistema completo de precificação e gestão financeira. Configure em 4 passos rápidos.',
    render:function(){ return '<div class="ob-field"><label>Nome do seu negócio</label><input type="text" id="ob_nome" placeholder="Ex: Fênix Tech" value="'+(S.empresaAtiva?S.empresaAtiva.nome:'')+'"></div>'
      +'<div class="ob-field"><label>Tipo de atividade</label><select id="ob_tipo"><option value="misto">Misto</option><option value="comercio">Comércio</option><option value="servico">Serviço</option></select></div>'; },
    save:function(){ var n=el('ob_nome'),t=el('ob_tipo'); if(n&&S.empresaAtiva) S.empresaAtiva.nome=n.value; if(t&&S.empresaAtiva) S.empresaAtiva.tipo=t.value; }
  },
  { icon:'🏛️', title:'Regime tributário?',
    sub:'Define como calculamos os impostos. Pode alterar nas configurações a qualquer momento.',
    render:function(){
      var opts=[['mei','MEI','Microempreendedor Individual'],['simples','Simples Nacional','4% Comércio / 6% Serviço'],['carneo','Carnê-Leão','Pessoa Física / Autônomo'],['manual','Manual','Defino eu mesmo']];
      return '<div class="ob-regime-grid">'+opts.map(function(o){ return '<div class="ob-regime-opt'+(S.regime===o[0]?' sel':'')+'" onclick="document.querySelectorAll(\'.ob-regime-opt\').forEach(function(x){x.classList.remove(\'sel\')});this.classList.add(\'sel\');S.regime=\''+o[0]+'\'"><div class="ot">'+o[1]+'</div><div class="os_">'+o[2]+'</div></div>'; }).join('')+'</div>';
    },
    save:function(){ S.config.regime_padrao=S.regime; if(S.empresaAtiva) S.empresaAtiva.regime=S.regime; }
  },
  { icon:'📊', title:'Parâmetros do negócio',
    sub:'Usados para rateios, ponto de equilíbrio e metas.',
    render:function(){ return '<div class="ob-field"><label>Média de OS por mês</label><input type="number" id="ob_os_mes" value="'+(S.config.os_mes||20)+'" style="font-size:1.1rem;text-align:center;padding:10px"></div>'
      +'<div class="ob-field"><label>Margem mínima aceitável (%)</label><input type="number" id="ob_margem" value="'+(S.config.margem_min||15)+'" style="font-size:1.1rem;text-align:center;padding:10px"></div>'
      +'<div class="ob-field"><label>Meta de faturamento mensal (R$)</label><input type="text" id="ob_meta_fat" placeholder="R$ 0,00" oninput="maskMoney(this)"></div>'; },
    save:function(){ S.config.os_mes=parseInt(el('ob_os_mes')?el('ob_os_mes').value:20)||20; S.config.margem_min=parseInt(el('ob_margem')?el('ob_margem').value:15)||15; S.metas.faturamento=parseMoney(el('ob_meta_fat')?el('ob_meta_fat').value:'')||0; }
  },
  { icon:'🎯', title:'Tudo pronto!',
    sub:'O Fênix está configurado. Explore o Plano de Despesas nas Configurações para ter visão financeira completa.',
    render:function(){ return '<div style="text-align:center;padding:10px 0"><div style="font-size:3rem;margin-bottom:12px">🚀</div><p style="font-size:.9rem;color:var(--gt);line-height:1.7"><strong>'+(S.empresaAtiva?S.empresaAtiva.nome:'Seu Negócio')+'</strong><br>Regime: <strong>'+regLbl(S.regime)+'</strong><br>OS/mês: <strong>'+S.config.os_mes+'</strong><br>Margem mínima: <strong>'+S.config.margem_min+'%</strong></p></div>'; },
    save:function(){}
  }
];

function abrirOnboarding() {
  _obStep=0; var ov=el('onboard_ov'); if(ov) ov.style.display='flex'; renderObStep();
}
function renderObStep() {
  var step=OB_STEPS[_obStep];
  for(var i=0;i<OB_STEPS.length;i++){ var d=el('ob_d'+i); if(d) d.classList.toggle('active',i===_obStep); }
  var isLast=_obStep===OB_STEPS.length-1;
  var cont=el('ob_content'); if(!cont) return;
  cont.innerHTML='<div class="ob-icon">'+step.icon+'</div>'
    +'<div class="ob-title">'+step.title+'</div>'
    +'<div class="ob-sub">'+step.sub+'</div>'
    +step.render()
    +'<div class="ob-actions">'
    +(_obStep>0?'<button class="ob-btn ob-btn-skip" onclick="obNav(-1)">← Voltar</button>':'<button class="ob-btn ob-btn-skip" onclick="fecharOnboarding()">Pular</button>')
    +'<button class="ob-btn ob-btn-primary" onclick="obNav(1)">'+(isLast?'Começar! 🔥':'Próximo →')+'</button></div>';
}
function obNav(dir) {
  OB_STEPS[_obStep].save();
  if(dir===1&&_obStep===OB_STEPS.length-1){ fecharOnboarding(); return; }
  _obStep=Math.max(0,Math.min(OB_STEPS.length-1,_obStep+dir)); renderObStep();
}
function fecharOnboarding() {
  OB_STEPS[_obStep].save();
  var ov=el('onboard_ov'); if(ov) ov.style.display='none';
  localStorage.setItem('fenix_onboard_done','1');
  try{ DB.salvarEmpresa(S.empresaAtiva); salvarConfigAtual(); }catch(e){}
  setRegime(S.regime);
  renderEmpresaSelector();
  liveCalc();
  showToast('Configuração concluída! Bem-vindo ao Fênix 🔥','success');
}

/* ════════════════════════════════════════════
   TOAST
════════════════════════════════════════════ */
var _toastTimer;
function showToast(msg,tipo) {
  tipo=tipo||'success';
  var t=el('toast'); if(!t) return;
  el('toast_msg').innerText=msg;
  t.className='toast '+tipo+' show';
  t.querySelector('i').className=tipo==='success'?'fa-solid fa-circle-check':'fa-solid fa-circle-exclamation';
  clearTimeout(_toastTimer);
  _toastTimer=setTimeout(function(){ t.classList.remove('show'); },3500);
}

/* ════════════════════════════════════════════
   INICIALIZAÇÃO
════════════════════════════════════════════ */
async function carregarEmpresa(empresaId) {
  var cfg=null;
  try{ cfg=await DB.carregarConfig(empresaId); }catch(e){}
  cfg=cfg||{};
  S.config       = cfg.geral         || { os_mes:20, margem_min:15 };
  S.contas       = cfg.contas         || JSON.parse(JSON.stringify(CONTAS_PADRAO));
  S.despesasFixas= cfg.despesasFixas  || JSON.parse(JSON.stringify(DESPESAS_FIXAS_PADRAO));
  S.despesasVar  = cfg.despesasVar    || JSON.parse(JSON.stringify(DESPESAS_VAR_PADRAO));
  S.metas        = cfg.metas          || { faturamento:0, os_qtd:0, lucro:0 };
  if(cfg.simplexAliq) SIMPLES_ALIQ = cfg.simplexAliq;
  S.regime       = cfg.regime         || (S.empresaAtiva&&S.empresaAtiva.regime) || 'simples';
  try{ S.banco     = await DB.listarOS(empresaId); }catch(e){ S.banco=[]; }
  try{ S.templates = await DB.listarTemplates(empresaId); }catch(e){ S.templates=[]; }

  // Popula campos de configuração
  if(el('cfg_os_mes'))       el('cfg_os_mes').value      = S.config.os_mes;
  if(el('cfg_margem_min'))   el('cfg_margem_min').value  = S.config.margem_min;
  if(el('cfg_nome_negocio')) el('cfg_nome_negocio').value= S.empresaAtiva?S.empresaAtiva.nome:'';
  if(el('cfg_atividade'))    el('cfg_atividade').value   = S.empresaAtiva?S.empresaAtiva.tipo:'misto';
  if(el('cfg_regime_padrao'))el('cfg_regime_padrao').value=S.regime;
  if(el('cfg_aliq_prod'))    el('cfg_aliq_prod').value   = SIMPLES_ALIQ.prod;
  if(el('cfg_aliq_serv'))    el('cfg_aliq_serv').value   = SIMPLES_ALIQ.serv;
  if(el('aliq_prod_edit'))   el('aliq_prod_edit').value  = SIMPLES_ALIQ.prod;
  if(el('aliq_serv_edit'))   el('aliq_serv_edit').value  = SIMPLES_ALIQ.serv;
  if(el('meta_fat'))         el('meta_fat').value        = S.metas.faturamento||'';
  if(el('meta_os'))          el('meta_os').value         = S.metas.os_qtd||'';
  if(el('meta_lucro'))       el('meta_lucro').value      = S.metas.lucro||'';
  if(el('hint_os_mes'))      el('hint_os_mes').innerText = S.config.os_mes;

  carregarRascunho();
  atualizarBadge();
}

window.addEventListener('load', async function() {
  // Dark mode
  if(localStorage.getItem('fenix_dark')==='1'){
    S.dark=true;
    document.documentElement.setAttribute('data-theme','dark');
    if(el('btn_dark')) el('btn_dark').innerHTML='<i class="fa-solid fa-sun"></i>';
  }

  // Empresa
  try {
    S.empresas = await DB.listarEmpresas();
    if(!S.empresas||S.empresas.length===0){
      var emp=await DB.salvarEmpresa({nome:'Minha Empresa',tipo:'misto',regime:'simples',criadaEm:new Date().toISOString()});
      S.empresas=[emp];
    }
    var lastEmp=localStorage.getItem('fenix_empresa_ativa');
    S.empresaAtiva=S.empresas.find(function(e){ return e.id===lastEmp; })||S.empresas[0];
    await carregarEmpresa(S.empresaAtiva.id);
  } catch(e) {
    // Fallback sem banco
    S.empresaAtiva={id:'default',nome:'Minha Empresa',tipo:'misto',regime:'simples'};
    S.empresas=[S.empresaAtiva];
    S.config={os_mes:20,margem_min:15};
    S.contas=JSON.parse(JSON.stringify(CONTAS_PADRAO));
    S.despesasFixas=JSON.parse(JSON.stringify(DESPESAS_FIXAS_PADRAO));
    S.despesasVar=JSON.parse(JSON.stringify(DESPESAS_VAR_PADRAO));
    S.metas={}; S.banco=[]; S.templates=[];
    if(el('hint_os_mes')) el('hint_os_mes').innerText=20;
  }

  // Init UI
  buildLiveRows();
  setRegime(S.regime);
  renderContasList();
  renderDespesasList();
  renderTemplatesList();
  renderEmpresaSelector();
  atualizarDashboard();

  // Data de hoje
  if(el('os_data')) el('os_data').value=new Date().toISOString().split('T')[0];
  if(el('os_num'))  el('os_num').value=gerarNumOS();

  // Datas relatório
  var hoje=new Date();
  var d1=new Date(hoje.getFullYear(),hoje.getMonth(),1).toISOString().split('T')[0];
  if(el('rel_de'))  el('rel_de').value=d1;
  if(el('rel_ate')) el('rel_ate').value=hoje.toISOString().split('T')[0];

  liveCalc();

  if(!localStorage.getItem('fenix_onboard_done')) abrirOnboarding();
});

/* ════════════════════════════════════════════
   PWA
════════════════════════════════════════════ */
if('serviceWorker' in navigator){
  window.addEventListener('load',function(){ navigator.serviceWorker.register('sw.js').catch(function(){}); });
}
