// Moonlight: a soft fill from the sky and the field, and the moon's direct light
import * as THREE from 'three';
import { toWorld } from '../scene/picture.js';
import { color } from '../utils/theme.js';

export const skyLight = new THREE.HemisphereLight(color('--sky-light'), color('--ground-light'), 0.9);

export const moon = new THREE.DirectionalLight(color('--moonlight'), 2.4);
moon.position.copy(toWorld(402.5, 286.8, 40));   // where the moon is on plate.png
moon.target.position.set(1, 0.8, -2.4);
