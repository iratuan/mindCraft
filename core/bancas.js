'use strict';
// Bancas organizadoras mais comuns em concursos do Brasil (nome de uso corrente → vira o texto gravado no registro).
// Qualquer outra banca continua possível pela opção "Outra…". A agregação por banca ignora caixa e acentos (study.bancaKey).
const BANCAS = [
  'CEBRASPE (CESPE)', 'FGV', 'FCC', 'VUNESP', 'CESGRANRIO', 'IBFC', 'QUADRIX', 'AOCP', 'IDECAN', 'CONSULPLAN',
  'FUNDATEC', 'IADES', 'FUNCAB', 'FEPESE', 'FUMARC', 'NC-UFPR', 'ESAF', 'SELECON', 'FADESP', 'FUNRIO',
  'COMPERVE', 'INSTITUTO ACCESS', 'OBJETIVA', 'IMPARH', 'INSTITUTO MAIS', 'FAURGS', 'CONTEMAX', 'FUNCERN', 'UERJ', 'UFG',
];
const OUTRA = '__outra';
module.exports = { BANCAS, OUTRA };
