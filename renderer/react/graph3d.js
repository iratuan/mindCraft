'use strict';
// Rede 3D: a biblioteca (3d-force-graph, sobre three.js) empacotada em renderer/bundle/graph3d.js.
// Expõe window.ForceGraph3D e window.THREE para a janela da Rede (graph-ui.js). Nada é baixado em tempo de execução.
import ForceGraph3D from '3d-force-graph';
import * as THREE from 'three';
window.ForceGraph3D = ForceGraph3D;
window.THREE = THREE;
