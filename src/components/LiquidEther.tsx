import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';

interface SimulationOptions {
  mouse_force: number;
  cursor_size: number;
  isViscous: boolean;
  viscous: number;
  iterations_viscous: number;
  iterations_poisson: number;
  dt: number;
  BFECC: boolean;
  resolution: number;
  isBounce: boolean;
}

interface FBOs {
  vel_0: THREE.WebGLRenderTarget | null;
  vel_1: THREE.WebGLRenderTarget | null;
  div: THREE.WebGLRenderTarget | null;
  pressure_0: THREE.WebGLRenderTarget | null;
  pressure_1: THREE.WebGLRenderTarget | null;
}

interface ShaderPassProps {
  fragmentShader: string;
  uniforms?: { [key: string]: { value: unknown } };
  output?: THREE.WebGLRenderTarget | null;
}

interface SimProps {
  velocity?: { texture: THREE.Texture } | null;
  velocity_new?: { texture: THREE.Texture } | null;
  source?: { texture: THREE.Texture } | null;
  pressure?: { texture: THREE.Texture } | null;
  divergence?: { texture: THREE.Texture } | null;
  dt?: number;
  dissipation?: number;
  px?: { x: number; y: number };
  mouse_force?: number;
  cursor_size?: number;
  viscous?: number;
  output?: THREE.WebGLRenderTarget | null;
}

interface AutoDriverOptions {
  enabled: boolean;
  speed: number;
  resumeDelay: number;
  rampDuration: number;
}

interface WebGLManagerProps extends LiquidEtherProps {
  $wrapper: HTMLElement;
}

const faceVert = `
precision highp float;
attribute vec2 position;
varying vec2 vUv;
void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
}
`;



const backgroundFrag = `
precision highp float;
uniform sampler2D velocity;
uniform sampler2D palette;
uniform vec2 resolution;
uniform vec4 bgVec4;
varying vec2 vUv;
void main(){
    vec2 vel = texture2D(velocity, vUv).xy;
    float len = length(vel);
    vec4 color = texture2D(palette, vec2(len, 0.5));
    gl_FragColor = mix(bgVec4, color, len);
}
`;

const advectionFrag = `
precision highp float;
uniform sampler2D velocity;
uniform sampler2D source;
uniform vec2 resolution;
uniform vec2 px;
uniform float dt;
uniform float dissipation;
varying vec2 vUv;
void main(){
    vec2 coord = vUv - dt * texture2D(velocity, vUv).xy * px;
    gl_FragColor = dissipation * texture2D(source, coord);
}
`;

const divergenceFrag = `
precision highp float;
uniform sampler2D velocity;
uniform float half_px_x;
uniform float half_px_y;
varying vec2 vUv;
void main(){
    vec2 vL = texture2D(velocity, vUv - vec2(half_px_x, 0.0)).xy;
    vec2 vR = texture2D(velocity, vUv + vec2(half_px_x, 0.0)).xy;
    vec2 vT = texture2D(velocity, vUv + vec2(0.0, half_px_y)).xy;
    vec2 vB = texture2D(velocity, vUv - vec2(0.0, half_px_y)).xy;
    gl_FragColor = vec4(0.5 * (vR.x - vL.x + vT.y - vB.y), 0.0, 0.0, 1.0);
}
`;

const poissonFrag = `
precision highp float;
uniform sampler2D pressure;
uniform sampler2D divergence;
uniform float px_x;
uniform float px_y;
varying vec2 vUv;
void main(){
    float pL = texture2D(pressure, vUv - vec2(px_x, 0.0)).x;
    float pR = texture2D(pressure, vUv + vec2(px_x, 0.0)).x;
    float pT = texture2D(pressure, vUv + vec2(0.0, px_y)).x;
    float pB = texture2D(pressure, vUv - vec2(0.0, px_y)).x;
    float div = texture2D(divergence, vUv).x;
    gl_FragColor = vec4(0.25 * (pL + pR + pT + pB - div), 0.0, 0.0, 1.0);
}
`;

const pressureFrag = `
precision highp float;
uniform sampler2D pressure;
uniform sampler2D velocity;
uniform float px_x;
uniform float px_y;
varying vec2 vUv;
void main(){
    float pL = texture2D(pressure, vUv - vec2(px_x, 0.0)).x;
    float pR = texture2D(pressure, vUv + vec2(px_x, 0.0)).x;
    float pT = texture2D(pressure, vUv + vec2(0.0, px_y)).x;
    float pB = texture2D(pressure, vUv - vec2(0.0, px_y)).x;
    vec2 vel = texture2D(velocity, vUv).xy;
    vel.xy -= vec2(pR - pL, pT - pB);
    gl_FragColor = vec4(vel, 0.0, 1.0);
}
`;

const externalForceFrag = `
precision highp float;
uniform vec2 force;
uniform vec2 center;
uniform vec2 scale;
uniform vec2 px;
varying vec2 vUv;
void main(){
    vec2 circle = (vUv - center) / scale;
    float dist = dot(circle, circle);
    float strength = exp(-dist);
    gl_FragColor = vec4(force * strength, 0.0, 1.0);
}
`;

const viscousFrag = `
precision highp float;
uniform sampler2D velocity;
uniform sampler2D velocity_new;
uniform float v;
uniform float px_x;
uniform float px_y;
uniform float dt;
varying vec2 vUv;
void main(){
    vec2 vL = texture2D(velocity_new, vUv - vec2(px_x, 0.0)).xy;
    vec2 vR = texture2D(velocity_new, vUv + vec2(px_x, 0.0)).xy;
    vec2 vT = texture2D(velocity_new, vUv + vec2(0.0, px_y)).xy;
    vec2 vB = texture2D(velocity_new, vUv - vec2(0.0, px_y)).xy;
    vec2 vC = texture2D(velocity, vUv).xy;
    float alpha = 1.0 / (dt * v);
    float beta = 4.0 + alpha;
    gl_FragColor = vec4((vL + vR + vT + vB + alpha * vC) / beta, 0.0, 1.0);
}
`;

interface LiquidEtherProps {
  colors?: string[];
  mouseForce?: number;
  cursorSize?: number;
  isViscous?: boolean;
  viscous?: number;
  iterationsViscous?: number;
  iterationsPoisson?: number;
  dt?: number;
  BFECC?: boolean;
  resolution?: number;
  isBounce?: boolean;
  autoDemo?: boolean;
  autoSpeed?: number;
  autoIntensity?: number;
  takeoverDuration?: number;
  autoResumeDelay?: number;
  autoRampDuration?: number;
  className?: string;
  style?: React.CSSProperties;
}

class Common {
  renderer: THREE.WebGLRenderer | null = null;
  width = 0;
  height = 0;
  aspect = 0;
  isMobile = false;
  breakpoint = 768;
  resizeCallback?: () => void;

  init(container: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      stencil: false,
      depth: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.width = container.clientWidth;
    this.height = container.clientHeight;
    this.aspect = this.width / this.height;
    this.isMobile = window.innerWidth < this.breakpoint;
  }

  resize() {
    if (!this.renderer) return;
    const container = this.renderer.domElement.parentElement;
    if (container) {
      this.width = container.clientWidth;
      this.height = container.clientHeight;
      this.aspect = this.width / this.height;
      this.renderer.setSize(this.width, this.height);
      this.isMobile = window.innerWidth < this.breakpoint;
      if (this.resizeCallback) this.resizeCallback();
    }
  }

  update() {
    // No-op
  }

  dispose() {
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }
  }
}

class Mouse {
  common: Common;
  x = 0;
  y = 0;
  coords = new THREE.Vector2();
  diff = new THREE.Vector2();
  timer: ReturnType<typeof setTimeout> | null = null;
  count = 0;
  isDown = false;
  autoIntensity = 0;
  takeoverDuration = 0;
  onInteract?: () => void;
  private cleanup?: () => void;

  constructor(common: Common) {
    this.common = common;
  }

  init(container: HTMLElement) {
    this.x = this.common.width / 2;
    this.y = this.common.height / 2;
    this.coords.set(0, 0);
    this.diff.set(0, 0);

    const onMouseMove = (e: MouseEvent) => {
      this.x = e.offsetX;
      this.y = e.offsetY;
      this.isDown = true;
      this.onInteract?.();
      this.resetTimer();
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = container.getBoundingClientRect();
      this.x = touch.clientX - rect.left;
      this.y = touch.clientY - rect.top;
      this.isDown = true;
      this.onInteract?.();
      this.resetTimer();
    };
    const onMouseDown = () => {
      this.isDown = true;
      this.onInteract?.();
    };
    const onMouseUp = () => {
      this.isDown = false;
    };

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mouseup', onMouseUp);
    container.addEventListener('touchstart', onMouseDown);
    container.addEventListener('touchend', onMouseUp);

    this.cleanup = () => {
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('touchstart', onMouseDown);
      container.removeEventListener('touchend', onMouseUp);
    };
  }

  resetTimer() {
    if (this.timer) clearTimeout(this.timer);
    this.count = 0;
    this.timer = setTimeout(() => {
      this.count = 0;
    }, this.takeoverDuration || 2000);
  }

  update() {
    this.coords.x = (this.x / this.common.width) * 2 - 1;
    this.coords.y = -(this.y / this.common.height) * 2 + 1;

    if (this.autoIntensity > 0) {
        // Logic from original
    }
  }

  dispose() {
    if (this.cleanup) this.cleanup();
  }
}

class ShaderPass {
  common: Common;
  props: ShaderPassProps;
  uniforms: { [key: string]: { value: unknown } };
  material: THREE.ShaderMaterial;
  plane: THREE.Mesh;
  scene: THREE.Scene;
  camera: THREE.Camera;

  constructor(common: Common, props: ShaderPassProps) {
    this.common = common;
    this.props = props;
    this.uniforms = this.props.uniforms || {};
    this.material = new THREE.RawShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: faceVert,
      fragmentShader: this.props.fragmentShader,
      depthTest: false,
      depthWrite: false,
      blending: THREE.NoBlending
    });
    this.plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
    this.scene = new THREE.Scene();
    this.scene.add(this.plane);
    this.camera = new THREE.Camera();
  }

  update(renderer: THREE.WebGLRenderer, props?: Partial<ShaderPassProps>) {
    if (!renderer) return;
    if (props?.output !== undefined) {
        renderer.setRenderTarget(props.output);
    } else {
        renderer.setRenderTarget(this.props.output || null);
    }
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(null);
  }
}

class Advection extends ShaderPass {
  constructor(common: Common, simProps: SimProps) {
    super(common, {
      fragmentShader: advectionFrag,
      uniforms: {
        velocity: { value: simProps.velocity?.texture },
        source: { value: simProps.source?.texture },
        dt: { value: simProps.dt },
        dissipation: { value: simProps.dissipation },
        px: { value: simProps.px }
      }
    });
  }
  update(renderer: THREE.WebGLRenderer, simProps: SimProps) {
    this.uniforms.velocity.value = simProps.velocity?.texture;
    this.uniforms.source.value = simProps.source?.texture;
    this.uniforms.dt.value = simProps.dt;
    this.uniforms.dissipation.value = simProps.dissipation;
    this.uniforms.px.value = simProps.px;
    super.update(renderer, { output: simProps.output });
  }
}

class ExternalForce extends ShaderPass {
  mouse: Mouse;
  constructor(common: Common, mouse: Mouse, simProps: SimProps) {
    super(common, {
      fragmentShader: externalForceFrag,
      uniforms: {
        force: { value: new THREE.Vector2() },
        center: { value: new THREE.Vector2() },
        scale: { value: new THREE.Vector2() },
        px: { value: simProps.px }
      }
    });
    this.mouse = mouse;
  }
  update(renderer: THREE.WebGLRenderer, simProps: SimProps) {
    const forceX = (this.mouse.diff.x / 2) * (simProps.mouse_force || 0);
    const forceY = (this.mouse.diff.y / 2) * (simProps.mouse_force || 0);
    const cursorSizeX = (simProps.cursor_size || 0) * (simProps.px?.x || 0);
    const cursorSizeY = (simProps.cursor_size || 0) * (simProps.px?.y || 0);
    const centerX = Math.min(Math.max(this.mouse.coords.x, -1 + cursorSizeX + (simProps.px?.x || 0) * 2), 1 - cursorSizeX - (simProps.px?.x || 0) * 2);
    const centerY = Math.min(Math.max(this.mouse.coords.y, -1 + cursorSizeY + (simProps.px?.y || 0) * 2), 1 - cursorSizeY - (simProps.px?.y || 0) * 2);
    (this.uniforms.force.value as THREE.Vector2).set(forceX, forceY);
    (this.uniforms.center.value as THREE.Vector2).set(centerX, centerY);
    (this.uniforms.scale.value as THREE.Vector2).set(cursorSizeX, cursorSizeY);
    this.uniforms.px.value = simProps.px;
    super.update(renderer, { output: simProps.output });
  }
}

class Viscous extends ShaderPass {
  constructor(common: Common, simProps: SimProps) {
    super(common, {
      fragmentShader: viscousFrag,
      uniforms: {
        velocity: { value: simProps.velocity?.texture },
        velocity_new: { value: simProps.velocity_new?.texture },
        v: { value: simProps.viscous },
        px_x: { value: simProps.px?.x },
        px_y: { value: simProps.px?.y },
        dt: { value: simProps.dt }
      }
    });
  }
  update(renderer: THREE.WebGLRenderer, simProps: SimProps) {
    this.uniforms.velocity.value = simProps.velocity?.texture;
    this.uniforms.velocity_new.value = simProps.velocity_new?.texture;
    this.uniforms.v.value = simProps.viscous;
    this.uniforms.px_x.value = simProps.px?.x;
    this.uniforms.px_y.value = simProps.px?.y;
    this.uniforms.dt.value = simProps.dt;
    super.update(renderer, { output: simProps.output });
  }
}

class Divergence extends ShaderPass {
  constructor(common: Common, simProps: SimProps) {
    super(common, {
      fragmentShader: divergenceFrag,
      uniforms: {
        velocity: { value: simProps.velocity?.texture },
        half_px_x: { value: (simProps.px?.x || 0) * 0.5 },
        half_px_y: { value: (simProps.px?.y || 0) * 0.5 }
      }
    });
  }
  update(renderer: THREE.WebGLRenderer, simProps: SimProps) {
    this.uniforms.velocity.value = simProps.velocity?.texture;
    this.uniforms.half_px_x.value = (simProps.px?.x || 0) * 0.5;
    this.uniforms.half_px_y.value = (simProps.px?.y || 0) * 0.5;
    super.update(renderer, { output: simProps.output });
  }
}

class Poisson extends ShaderPass {
  constructor(common: Common, simProps: SimProps) {
    super(common, {
      fragmentShader: poissonFrag,
      uniforms: {
        pressure: { value: simProps.pressure?.texture },
        divergence: { value: simProps.divergence?.texture },
        px_x: { value: simProps.px?.x },
        px_y: { value: simProps.px?.y }
      }
    });
  }
  update(renderer: THREE.WebGLRenderer, simProps: SimProps) {
    this.uniforms.pressure.value = simProps.pressure?.texture;
    this.uniforms.divergence.value = simProps.divergence?.texture;
    this.uniforms.px_x.value = simProps.px?.x;
    this.uniforms.px_y.value = simProps.px?.y;
    super.update(renderer, { output: simProps.output });
  }
}

class Pressure extends ShaderPass {
  constructor(common: Common, simProps: SimProps) {
    super(common, {
      fragmentShader: pressureFrag,
      uniforms: {
        pressure: { value: simProps.pressure?.texture },
        velocity: { value: simProps.velocity?.texture },
        px_x: { value: simProps.px?.x },
        px_y: { value: simProps.px?.y }
      }
    });
  }
  update(renderer: THREE.WebGLRenderer, simProps: SimProps) {
    this.uniforms.pressure.value = simProps.pressure?.texture;
    this.uniforms.velocity.value = simProps.velocity?.texture;
    this.uniforms.px_x.value = simProps.px?.x;
    this.uniforms.px_y.value = simProps.px?.y;
    super.update(renderer, { output: simProps.output });
  }
}

class Simulation {
  common: Common;
  mouse: Mouse;
  props: WebGLManagerProps;
  options: SimulationOptions;
  fbos: FBOs;
  advection: Advection;
  externalForce: ExternalForce;
  viscous: Viscous;
  divergence: Divergence;
  poisson: Poisson;
  pressure: Pressure;

  constructor(common: Common, mouse: Mouse, props: WebGLManagerProps) {
    this.common = common;
    this.mouse = mouse;
    this.props = props;
    this.options = {
      mouse_force: props.mouseForce || 20,
      cursor_size: props.cursorSize || 100,
      isViscous: props.isViscous || false,
      viscous: props.viscous || 30,
      iterations_viscous: props.iterationsViscous || 32,
      iterations_poisson: props.iterationsPoisson || 32,
      dt: props.dt || 0.014,
      BFECC: props.BFECC || false,
      resolution: props.resolution || 0.5,
      isBounce: props.isBounce || false
    };
    this.fbos = {
      vel_0: null,
      vel_1: null,
      div: null,
      pressure_0: null,
      pressure_1: null
    };
    this.init();
    this.advection = new Advection(common, {
      velocity: this.fbos.vel_0,
      source: this.fbos.vel_0,
      dt: this.options.dt,
      dissipation: 1.0,
      px: this.calcPx()
    });
    this.externalForce = new ExternalForce(common, mouse, {
      px: this.calcPx(),
      mouse_force: this.options.mouse_force,
      cursor_size: this.options.cursor_size
    });
    this.viscous = new Viscous(common, {
      velocity: this.fbos.vel_0,
      velocity_new: this.fbos.vel_1,
      viscous: this.options.viscous,
      px: this.calcPx(),
      dt: this.options.dt
    });
    this.divergence = new Divergence(common, {
      velocity: this.fbos.vel_0,
      px: this.calcPx()
    });
    this.poisson = new Poisson(common, {
      pressure: this.fbos.pressure_0,
      divergence: this.fbos.div,
      px: this.calcPx()
    });
    this.pressure = new Pressure(common, {
      pressure: this.fbos.pressure_0,
      velocity: this.fbos.vel_0,
      px: this.calcPx()
    });
  }

  calcSize() {
    const width = Math.round(this.common.width * this.options.resolution);
    const height = Math.round(this.common.height * this.options.resolution);
    return { width, height };
  }

  calcPx() {
    const { width, height } = this.calcSize();
    return { x: 1 / width, y: 1 / height };
  }

  createFBO() {
    const { width, height } = this.calcSize();
    const type = THREE.HalfFloatType;
    return new THREE.WebGLRenderTarget(width, height, {
      type,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter
    });
  }

  init() {
    this.fbos.vel_0 = this.createFBO();
    this.fbos.vel_1 = this.createFBO();
    this.fbos.div = this.createFBO();
    this.fbos.pressure_0 = this.createFBO();
    this.fbos.pressure_1 = this.createFBO();
  }

  resize() {
    this.init();
  }

  update() {
    if (!this.common.renderer) return;
    const renderer = this.common.renderer;
    const px = this.calcPx();

    // Advection
    this.advection.update(renderer, {
      velocity: this.fbos.vel_0,
      source: this.fbos.vel_0,
      dt: this.options.dt,
      dissipation: 1.0,
      px,
      output: this.fbos.vel_1
    });

    // Swap vel_0 and vel_1
    let temp = this.fbos.vel_0;
    this.fbos.vel_0 = this.fbos.vel_1;
    this.fbos.vel_1 = temp;

    // External Force
    if (this.mouse.isDown) {
      this.externalForce.update(renderer, {
        px,
        mouse_force: this.options.mouse_force,
        cursor_size: this.options.cursor_size,
        output: this.fbos.vel_0
      });
    }

    // Viscous
    if (this.options.isViscous) {
      for (let i = 0; i < this.options.iterations_viscous; i++) {
        this.viscous.update(renderer, {
          velocity: this.fbos.vel_0,
          velocity_new: this.fbos.vel_1,
          viscous: this.options.viscous,
          px,
          dt: this.options.dt,
          output: this.fbos.vel_1
        });
        temp = this.fbos.vel_0;
        this.fbos.vel_0 = this.fbos.vel_1;
        this.fbos.vel_1 = temp;
      }
    }

    // Divergence
    this.divergence.update(renderer, {
      velocity: this.fbos.vel_0,
      px,
      output: this.fbos.div
    });

    // Poisson
    for (let i = 0; i < this.options.iterations_poisson; i++) {
      this.poisson.update(renderer, {
        pressure: this.fbos.pressure_0,
        divergence: this.fbos.div,
        px,
        output: this.fbos.pressure_1
      });
      temp = this.fbos.pressure_0;
      this.fbos.pressure_0 = this.fbos.pressure_1;
      this.fbos.pressure_1 = temp;
    }

    // Pressure
    this.pressure.update(renderer, {
      pressure: this.fbos.pressure_0,
      velocity: this.fbos.vel_0,
      px,
      output: this.fbos.vel_1
    });
    this.fbos.vel_0 = this.fbos.vel_1;
  }
}

class Output extends ShaderPass {
  simulation: Simulation;
  constructor(common: Common, simulation: Simulation, paletteTex: THREE.Texture, bgVec4: THREE.Vector4) {
    super(common, {
      fragmentShader: backgroundFrag,
      uniforms: {
        velocity: { value: simulation.fbos.vel_0.texture },
        palette: { value: paletteTex },
        resolution: { value: new THREE.Vector2(common.width, common.height) },
        bgVec4: { value: bgVec4 }
      }
    });
    this.simulation = simulation;
  }
  update(renderer: THREE.WebGLRenderer) {
    this.uniforms.velocity.value = this.simulation.fbos.vel_0.texture;
    this.uniforms.resolution.value.set(this.common.width, this.common.height);
    super.update(renderer, { output: null });
  }
  resize() {
    this.uniforms.resolution.value.set(this.common.width, this.common.height);
  }
}

class AutoDriver {
  mouse: Mouse;
  webgl: WebGLManager;
  enabled: boolean;
  speed: number;
  resumeDelay: number;
  rampDurationMs: number;
  lastTime = 0;
  isAuto = false;
  autoTarget = new THREE.Vector2();
  autoTimer = 0;

  constructor(mouse: Mouse, webgl: WebGLManager, options: AutoDriverOptions) {
    this.mouse = mouse;
    this.webgl = webgl;
    this.enabled = options.enabled;
    this.speed = options.speed;
    this.resumeDelay = options.resumeDelay;
    this.rampDurationMs = options.rampDuration * 1000;
  }

  forceStop() {
    this.isAuto = false;
  }

  update() {
    if (!this.enabled) return;
    const now = performance.now();
    if (now - this.webgl.lastUserInteraction < this.resumeDelay) return;

    if (!this.isAuto) {
      this.isAuto = true;
      this.autoTarget.set(Math.random() * this.webgl.common.width, Math.random() * this.webgl.common.height);
    }

    // Simple auto movement logic
    const dx = this.autoTarget.x - this.mouse.x;
    const dy = this.autoTarget.y - this.mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 10) {
      this.autoTarget.set(Math.random() * this.webgl.common.width, Math.random() * this.webgl.common.height);
    } else {
      this.mouse.x += (dx / dist) * this.speed;
      this.mouse.y += (dy / dist) * this.speed;
      this.mouse.isDown = true;
    }
  }
}

class WebGLManager {
  common: Common;
  mouse: Mouse;
  props: WebGLManagerProps;
  output!: Output;
  simulation!: Simulation;
  autoDriver?: AutoDriver;
  lastUserInteraction = performance.now();
  running = false;
  private _loop = this.loop.bind(this);
  private _resize = this.resize.bind(this);
  private _onVisibility?: () => void;

  constructor(props: WebGLManagerProps, paletteTex: THREE.Texture, bgVec4: THREE.Vector4) {
    this.props = props;
    this.common = new Common();
    this.mouse = new Mouse(this.common);

    this.common.init(props.$wrapper);
    this.mouse.init(props.$wrapper);
    this.mouse.autoIntensity = props.autoIntensity || 0;
    this.mouse.takeoverDuration = props.takeoverDuration || 0;
    this.mouse.onInteract = () => {
      this.lastUserInteraction = performance.now();
      if (this.autoDriver) this.autoDriver.forceStop();
    };

    this.autoDriver = new AutoDriver(this.mouse, this, {
      enabled: props.autoDemo || false,
      speed: props.autoSpeed || 0,
      resumeDelay: props.autoResumeDelay || 0,
      rampDuration: props.autoRampDuration || 0
    });

    this.init(paletteTex, bgVec4);
    window.addEventListener('resize', this._resize);

    this._onVisibility = () => {
      const hidden = document.hidden;
      if (hidden) {
        this.pause();
      } else {
        this.start();
      }
    };
    document.addEventListener('visibilitychange', this._onVisibility);
  }

  init(paletteTex: THREE.Texture, bgVec4: THREE.Vector4) {
    if (!this.common.renderer) return;
    this.props.$wrapper.prepend(this.common.renderer.domElement);
    this.simulation = new Simulation(this.common, this.mouse, this.props);
    this.output = new Output(this.common, this.simulation, paletteTex, bgVec4);
  }

  resize() {
    this.common.resize();
    this.simulation.resize();
    this.output.resize();
  }

  render() {
    if (this.autoDriver) this.autoDriver.update();
    this.mouse.update();
    this.common.update();
    this.simulation.update();
    if (this.common.renderer) {
      this.output.update(this.common.renderer);
    }
  }

  loop() {
    if (!this.running) return;
    this.render();
    requestAnimationFrame(this._loop);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this._loop();
  }

  pause() {
    this.running = false;
  }

  dispose() {
    try {
      window.removeEventListener('resize', this._resize);
      if (this._onVisibility) document.removeEventListener('visibilitychange', this._onVisibility);
      this.mouse.dispose();
      this.common.dispose();
      if (this.common.renderer) {
        const canvas = this.common.renderer.domElement;
        if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
      }
    } catch {
      /* noop */
    }
  }
}

export default function LiquidEther({
  colors = ['#000000', '#ffffff'],
  mouseForce = 20,
  cursorSize = 100,
  isViscous = false,
  viscous = 30,
  iterationsViscous = 32,
  iterationsPoisson = 32,
  dt = 0.014,
  BFECC = false,
  resolution = 0.5,
  isBounce = false,
  autoDemo = false,
  autoSpeed = 10,
  autoIntensity = 0.2,
  takeoverDuration = 2000,
  autoResumeDelay = 5000,
  autoRampDuration = 5,
  className,
  style
}: LiquidEtherProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const webglRef = useRef<WebGLManager | null>(null);

  const paletteTex = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();
    const gradient = ctx.createLinearGradient(0, 0, 256, 0);
    colors.forEach((color, i) => {
      gradient.addColorStop(i / (colors.length - 1), color);
    });
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 1);
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }, [colors]);

  const bgVec4 = useMemo(() => {
    const c = new THREE.Color(colors[0]);
    return new THREE.Vector4(c.r, c.g, c.b, 1);
  }, [colors]);

  useEffect(() => {
    if (!mountRef.current) return;

    const webgl = new WebGLManager({
      $wrapper: mountRef.current,
      mouse_force: mouseForce,
      cursor_size: cursorSize,
      isViscous,
      viscous,
      iterations_viscous: iterationsViscous,
      iterations_poisson: iterationsPoisson,
      dt,
      BFECC,
      resolution,
      isBounce,
      autoDemo,
      autoSpeed,
      autoIntensity,
      takeoverDuration,
      autoResumeDelay,
      autoRampDuration
    }, paletteTex, bgVec4);

    webglRef.current = webgl;
    webgl.start();

    return () => {
      webgl.dispose();
      webglRef.current = null;
    };
  }, [
    paletteTex, bgVec4,
    mouseForce, cursorSize, isViscous, viscous, iterationsViscous, iterationsPoisson, dt, BFECC, resolution, isBounce,
    autoDemo, autoSpeed, autoIntensity, takeoverDuration, autoResumeDelay, autoRampDuration
  ]);

  return (
    <div
      ref={mountRef}
      className={`w-full h-full relative overflow-hidden pointer-events-none touch-none ${className || ''}`}
      style={style}
    />
  );
}
