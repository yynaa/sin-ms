import p5 from "p5";
import BPM from "./bpm.js";
import SceneArp from "./scenes/arp.js";
import SceneBass from "./scenes/bass.js";
import SceneDrums from "./scenes/drums.js";
import { MasterShader, type Scene } from "./interfaces.js";
import SceneLead from "./scenes/lead.js";
import ShaderGP from "./shader/greenAndPurple.js";
import ShaderHorizSub from "./shader/horizSub.js";
import ShaderCross from "./shader/cross.js";
import ShaderHsvAb from "./shader/hsvAb.js";
import SceneSuperHat from "./scenes/superhat.js";

// -- DEBUG --
export const DEBUG = false;
export const START_OFFSET = 0;

// -- CONSTANTS --
const VERSION = "1.0.0";
const ZOOM_KICK_PEAK = 0.7;
const ZOOM_KICK_LERP_FACTOR = 0.2;
const SUPERHAT_OPACITY_PEAK = 0.5;
const SUPERHAT_OPACITY_LERP_FACTOR = 0.4;

// -- VARIABLES --
let zoomUnlerped = 1.0;
let superhatOpacityUnlerped = 0.0;

// -- ASSETS --
let assetsToLoad = 26;
let videosToLetPlay = 11;

let song: p5.default.MediaElement<HTMLAudioElement>;

export let videoArp: p5.default.MediaElement<HTMLVideoElement>;
export let videoBassA: p5.default.MediaElement<HTMLVideoElement>;
export let videoKick: p5.default.MediaElement<HTMLVideoElement>;
export let videoSnare: p5.default.MediaElement<HTMLVideoElement>;
export let videoHat: p5.default.MediaElement<HTMLVideoElement>;
export let videoChord: p5.default.MediaElement<HTMLVideoElement>;
export let videoLeadA: p5.default.MediaElement<HTMLVideoElement>;
export let videoLeadB: p5.default.MediaElement<HTMLVideoElement>;
export let videoLeadC: p5.default.MediaElement<HTMLVideoElement>;
export let videoLeadD: p5.default.MediaElement<HTMLVideoElement>;
export let videoLeadE: p5.default.MediaElement<HTMLVideoElement>;

// -- GLSL --
export let glslScreenFlip: p5.default.Shader;
export let glslArpCube: p5.default.Shader;
export let glslArpBackground: p5.default.Shader;
export let glslBassBackground: p5.default.Shader;
export let glslBassFlip: p5.default.Shader;
export let glslLead: p5.default.Shader;
export let glslDrums: p5.default.Shader;
export let glslZoom: p5.default.Shader;
export let glslHatSuperposer: p5.default.Shader;
export let glslScreenFlipZoom: p5.default.Shader;

// -- UTILS --
let started: number | null = null;
const bpm: BPM = new BPM(125, 4, 6, onTick, onLine, onBeat);

// -- SCENES --
let currentScene: Scene | null;

let sceneArp: SceneArp;
let sceneBass: SceneBass;
let sceneDrums: SceneDrums;
let sceneLead: SceneLead;
let sceneSuperHat: SceneSuperHat;

// -- SHADERS --

let currentShader: MasterShader;

let shaderGP: ShaderGP;
let shaderHorizSub: ShaderHorizSub;
let shaderCross: ShaderCross;
let shaderHsvAb: ShaderHsvAb;

// -- RENDER LAYERS --
let layerMasterShader: p5.default.Framebuffer;
let layerSuperHat: p5.default.Framebuffer;

function getAvailableScenes() {
  if (bpm.beat >= 4 * 16 + 1) {
    return [sceneBass, sceneLead, sceneArp, sceneBass, sceneLead, sceneDrums];
  }
  return [sceneBass, sceneBass, sceneArp, sceneArp, sceneDrums, sceneDrums];
}

export function onTick(v: number, millis: number, p: p5.default) {
  if (currentScene === null) {
    return;
  }
  currentScene.onTick(v, millis, p);
}

export function onLine(v: number, millis: number, p: p5.default) {
  if (v >= (16 * 12 + 2) * 4) {
    sceneSuperHat.onLine(v, millis, p);
    superhatOpacityUnlerped = SUPERHAT_OPACITY_PEAK;
  }
  if (currentScene === null) {
    return;
  }
  currentScene.onLine(v, millis, p);
}

export function onBeat(v: number, millis: number, p: p5.default) {
  if (currentScene === null) {
    return;
  }

  if (v % 4 == 2 && v < 16 * 12 + 2) {
    const availableScenes = getAvailableScenes();
    currentScene =
      availableScenes[Math.floor(v / 4) % availableScenes.length] ?? sceneBass;
    currentScene.enter(millis, p);
  } else if (v % 2 == 0 && v >= 16 * 12 + 2 && v < 16 * 16 + 2) {
    const availableScenes = getAvailableScenes();
    currentScene =
      availableScenes[Math.floor(v / 2) % availableScenes.length] ?? sceneBass;
    currentScene.enter(millis, p);
  } else if (v >= 16 * 16 + 2) {
    currentScene = null;
    return;
  }

  const availableShaders: MasterShader[] = [
    shaderGP,
    shaderHorizSub,
    shaderCross,
    shaderHsvAb,
  ];
  if (v < 4 * 16 && v % 8 == 2) {
    currentShader =
      availableShaders[Math.floor(v / 8) % availableShaders.length] ?? shaderGP;
  } else if (v >= 4 * 16 && v % 4 == 2) {
    currentShader =
      availableShaders[Math.floor(v / 4) % availableShaders.length] ?? shaderGP;
  }

  if (v >= 2) {
    zoomUnlerped = ZOOM_KICK_PEAK;
  }

  currentScene.onBeat(v, millis, p);
}

const sketch = (p: p5.default) => {
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight, "webgl");
    p.frameRate(60);
    p.noSmooth();

    // font
    p.loadFont(
      "/fonts/TerminessNerdFontMono-Regular.ttf",
      "Terminess",
      undefined,
      (f) => {
        p.textFont(f, 20);
        assetsToLoad -= 1;
      },
    );

    // glsl shaders
    {
      p.loadShader(
        "/glsl/default.vert",
        "/glsl/arpCube.frag",
        (s: p5.default.Shader) => {
          glslArpCube = s;
          assetsToLoad -= 1;
        },
      );
      p.loadShader(
        "/glsl/default.vert",
        "/glsl/screenFlip.frag",
        (s: p5.default.Shader) => {
          glslScreenFlip = s;
          assetsToLoad -= 1;
        },
      );
      p.loadShader(
        "/glsl/default.vert",
        "/glsl/arpBackground.frag",
        (s: p5.default.Shader) => {
          glslArpBackground = s;
          assetsToLoad -= 1;
        },
      );
      p.loadShader(
        "/glsl/default.vert",
        "/glsl/bassBackground.frag",
        (s: p5.default.Shader) => {
          glslBassBackground = s;
          assetsToLoad -= 1;
        },
      );
      p.loadShader(
        "/glsl/default.vert",
        "/glsl/bassFlip.frag",
        (s: p5.default.Shader) => {
          glslBassFlip = s;
          assetsToLoad -= 1;
        },
      );
      p.loadShader(
        "/glsl/default.vert",
        "/glsl/lead.frag",
        (s: p5.default.Shader) => {
          glslLead = s;
          assetsToLoad -= 1;
        },
      );
      p.loadShader(
        "/glsl/default.vert",
        "/glsl/drums.frag",
        (s: p5.default.Shader) => {
          glslDrums = s;
          assetsToLoad -= 1;
        },
      );
      p.loadShader(
        "/glsl/default.vert",
        "/glsl/zoom.frag",
        (s: p5.default.Shader) => {
          glslZoom = s;
          assetsToLoad -= 1;
        },
      );
      p.loadShader(
        "/glsl/default.vert",
        "/glsl/hatSuperposer.frag",
        (s: p5.default.Shader) => {
          glslHatSuperposer = s;
          assetsToLoad -= 1;
        },
      );
      p.loadShader(
        "/glsl/default.vert",
        "/glsl/screenFlipZoom.frag",
        (s: p5.default.Shader) => {
          glslScreenFlipZoom = s;
          assetsToLoad -= 1;
        },
      );
    }

    // assets
    song = p.createAudio("/assets/audio.wav");

    {
      videoArp = p.createVideo("/assets/arp.mp4", () => {
        assetsToLoad -= 1;
      });
      videoArp.volume(0.0);
      videoArp.onended(() => {
        videosToLetPlay -= 1;
        videoArp.onended(() => {});
      });
      videoArp.play();

      videoBassA = p.createVideo("/assets/bassA.mp4", () => {
        assetsToLoad -= 1;
      });
      videoBassA.volume(0.0);
      videoBassA.onended(() => {
        videosToLetPlay -= 1;
        videoBassA.onended(() => {});
      });
      videoBassA.play();

      videoKick = p.createVideo("/assets/kick.mp4", () => {
        assetsToLoad -= 1;
      });
      videoKick.volume(0.0);
      videoKick.noLoop();
      videoKick.onended(() => {
        videosToLetPlay -= 1;
        videoKick.onended(() => {});
      });
      videoKick.play();

      videoSnare = p.createVideo("/assets/snare.mp4", () => {
        assetsToLoad -= 1;
      });
      videoSnare.volume(0.0);
      videoSnare.onended(() => {
        videosToLetPlay -= 1;
        videoSnare.onended(() => {});
      });
      videoSnare.play();

      videoHat = p.createVideo("/assets/hat.mp4", () => {
        assetsToLoad -= 1;
      });
      videoHat.volume(0.0);
      videoHat.onended(() => {
        videosToLetPlay -= 1;
        videoHat.onended(() => {});
      });
      videoHat.play();

      videoChord = p.createVideo("/assets/chord.mp4", () => {
        assetsToLoad -= 1;
      });
      videoChord.volume(0.0);
      videoChord.onended(() => {
        videosToLetPlay -= 1;
        videoChord.onended(() => {});
      });
      videoChord.play();

      videoLeadA = p.createVideo("/assets/leadA.mp4", () => {
        assetsToLoad -= 1;
      });
      videoLeadA.volume(0.0);
      videoLeadA.onended(() => {
        videosToLetPlay -= 1;
        videoLeadA.onended(() => {});
      });
      videoLeadA.play();

      videoLeadB = p.createVideo("/assets/leadB.mp4", () => {
        assetsToLoad -= 1;
      });
      videoLeadB.volume(0.0);
      videoLeadB.onended(() => {
        videosToLetPlay -= 1;
        videoLeadB.onended(() => {});
      });
      videoLeadB.play();

      videoLeadC = p.createVideo("/assets/leadC.mp4", () => {
        assetsToLoad -= 1;
      });
      videoLeadC.volume(0.0);
      videoLeadC.onended(() => {
        videosToLetPlay -= 1;
        videoLeadC.onended(() => {});
      });
      videoLeadC.play();

      videoLeadD = p.createVideo("/assets/leadD.mp4", () => {
        assetsToLoad -= 1;
      });
      videoLeadD.volume(0.0);
      videoLeadD.onended(() => {
        videosToLetPlay -= 1;
        videoLeadD.onended(() => {});
      });
      videoLeadD.play();

      videoLeadE = p.createVideo("/assets/leadE.mp4", () => {
        assetsToLoad -= 1;
      });
      videoLeadE.volume(0.0);
      videoLeadE.onended(() => {
        videosToLetPlay -= 1;
        videoLeadE.onended(() => {});
      });
      videoLeadE.play();
    }

    // scenes
    sceneArp = new SceneArp(p);
    sceneBass = new SceneBass(p);
    sceneDrums = new SceneDrums(p);
    sceneLead = new SceneLead(p);
    sceneSuperHat = new SceneSuperHat(p);

    currentScene = sceneBass;

    // shaders
    {
      p.loadShader(
        "/glsl/default.vert",
        "/glsl/greenAndPurple.frag",
        (s: p5.default.Shader) => {
          shaderGP = new ShaderGP(p, s);
          assetsToLoad -= 1;
          currentShader = shaderGP;
        },
      );
      p.loadShader(
        "/glsl/default.vert",
        "/glsl/horizSub.frag",
        (s: p5.default.Shader) => {
          shaderHorizSub = new ShaderHorizSub(p, s);
          assetsToLoad -= 1;
        },
      );
      p.loadShader(
        "/glsl/default.vert",
        "/glsl/cross.frag",
        (s: p5.default.Shader) => {
          shaderCross = new ShaderCross(p, s);
          assetsToLoad -= 1;
          //currentShader = shaderCross;
        },
      );
      p.loadShader(
        "/glsl/default.vert",
        "/glsl/hsvAb.frag",
        (s: p5.default.Shader) => {
          shaderHsvAb = new ShaderHsvAb(p, s);
          assetsToLoad -= 1;
          //currentShader = shaderHsvAb;
        },
      );
    }

    // render layers
    layerMasterShader = p.createFramebuffer();
    layerSuperHat = p.createFramebuffer();
  };

  p.draw = () => {
    if (started === null) {
      const videos = [
        videoHat,
        videoKick,
        videoSnare,
        videoChord,
        videoArp,
        videoBassA,
        videoLeadA,
        videoLeadB,
        videoLeadC,
        videoLeadD,
        videoLeadE,
      ];
      for (const v of videos) {
        if (v.elt.readyState >= v.elt.HAVE_ENOUGH_DATA) {
          p.image(v, 0, 0);
        }
      }

      p.background(0);
      p.scale(2.0);
      p.fill(234, 118, 203, 255);
      p.text("sin(ms)", 5 - p.width / 4, 25 - p.height / 4);
      p.scale(0.5);
      p.fill(234, 118, 203, 120);
      p.text(VERSION, 150 - p.width / 2, 45 - p.height / 2);
      p.fill((255 + 234) / 2, (255 + 118) / 2, (255 + 223) / 2, 255);
      p.text(
        "a demo/YTPMV written in p5 ++ typescript/glsl",
        10 - p.width / 2,
        70 - p.height / 2,
      );
      p.text("/!\\ flashing lights /!\\", 10 - p.width / 2, 90 - p.height / 2);
      p.fill(255, 255, 255, 255);
      p.text(
        "works best on chromium-based browsers",
        10 - p.width / 2,
        130 - p.height / 2,
      );
      p.fill(255, 255, 255, 155);
      p.text(
        "turn on hardware acceleration, make sure you're using your discrete gpu",
        10 - p.width / 2,
        150 - p.height / 2,
      );
      p.fill(255, 255, 255, 55);
      p.text(
        "interface with your vertices, use your fragments for everything else",
        10 - p.width / 2,
        170 - p.height / 2,
      );
      p.fill(234, 118, 203, 255);
      p.text(
        assetsToLoad > 0 || videosToLetPlay > 0
          ? "Loading..."
          : "Click to start...",
        10 - p.width / 2,
        210 - p.height / 2,
      );
      p.text(
        DEBUG ? "DEBUG MODE ENABLED" : "",
        10 - p.width / 2,
        230 - p.height / 2,
      );

      return;
    }

    let adjustedMillis = p.millis() - started + START_OFFSET - 150; //150 because of audio offsets

    bpm.update(adjustedMillis, p);

    // bg
    p.background(0);

    if (currentScene !== null) {
      // scenes
      currentScene.draw(adjustedMillis, p);
      sceneSuperHat.draw(adjustedMillis, p);

      p.ortho();
      p.camera(0, 0, 800, 0, 0, 0);
      p.resetMatrix();
      p.resetShader();

      layerMasterShader.begin();
      if (bpm.beat >= 4 * 16 + 2) {
        currentShader.apply(p, adjustedMillis, currentScene.buffer);
      }
      p.image(currentScene.buffer, -p.width / 2, -p.height / 2);
      layerMasterShader.end();

      layerSuperHat.begin();
      if (bpm.beat >= 12 * 16 + 2) {
        p.shader(glslHatSuperposer);
        glslHatSuperposer.setUniform("uTexMain", layerMasterShader);
        glslHatSuperposer.setUniform("uTexHat", sceneSuperHat.buffer);
        glslHatSuperposer.setUniform(
          "scale",
          2.8 + 0.7 * Math.sin(adjustedMillis / 700),
        );
        glslHatSuperposer.setUniform("offset", [
          5 * Math.sin(adjustedMillis / 1900),
          adjustedMillis / 500 + Math.sin(adjustedMillis / 1100),
        ]);
        glslHatSuperposer.setUniform(
          "superposerOpacity",
          superhatOpacityUnlerped,
        );
      }
      p.image(layerMasterShader, -p.width / 2, -p.height / 2);
      superhatOpacityUnlerped = p.lerp(
        superhatOpacityUnlerped,
        0,
        SUPERHAT_OPACITY_LERP_FACTOR,
      );
      layerSuperHat.end();

      p.shader(glslZoom);
      glslZoom.setUniform("uTex", layerSuperHat);
      glslZoom.setUniform("zoom", zoomUnlerped);
      p.image(layerSuperHat, -p.width / 2, -p.height / 2);
      zoomUnlerped = p.lerp(zoomUnlerped, 1, ZOOM_KICK_LERP_FACTOR);
    }

    // could draw text that shows the name of the scene :p

    if (DEBUG) {
      p.fill(255, 0, 255, 255);
      p.text(
        "SMILE " + VERSION + " - debug mode",
        10 - p.width / 2,
        30 - p.height / 2,
      );
      p.fill(255, 255, 255, 255);
      p.text("fps: " + p.frameRate(), 10 - p.width / 2, 90 - p.height / 2);
      p.text("B: " + bpm.beat, 10 - p.width / 2, 110 - p.height / 2);
      p.text("L: " + bpm.line, 10 - p.width / 2, 130 - p.height / 2);
      p.text("T: " + bpm.tick, 10 - p.width / 2, 150 - p.height / 2);
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  p.mousePressed = () => {
    if (started !== null || assetsToLoad > 0 || videosToLetPlay > 0) {
      return;
    }

    song.play();
    song.time(START_OFFSET / 1000.0);

    song.volume(0.5);

    started = p.millis();

    let adjustedMillis = p.millis() - started + START_OFFSET - 150;

    sceneBass.demoStart(p);
    sceneDrums.demoStart(p);
    sceneLead.demoStart(p);
    sceneArp.demoStart(p);
    sceneSuperHat.demoStart(p);

    if (currentScene === null) {
      return;
    }
    currentScene.enter(adjustedMillis, p);
  };
};

// @ts-ignore
new p5(sketch);
