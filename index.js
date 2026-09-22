const canvas = document.querySelector('#jade-canvas');

// 1. O Estúdio (Ambiente Físico)
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 
renderer.toneMapping = THREE.ACESFilmicToneMapping;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 4.8; 

// 2. A Geometria Base (Núcleo Orgânico)
const geometria = new THREE.IcosahedronGeometry(0.35, 128); 
const posAttribute = geometria.attributes.position;
const v = new THREE.Vector3();

for (let i = 0; i < posAttribute.count; i++) {
    v.fromBufferAttribute(posAttribute, i);
    const deformacaoX = Math.sin(v.x * 5.0) * 0.06;
    const deformacaoY = Math.sin(v.y * 4.0 + 1.0) * 0.08;
    const deformacaoZ = Math.sin(v.z * 6.0) * 0.04;
    v.multiplyScalar(1.0 + deformacaoX + deformacaoY + deformacaoZ);
    v.z *= 0.75; 
    posAttribute.setXYZ(i, v.x, v.y, v.z);
}
geometria.computeVertexNormals(); 

// 3. O Catálogo de 33 Formas (0 a 32)
const vertexShader = `
    uniform float uShapeState;
    varying vec3 vNormal; varying vec3 vPosition; varying vec3 vViewPosition; varying vec3 vModelViewPos; varying float vRoughness; 

    // 33 Geometrias Matemáticas
    vec3 getShape(int type, vec3 pos, vec3 posCubo) {
        if (type == 0) return pos; 
        if (type == 1) { float t = smoothstep(-1.0, 1.0, posCubo.y); return vec3(posCubo.x*mix(1.1,0.3,t), posCubo.y*1.5, posCubo.z*mix(1.1,0.3,t)) * 0.6; } 
        if (type == 2) { return (pos / (abs(pos.x)+abs(pos.y)+abs(pos.z))) * 0.75; } 
        if (type == 3) { return posCubo * vec3(1.3, 0.3, 1.3) * 0.7; } 
        if (type == 4) { float a = posCubo.y * 2.0; float c=cos(a), s=sin(a); return vec3(posCubo.x*c - posCubo.z*s, posCubo.y, posCubo.x*s + posCubo.z*c) * vec3(0.6, 1.6, 0.6) * 0.65; } 
        if (type == 5) { float d = max(abs(pos.x)+abs(pos.y)+abs(pos.z), max(abs(pos.x-pos.y-pos.z), max(abs(-pos.x+pos.y-pos.z), abs(-pos.x-pos.y+pos.z)))); return (pos/d)*0.7; } 
        if (type == 6) { float t = smoothstep(-1.0, 1.0, posCubo.y); return vec3(posCubo.x*mix(1.3,0.0,t), posCubo.y*1.2 - 0.2, posCubo.z*mix(1.3,0.0,t)) * 0.7; } 
        if (type == 7) { return posCubo * vec3(0.2, 2.5, 0.2); } 
        if (type == 8) { float t = (pos.y+1.0)*0.5; return vec3(pos.x*t, pos.y, pos.z*t) * 1.2; } 
        if (type == 9) { vec3 p=pos; p.x*=0.4; p.z*=0.7; p.y*=1.8; p.x+=sin(pos.y*4.)*0.2; return p; } 
        if (type == 10) { return pos * (1.0 + 0.15 * sin(pos.y * 15.0 + pos.x * 10.0)); } 
        if (type == 11) { return pos * (1.0 + 0.3 * (sin(pos.x*8.)*cos(pos.y*8.) + sin(pos.y*8.)*cos(pos.z*8.) + sin(pos.z*8.)*cos(pos.x*8.))); } 
        if (type == 12) { return vec3(posCubo.x, posCubo.y*1.5, posCubo.z)*0.7; } 
        if (type == 13) { return vec3(pos.x, pos.x*pos.x - pos.z*pos.z, pos.z) * 0.8; } 
        if (type == 14) { float a=pos.x*1.618; float b=pos.y*1.618; return pos/(abs(a)+abs(b)) * 0.9; } 
        if (type == 15) { float r2 = pos.x*pos.x + pos.z*pos.z; return vec3(pos.x, pos.y * (1.0-r2*0.5), pos.z)*1.1; } 
        if (type == 16) { float a=atan(pos.z, pos.x); return pos * (1.0 + 0.2*sin(a*3. + pos.y*5.)); } 
        if (type == 17) { vec3 p=pos; p=abs(p)/dot(p,p)-vec3(0.5); p=abs(p)/dot(p,p)-vec3(0.5); return normalize(pos)*length(p)*0.3; } 
        if (type == 18) { float a=abs(pos.x)*1.618+abs(pos.y)*0.618; float b=abs(pos.y)*1.618+abs(pos.z)*0.618; float c=abs(pos.z)*1.618+abs(pos.x)*0.618; return pos/max(a,max(b,c)) * 0.85; } 
        if (type == 19) { return vec3(posCubo.x, floor(pos.y*5.0)/5.0, posCubo.z) * 0.8; } 
        if (type == 20) { float r=length(pos.xz); float a=atan(pos.z, pos.x); return vec3(pos.x, r*a*0.3, pos.z); } 
        if (type == 21) { return pos * (0.8 + 0.4*abs(sin(pos.y*8.0))*abs(cos(pos.x*8.0))); } 
        if (type == 22) { return vec3(pos.x, pos.y, 0.15*sin(pos.x*10.0)); } 
        if (type == 23) { float y = posCubo.y; return vec3(posCubo.x*cos(y*6.), y, posCubo.x*sin(y*6.)) * 0.7; } 
        if (type == 24) { return vec3(pos.x, pos.y, pos.z) * max(abs(pos.x), abs(pos.z)) * 1.5; } 
        if (type == 25) { float r = max(abs(pos.x), abs(pos.z)); return vec3(pos.x/r, pos.y*2.0, pos.z/r) * 0.35; } 
        if (type == 26) { return vec3(pos.x, pos.y*0.2, pos.z) * 1.4; } 
        if (type == 27) { return pos * (1.0 - 0.2*smoothstep(0.8, 1.0, sin(pos.x*20.0)*sin(pos.y*20.0))); } 
        if (type == 28) { return vec3(pos.x, pos.y*3.0, pos.z) * (1.0 - abs(pos.y)) * 0.5; } 
        if (type == 29) { return posCubo * vec3(1.0 + pos.y*pos.y*2.0, 1.5, 1.0 + pos.y*pos.y*2.0) * 0.4; } 
        if (type == 30) { return pos * (abs(sin(pos.x*10.0)) + abs(cos(pos.y*10.0))) * 0.5; } 
        if (type == 31) { return posCubo * vec3(0.1, 0.1, 2.5); } 
        if (type == 32) { return posCubo * vec3(0.5, 2.0, 0.5) * (1.0 + 0.15 * sin(pos.y * 30.0)); } 
        return pos;
    }

    void main() {
        vec3 posCubo = position / max(abs(position.x), max(abs(position.y), max(abs(position.z), 0.0001)));
        float currentState = mod(uShapeState, 33.0); 
        int typeA = int(floor(currentState));
        int typeB = int(floor(mod(currentState + 1.0, 33.0)));
        float blend = fract(currentState); 

        vec3 posA = getShape(typeA, position, posCubo);
        vec3 posB = getShape(typeB, position, posCubo);
        vec3 posFinal = mix(posA, posB, blend);

        vRoughness = mix(typeA == 0 ? 0.0 : 1.0, typeB == 0 ? 0.0 : 1.0, blend);

        vPosition = posFinal; vNormal = normalMatrix * normal; 
        vec4 mvPosition = modelViewMatrix * vec4(posFinal, 1.0);
        vModelViewPos = mvPosition.xyz; vViewPosition = -mvPosition.xyz; 
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const fragmentShader = `
    uniform float uTime;
    varying vec3 vNormal; varying vec3 vPosition; varying vec3 vViewPosition; varying vec3 vModelViewPos; varying float vRoughness; 

    float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
    float noise(vec3 x) {
        vec3 p = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(mix(hash(p + vec3(0,0,0)), hash(p + vec3(1,0,0)), f.x), mix(hash(p + vec3(0,1,0)), hash(p + vec3(1,1,0)), f.x), f.y),
                   mix(mix(hash(p + vec3(0,0,1)), hash(p + vec3(1,0,1)), f.x), mix(hash(p + vec3(0,1,1)), hash(p + vec3(1,1,1)), f.x), f.y), f.z);
    }
    float fbm(vec3 x) { float v = 0.0; float a = 0.5; vec3 shift = vec3(100.0); for (int i = 0; i < 5; ++i) { v += a * noise(x); x = x * 2.0 + shift; a *= 0.5; } return v; }

    void main() {
        vec3 p = vPosition * 3.5;
        vec3 dx = dFdx(vModelViewPos); vec3 dy = dFdy(vModelViewPos);
        vec3 normalFacetada = normalize(cross(dx, dy));
        vec3 normalSuave = normalize(vNormal);
        vec3 normalBase = normalize(mix(normalSuave, normalFacetada, vRoughness));

        vec3 bump = vec3(fbm(p * 7.0), fbm(p * 7.0 + 10.0), fbm(p * 7.0 + 20.0));
        vec3 normalFinal = normalize(normalBase + (bump - 0.5) * mix(0.02, 0.8, vRoughness));

        vec3 q = vec3(fbm(p + vec3(0.0, uTime * 0.015, 0.0)), fbm(p + vec3(5.2, 1.3, 0.0)), fbm(p));
        vec3 r = vec3(fbm(p + 4.0 * q), fbm(p + 4.0 * q + vec3(8.3, 2.8, 1.1)), fbm(p + 4.0 * q));
        float n = fbm(p + 3.0 * r);

        vec3 verdeImperial = vec3(0.01, 0.12, 0.06); 
        vec3 verdeLeitoso  = vec3(0.12, 0.38, 0.22); 
        vec3 veioClaro     = vec3(0.55, 0.75, 0.60); 
        vec3 corPedra = mix(verdeImperial, verdeLeitoso, smoothstep(0.1, 0.5, n));
        corPedra = mix(corPedra, veioClaro, smoothstep(0.4, 0.8, n));
        
        vec3 corOxidada = mix(vec3(0.25, 0.22, 0.18), vec3(0.15, 0.28, 0.18), n);
        corPedra = mix(corPedra, corOxidada, vRoughness * 0.6);

        vec3 viewDir = normalize(vViewPosition); vec3 lightDir = normalize(vec3(1.0, 1.5, 2.0)); 
        vec3 reflectDir = reflect(-lightDir, normalFinal);
        
        float forcaSpecular = mix(90.0, 12.0, vRoughness); 
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), forcaSpecular);
        vec3 corSpecular = vec3(1.0, 1.0, 0.9) * spec * mix(1.0, 0.15, vRoughness); 

        float fresnel = pow(1.0 - max(dot(normalFinal, viewDir), 0.0), mix(2.5, 1.2, vRoughness));
        vec3 corSSS = vec3(0.1, 0.8, 0.3) * fresnel * mix(0.8, 0.15, vRoughness); 

        float difusa = max(dot(normalFinal, lightDir), 0.15);
        corPedra *= (difusa * 0.8 + 0.2); 

        gl_FragColor = vec4(corPedra + corSpecular + corSSS, 1.0);
    }
`;

const material = new THREE.ShaderMaterial({
    vertexShader, fragmentShader, extensions: { derivatives: true },
    uniforms: { uTime: { value: 0.0 }, uShapeState: { value: 0.0 } }
});

const jade = new THREE.Mesh(geometria, material);
scene.add(jade);


// 4. A Interface Integrada (Círculo Vazado)
const hud = document.createElement('div');
Object.assign(hud.style, {
    position: 'fixed', bottom: '45px', left: '50%', transform: 'translateX(-50%)',
    width: '80%', maxWidth: '300px', display: 'flex', flexDirection: 'column', 
    alignItems: 'center', gap: '10px', zIndex: '100' // Gap reduzido para integrar mais
});

// O Botão Circular e Transparente
const btnNumero = document.createElement('button');
Object.assign(btnNumero.style, {
    fontFamily: '"Georgia", serif', fontSize: '14px',
    color: '#1C1C1C', backgroundColor: 'transparent', // Fundo invisível, integra com a página
    border: '1px solid #1C1C1C', 
    width: '44px', height: '44px', borderRadius: '50%', // Círculo perfeito
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', outline: 'none',
    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
});
btnNumero.innerText = '00';

// Área do Slider 
const areaSlider = document.createElement('div');
Object.assign(areaSlider.style, {
    width: '100%', height: '30px', position: 'relative', cursor: 'ew-resize',
    display: 'flex', alignItems: 'center'
});

const trilha = document.createElement('div');
Object.assign(trilha.style, {
    width: '100%', height: '1px', backgroundColor: '#1C1C1C', opacity: '0.4'
});

const polegar = document.createElement('div');
Object.assign(polegar.style, {
    position: 'absolute', left: '0%', top: '50%', transform: 'translate(-50%, -50%)',
    width: '1px', height: '16px', backgroundColor: '#1C1C1C',
    transition: 'height 0.2s ease', pointerEvents: 'none'
});

areaSlider.appendChild(trilha);
areaSlider.appendChild(polegar);
hud.appendChild(btnNumero); 
hud.appendChild(areaSlider); 
document.body.appendChild(hud);


// 5. A Lógica da Interface (Fricção e Clique Tátil)
let valorAlvoSlider = 0.0; 
let valorAtualSlider = 0.0;
let interagindoSlider = false;

// Efeito de toque (Preenche o botão de preto e a letra fica clara)
btnNumero.addEventListener('mousedown', () => {
    btnNumero.style.transform = 'scale(0.9)';
    btnNumero.style.backgroundColor = '#1C1C1C';
    btnNumero.style.color = '#F4F1EA';
});
btnNumero.addEventListener('mouseup', () => {
    btnNumero.style.transform = 'scale(1)';
    btnNumero.style.backgroundColor = 'transparent';
    btnNumero.style.color = '#1C1C1C';
});
btnNumero.addEventListener('mouseleave', () => {
    btnNumero.style.transform = 'scale(1)';
    btnNumero.style.backgroundColor = 'transparent';
    btnNumero.style.color = '#1C1C1C';
});

btnNumero.addEventListener('click', () => {
    valorAlvoSlider = Math.round(valorAlvoSlider) + 1; 
    if (valorAlvoSlider > 32) valorAlvoSlider = 0;
});

// Comportamento Magnético do Slider
function atualizarSliderDaTela(clientX) {
    const rect = areaSlider.getBoundingClientRect();
    let x = clientX - rect.left;
    let porcentagem = Math.max(0, Math.min(1, x / rect.width));
    valorAlvoSlider = Math.round(porcentagem * 32.0); 
}

areaSlider.addEventListener('pointerdown', (e) => {
    interagindoSlider = true;
    polegar.style.height = '24px';
    atualizarSliderDaTela(e.clientX);
    e.target.setPointerCapture(e.pointerId); 
});
areaSlider.addEventListener('pointermove', (e) => {
    if(interagindoSlider) atualizarSliderDaTela(e.clientX);
});
areaSlider.addEventListener('pointerup', (e) => {
    interagindoSlider = false;
    polegar.style.height = '16px';
    e.target.releasePointerCapture(e.pointerId);
});


// 6. Interação Tátil da Pedra
let arrastandoPedra = false, mouseAnterior = { x: 0, y: 0 };
let rotacaoAutomatica = { x: 0, y: 0 }, rotacaoAlvo = { x: 0, y: 0 }, rotacaoAtual = { x: 0, y: 0 };

const iniciarArraste = (x, y) => { arrastandoPedra = true; mouseAnterior = { x, y }; };
const moverArraste = (x, y) => {
    if (arrastandoPedra) { rotacaoAlvo.x += (y - mouseAnterior.y)*0.012; rotacaoAlvo.y += (x - mouseAnterior.x)*0.012; mouseAnterior = { x, y }; }
};
const pararArraste = () => arrastandoPedra = false;

document.addEventListener('pointerdown', (e) => { if(!areaSlider.contains(e.target) && !btnNumero.contains(e.target)) iniciarArraste(e.clientX, e.clientY); });
document.addEventListener('pointermove', (e) => { if(arrastandoPedra) moverArraste(e.clientX, e.clientY); });
document.addEventListener('pointerup', pararArraste);

// 7. O Motor Matemático
const clock = new THREE.Clock();

function animar() {
    requestAnimationFrame(animar);
    material.uniforms.uTime.value = clock.getElapsedTime();
    
    // Viscosidade do Slider
    valorAtualSlider += (valorAlvoSlider - valorAtualSlider) * 0.045; 
    
    polegar.style.left = `${(valorAtualSlider / 32.0) * 100}%`;
    
    let faseInteira = Math.round(valorAtualSlider);
    btnNumero.innerText = faseInteira.toString().padStart(2, '0');
    
    material.uniforms.uShapeState.value = valorAtualSlider;

    rotacaoAutomatica.x += 0.0006; rotacaoAutomatica.y += 0.001;
    rotacaoAtual.x += (rotacaoAlvo.x - rotacaoAtual.x) * 0.08;
    rotacaoAtual.y += (rotacaoAlvo.y - rotacaoAtual.y) * 0.08;

    jade.rotation.x = rotacaoAutomatica.x + rotacaoAtual.x;
    jade.rotation.y = rotacaoAutomatica.y + rotacaoAtual.y;

    renderer.render(scene, camera);
}
animar();

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});