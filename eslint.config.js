'use strict';
// Configuração do ESLint (npm run lint). Objetivo: pegar defeitos reais (variável sem uso, referência indefinida, código inalcançável),
// sem brigar com o estilo do projeto (frases curtas em uma linha, comentários em português).
const js = require('@eslint/js');
const globals = require('globals');

const rules = {
  ...js.configs.recommended.rules,
  'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none', varsIgnorePattern: '^(_|void)', ignoreRestSiblings: true }],
  'no-empty': ['error', { allowEmptyCatch: true }],            // `catch { /* motivo */ }` é o padrão do projeto para falhas ignoráveis de propósito
  'no-prototype-builtins': 'off',
  'no-control-regex': 'off',
  'no-misleading-character-class': 'off',
  'no-useless-escape': 'off',                                  // escapar [ ] dentro de classes de caractere é escolha de legibilidade nas regex de links
  'no-constant-condition': ['error', { checkLoops: false }],
  'no-fallthrough': 'error',
  eqeqeq: ['warn', 'always', { null: 'ignore' }],
  'no-var': 'error',
  'prefer-const': 'warn',
};

module.exports = [
  { ignores: ['node_modules/**', 'dist/**', 'build/**', '_extracted/**', 'renderer/bundle/**', 'tablet/android/**', 'tablet/node_modules/**', 'tablet/dist/**', 'tablet/www/**', 'tablet/build/**', 'tablet/keystore/**', 'evidencias/**', '**/*.min.js'] },
  // núcleo, Electron, ferramentas e scripts: Node puro (CommonJS)
  { files: ['core/**/*.js', 'electron/**/*.js', 'tools/**/*.js', 'tablet/scripts/**/*.js', 'eslint.config.js'], languageOptions: { ecmaVersion: 2023, sourceType: 'commonjs', globals: { ...globals.node } }, rules },
  // plataforma web/tablet: roda no navegador mas é escrita como módulo CommonJS empacotado pelo esbuild
  { files: ['platform/**/*.js'], languageOptions: { ecmaVersion: 2023, sourceType: 'commonjs', globals: { ...globals.browser, ...globals.node, Buffer: 'readonly' } }, rules },
  // interface clássica: scripts carregados em sequência que COMPARTILHAM o escopo global (estado e funções de renderer.js); por isso "no-undef" e
  // "no-unused-vars" ficam desligados aqui — a checagem de nomes entre esses arquivos é feita pelos testes e2e e pelo teste de arquitetura.
  { files: ['renderer/*.js'], languageOptions: { ecmaVersion: 2023, sourceType: 'script', globals: { ...globals.browser, ...globals.node } }, rules: { ...rules, 'no-undef': 'off', 'no-unused-vars': 'off', 'no-redeclare': 'off', 'prefer-const': 'off' } },
  // interface React (JSX empacotado)
  { files: ['renderer/react/**/*.{js,jsx}'], languageOptions: { ecmaVersion: 2023, sourceType: 'module', parserOptions: { ecmaFeatures: { jsx: true } }, globals: { ...globals.browser } }, rules: { ...rules, 'no-unused-vars': 'off' } },   // sem o plugin do React o ESLint não vê o uso de <Componente/>; o esbuild já acusa import inexistente
  // testes: Node + Electron; podem ser mais soltos
  { files: ['test/**/*.js'], languageOptions: { ecmaVersion: 2023, sourceType: 'commonjs', globals: { ...globals.node, ...globals.browser } }, rules: { ...rules, 'no-unused-vars': 'off', 'no-undef': 'off', 'prefer-const': 'off', 'no-irregular-whitespace': 'off', 'no-unused-labels': 'off' } },
  { files: ['test/**/*.mjs'], languageOptions: { ecmaVersion: 2023, sourceType: 'module', globals: { ...globals.node } }, rules },
];
