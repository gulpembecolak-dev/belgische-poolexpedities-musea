// Entry point — Belgische Poolexpedities opening scene

import './styles/tokens.css';
import './styles/base.css';
import { createOpeningScene } from './scenes/opening.js';

const app = document.getElementById('app');
const scene = await createOpeningScene(app);
await scene.start();
