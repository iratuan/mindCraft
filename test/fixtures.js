'use strict';
// Conjunto de dados de conferência compartilhado pelos scripts de evidência e de QA (data fixa, determinístico).
const { MindMap, createNode } = require('../core/components/model');
const S = require('../core/study');

const TODAY = '2026-10-20';
const d = (n) => S.addDays(TODAY, n);

/** Mapa de estudo realista. Tudo determinístico a partir de TODAY. */
function concurso() {
  const m = new MindMap(createNode('Concurso TRF 2026'), { theme: 'ocean' });
  const add = (p, t, o = {}) => { const n = m.addChild(p, t); if (o.progress != null) m.update(n.id, { progress: o.progress }); if (o.notes) m.update(n.id, { notes: o.notes }); for (const k of o.markers || []) m.toggleMarker(n.id, k); return n; };
  const pt = add(m.root.id, 'Língua Portuguesa'), dc = add(m.root.id, 'Direito Constitucional'), da = add(m.root.id, 'Direito Administrativo'), inf = add(m.root.id, 'Informática');
  const crase = add(pt.id, 'Crase', { progress: 100, markers: ['ok'] }), reg = add(pt.id, 'Regência', { progress: 60 }), conc = add(pt.id, 'Concordância', { progress: 30 });
  const pri = add(dc.id, 'Princípios fundamentais', { progress: 80, markers: ['p1'], notes: 'Base de tudo: veja [[Princípios da Administração]] e [[Legalidade]].' });
  const dir = add(dc.id, 'Direitos fundamentais', { progress: 100, markers: ['star'] }); const org = add(dc.id, 'Organização do Estado', { progress: 20 });
  const leg = add(dc.id, 'Legalidade', { progress: 90, notes: 'Inciso II do art. 5º.' });
  const pa = add(da.id, 'Princípios da Administração', { progress: 70, notes: 'LIMPE. Relacionado à legalidade constitucional: [[Legalidade]].' });
  const atos = add(da.id, 'Atos administrativos', { progress: 40, notes: 'Atributos e elementos. A moralidade também importa aqui.' }); const lic = add(da.id, 'Licitações', { progress: 10, markers: ['warn'] });
  add(da.id, 'Moralidade', { progress: 0 });
  const seg = add(inf.id, 'Segurança da informação', { progress: 50 }), redes = add(inf.id, 'Redes', { progress: 0 });
  m.addRelation(pa.id, atos.id, 'fundamenta'); m.addRelation(leg.id, pa.id, 'origem');
  const st = (n, fn) => m.mutateStudy(n.id, fn);
  st(crase, (s) => S.reviewed(S.reviewed(S.addQuestions(S.addTime(S.addTime(S.setWeight(s, 2), d(-6), 40), d(-1), 55), 40, 36), { today: d(-8) }), { today: d(-1) }));
  st(reg, (s) => S.setNext(S.reviewed(S.addTime(s, d(-3), 45), { today: d(-4) }), d(-2)));       // atrasada
  st(pri, (s) => S.setNext(S.reviewed(S.addQuestions(S.addTime(S.setWeight(s, 3), TODAY, 90), 30, 21), { today: d(-7) }), TODAY)); // vence hoje
  st(dir, (s) => S.reviewed(S.addTime(s, d(-2), 70), { today: d(-2) }));
  st(leg, (s) => S.setNext(S.reviewed(S.addTime(s, d(-5), 30), { today: d(-6) }), d(2)));
  st(atos, (s) => S.setNext(S.reviewed(S.addQuestions(S.addTime(s, d(-1), 60), 25, 12), { today: d(-1) }), d(1)));
  st(seg, (s) => S.addTime(s, TODAY, 35));
  m.setExam({ name: 'TRF — 2ª Região', date: d(25) });
  return { m, ids: { pt, dc, da, inf, crase, reg, pri, leg, pa, atos, lic } };
}

module.exports = { TODAY, d, concurso };
