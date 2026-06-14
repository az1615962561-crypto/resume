import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { projectAsset } from './assets'

/** 转鼓上的全部 11 张素材图（上排 6 张 + 下排 5 张，各出现一次） */
const drumImages = [
  'eureka-orchestration.png',
  'gateway-observability.png',
  'gateway-models.png',
  'ai-studio-home.png',
  'ai-studio-media.png',
  'ai-studio-script.png',
  'model-eval-task.png',
  'model-eval-config.png',
  'qinglian-store-01.jpg',
  'qinglian-store-02.jpg',
  'qinglian-store-03.jpg',
]

const RIBBON_TEXT = '●    NEVER STOP SHIPPING™     ●    VIBE CODING     ●    AI PRODUCT     '

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

/** 一条印着循环标语的白色文字丝带贴图 */
function makeRibbonTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 110
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#f4f4f0'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#0b0b0b'
  ctx.font = '600 50px "SFMono-Regular", "Roboto Mono", Consolas, monospace'
  ctx.textBaseline = 'middle'
  const phraseWidth = ctx.measureText(RIBBON_TEXT).width
  const copies = Math.max(1, Math.round(canvas.width / phraseWidth))
  const slot = canvas.width / copies
  for (let i = 0; i < copies; i += 1) {
    ctx.fillText(RIBBON_TEXT, i * slot, canvas.height / 2 + 2)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.anisotropy = 4
  return texture
}

/**
 * 简历目录页中央 3D：11 张项目图做成带黑色描边、彼此留有间隔的照片卡片，
 * 排成上下两排贴在圆筒壁上绕中轴旋转；中间一枚金属弹簧奖杯 + 一条干净的标语丝带。
 * 复刻参考站「Music website of the year」模块的旋转照片转鼓。
 */
export function DirectoryScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    const probe = document.createElement('canvas')
    const supportsWebGL = Boolean(probe.getContext('webgl2') || probe.getContext('webgl'))
    if (!supportsWebGL) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile })
    } catch {
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.3 : 1.6))
    renderer.outputColorSpace = THREE.SRGBColorSpace

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
    camera.position.set(0, 0.18, 6.1)

    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.9)
    keyLight.position.set(2.5, 3.5, 4)
    scene.add(keyLight)

    const drumRadius = isMobile ? 2.05 : 2.3
    const slots = 6
    const cardWidth = ((2 * Math.PI * drumRadius) / slots) * 0.78
    const cardHeight = cardWidth / 1.52
    const cardAspect = cardWidth / cardHeight
    const rowOffset = cardHeight / 2 + 0.3 // 两排之间留出空档

    // ── 照片卡片转鼓 ──
    const drum = new THREE.Group()
    scene.add(drum)

    const cardGeometry = new THREE.PlaneGeometry(cardWidth, cardHeight)
    const textureLoader = new THREE.TextureLoader()
    const textures: THREE.Texture[] = []
    const cards: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>[] = []

    const cardVertex = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `
    const cardFragment = `
      precision highp float;
      uniform sampler2D uMap;
      uniform float uAspect;
      uniform float uImgAspect;
      uniform float uRadius;
      uniform float uBorder;
      uniform float uTint;
      uniform float uReady;
      varying vec2 vUv;

      void main() {
        vec2 size = vec2(uAspect, 1.0);
        vec2 p = (vUv - 0.5) * size;
        vec2 b = size * 0.5 - vec2(uRadius);
        vec2 q = abs(p) - b;
        float dist = min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - uRadius;
        float alpha = 1.0 - smoothstep(-0.008, 0.008, dist);
        if (alpha <= 0.002) discard;

        // 黑色描边：靠近边缘的一圈
        float border = smoothstep(-uBorder - 0.004, -uBorder + 0.004, dist);

        // cover 方式采样图片（保持比例、居中裁切）
        vec2 uv = vUv;
        if (uImgAspect > uAspect) {
          uv.x = (uv.x - 0.5) * (uAspect / uImgAspect) + 0.5;
        } else {
          uv.y = (uv.y - 0.5) * (uImgAspect / uAspect) + 0.5;
        }
        vec3 img = texture2D(uMap, uv).rgb;
        vec3 placeholder = vec3(0.12, 0.12, 0.14);
        vec3 content = mix(placeholder, img * mix(0.5, 1.0, uTint), uReady);
        vec3 color = mix(content, vec3(0.04), border);

        gl_FragColor = vec4(color, alpha);
      }
    `

    const rows = [
      { y: rowOffset, images: drumImages.slice(0, 6) },
      { y: -rowOffset, images: drumImages.slice(6) },
    ]

    rows.forEach(({ y, images }) => {
      images.forEach((name, i) => {
        const material = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: true,
          depthTest: true,
          side: THREE.FrontSide,
          uniforms: {
            uMap: { value: null },
            uAspect: { value: cardAspect },
            uImgAspect: { value: cardAspect },
            uRadius: { value: 0.06 },
            uBorder: { value: 0.045 },
            uTint: { value: 1 },
            uReady: { value: 0 },
          },
          vertexShader: cardVertex,
          fragmentShader: cardFragment,
        })

        const texture = textureLoader.load(projectAsset(name), (loaded) => {
          loaded.colorSpace = THREE.SRGBColorSpace
          const image = loaded.image as HTMLImageElement
          material.uniforms.uImgAspect.value = image.width / image.height
          material.uniforms.uMap.value = loaded
          material.uniforms.uReady.value = 1
        })
        texture.colorSpace = THREE.SRGBColorSpace
        texture.minFilter = THREE.LinearFilter
        texture.generateMipmaps = false
        textures.push(texture)

        const angle = (i / slots) * Math.PI * 2
        const mesh = new THREE.Mesh(cardGeometry, material)
        mesh.position.set(Math.sin(angle) * drumRadius, y, Math.cos(angle) * drumRadius)
        mesh.rotation.y = angle
        drum.add(mesh)
        cards.push(mesh)
      })
    })

    // ── 中央金属弹簧奖杯 ──
    const coilPoints: THREE.Vector3[] = []
    const coilTurns = 7
    const coilHeight = 1.16
    const coilRadius = 0.3
    const coilSteps = 240
    for (let i = 0; i <= coilSteps; i += 1) {
      const t = i / coilSteps
      const a = t * coilTurns * Math.PI * 2
      coilPoints.push(
        new THREE.Vector3(Math.cos(a) * coilRadius, (t - 0.5) * coilHeight, Math.sin(a) * coilRadius),
      )
    }
    const coilGeometry = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(coilPoints),
      220,
      0.045,
      12,
      false,
    )
    const coilMaterial = new THREE.MeshStandardMaterial({
      color: 0xdcdcdc,
      metalness: 0.9,
      roughness: 0.28,
    })
    const coil = new THREE.Mesh(coilGeometry, coilMaterial)
    scene.add(coil)
    const baseGeometry = new THREE.CylinderGeometry(0.28, 0.34, 0.13, 36)
    const base = new THREE.Mesh(baseGeometry, coilMaterial)
    base.position.y = -(coilHeight / 2) - 0.05
    coil.add(base)
    // 仅弹簧等比例放大（照片转鼓尺寸不变）
    coil.scale.setScalar(2)

    // ── 单条干净的标语丝带（只显示正面，不出现反字） ──
    const ribbonTexture = makeRibbonTexture()
    const ribbonGeometry = new THREE.CylinderGeometry(1.55, 1.55, 0.3, 96, 1, true)
    const ribbonMaterial = new THREE.MeshBasicMaterial({
      map: ribbonTexture,
      transparent: true,
      side: THREE.FrontSide,
      depthWrite: false,
      opacity: 0.95,
    })
    const ribbon = new THREE.Mesh(ribbonGeometry, ribbonMaterial)
    ribbon.position.y = 0
    ribbon.rotation.x = 0.08
    ribbon.renderOrder = 3
    scene.add(ribbon)

    const pointer = new THREE.Vector2()
    const smoothPointer = new THREE.Vector2()
    const startTime = performance.now()
    const worldPosition = new THREE.Vector3()
    let frame = 0
    let isVisible = true

    const applyTint = () => {
      cards.forEach((card) => {
        card.getWorldPosition(worldPosition)
        const facing = clamp01((worldPosition.z / drumRadius) * 0.5 + 0.66)
        card.material.uniforms.uTint.value = facing
      })
    }

    const resize = () => {
      const width = canvas.clientWidth || 1
      const height = canvas.clientHeight || 1
      renderer.setSize(width, height, false)
      camera.aspect = width / Math.max(1, height)
      camera.updateProjectionMatrix()
    }

    const updatePointer = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.y = -((event.clientY / window.innerHeight) * 2 - 1)
    }

    const render = (timestamp = performance.now()) => {
      frame = window.requestAnimationFrame(render)
      if (!isVisible) return

      const time = (timestamp - startTime) / 1000
      smoothPointer.lerp(pointer, 0.05)

      drum.rotation.y = time * 0.16 + smoothPointer.x * 0.4
      drum.rotation.x = smoothPointer.y * 0.04
      applyTint()

      coil.rotation.y = -time * 0.5
      coil.position.y = Math.sin(time * 0.6) * 0.03
      ribbon.rotation.y = time * 0.14 + smoothPointer.x * 0.2

      camera.position.x += (smoothPointer.x * 0.4 - camera.position.x) * 0.05
      camera.position.y += (0.18 + smoothPointer.y * 0.28 - camera.position.y) * 0.05
      camera.lookAt(0, 0, 0)
      renderer.render(scene, camera)
    }

    resize()
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry?.isIntersecting ?? true
      },
      { rootMargin: '60% 0px' },
    )
    observer.observe(canvas)
    window.addEventListener('resize', resize)
    if (!isMobile) window.addEventListener('pointermove', updatePointer, { passive: true })

    if (reduceMotion) {
      const drawOnce = () => {
        applyTint()
        renderer.render(scene, camera)
        frame = window.requestAnimationFrame(drawOnce)
      }
      drawOnce()
    } else {
      render()
    }

    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', updatePointer)
      cardGeometry.dispose()
      cards.forEach((card) => card.material.dispose())
      textures.forEach((texture) => texture.dispose())
      coilGeometry.dispose()
      coilMaterial.dispose()
      baseGeometry.dispose()
      ribbonGeometry.dispose()
      ribbonTexture.dispose()
      ribbonMaterial.dispose()
      renderer.dispose()
    }
  }, [])

  return <canvas className="directory-canvas" ref={canvasRef} aria-hidden="true" />
}
