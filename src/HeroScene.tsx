import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { projectAsset } from './assets'

const sceneImages = [
  'eureka-orchestration.png',
  'gateway-observability.png',
  'gateway-models.png',
  'ai-studio-home.png',
  'ai-studio-media.png',
  'ai-studio-script.png',
]

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))

function startCanvasFallback(
  canvas: HTMLCanvasElement,
  triggerId: string,
  mode: 'hero' | 'impact',
  reduceMotion: boolean,
) {
  const context = canvas.getContext('2d')
  if (!context) return

  const isMobile = window.innerWidth <= 768
  const pointCount = isMobile ? 420 : 980
  const points = Array.from({ length: pointCount }, () => {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    return {
      x: Math.sin(phi) * Math.cos(theta),
      y: Math.cos(phi),
      z: Math.sin(phi) * Math.sin(theta),
      size: 0.4 + Math.random() * 1.5,
    }
  })
  const images = sceneImages.map((name) => {
    const image = new Image()
    image.src = projectAsset(name)
    return image
  })

  let width = 0
  let height = 0
  let dpr = 1
  let progress = 0
  let frame = 0
  let startTime = performance.now()
  let isVisible = true

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio, 1.5)
    width = canvas.clientWidth || window.innerWidth
    height = canvas.clientHeight || window.innerHeight
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  const updateScroll = () => {
    const trigger = document.getElementById(triggerId)
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    progress = clamp(-rect.top / Math.max(1, trigger.offsetHeight - window.innerHeight))
  }

  const render = (timestamp = performance.now()) => {
    if (!isVisible) {
      if (!reduceMotion) frame = window.requestAnimationFrame(render)
      return
    }

    const time = (timestamp - startTime) / 1000
    const rotation = time * 0.12 + progress * 2.4
    const cos = Math.cos(rotation)
    const sin = Math.sin(rotation)
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) * (isMobile ? 0.24 : 0.3) * (1 + progress * 0.55)
    const focal = 3.8

    context.clearRect(0, 0, width, height)

    points.forEach((point) => {
      const rotatedX = point.x * cos - point.z * sin
      const rotatedZ = point.x * sin + point.z * cos
      const scale = focal / (focal - rotatedZ)
      const separation = progress * point.size * 22
      const x = centerX + rotatedX * (radius + separation) * scale
      const y = centerY + point.y * (radius + separation) * scale
      context.globalAlpha = (0.18 + scale * 0.34) * (mode === 'impact' ? 0.9 : 1)
      context.fillStyle = '#f5f5f2'
      context.beginPath()
      context.arc(x, y, Math.max(0.45, point.size * scale), 0, Math.PI * 2)
      context.fill()
    })

    const cardVisibility =
      mode === 'impact'
        ? clamp((progress - 0.05) / 0.18) * clamp((0.96 - progress) / 0.15)
        : 1 - progress * 0.82
    const cardCount = isMobile ? 6 : 12

    for (let index = 0; index < cardCount; index += 1) {
      const angle = (index / cardCount) * Math.PI * 2 - rotation * 0.75
      const ring = radius * (1.35 + (index % 3) * 0.2)
      const z = Math.sin(angle)
      const scale = 0.72 + (z + 1) * 0.22
      const cardWidth = (isMobile ? 105 : 165) * scale * (1 + progress * 0.55)
      const cardHeight = cardWidth / 2.03
      const x = centerX + Math.cos(angle) * ring - cardWidth / 2
      const y =
        centerY +
        Math.sin(angle * 1.7) * radius * 0.7 +
        (index % 2 ? -1 : 1) * radius * 0.28 -
        cardHeight / 2
      const image = images[index % images.length]

      if (!image.complete) continue
      context.globalAlpha = cardVisibility * (0.22 + (z + 1) * 0.33)
      context.save()
      context.translate(x + cardWidth / 2, y + cardHeight / 2)
      context.rotate(Math.sin(angle) * 0.12)
      context.drawImage(image, -cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight)
      context.strokeStyle = 'rgba(255,255,255,.35)'
      context.lineWidth = 1
      context.strokeRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight)
      context.restore()
    }

    context.globalAlpha = 1
    if (!reduceMotion) frame = window.requestAnimationFrame(render)
  }

  resize()
  updateScroll()
  startTime = performance.now()
  const observer = new IntersectionObserver(
    ([entry]) => {
      isVisible = entry?.isIntersecting ?? true
    },
    { rootMargin: '100% 0px' },
  )
  observer.observe(canvas)
  window.addEventListener('resize', resize)
  window.addEventListener('scroll', updateScroll, { passive: true })
  render()

  return () => {
    window.cancelAnimationFrame(frame)
    observer.disconnect()
    window.removeEventListener('resize', resize)
    window.removeEventListener('scroll', updateScroll)
  }
}

type HeroSceneProps = {
  mode?: 'hero' | 'impact'
  triggerId?: string
}

export function HeroScene({ mode = 'hero', triggerId = 'hero-trigger' }: HeroSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const isMobile = window.matchMedia('(max-width: 768px)').matches
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const probe = document.createElement('canvas')
    const supportsWebGL = Boolean(probe.getContext('webgl2') || probe.getContext('webgl'))

    if (!supportsWebGL) {
      return startCanvasFallback(canvas, triggerId, mode, reduceMotion)
    }

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: !isMobile,
        powerPreference: 'high-performance',
      })
    } catch {
      return startCanvasFallback(canvas, triggerId, mode, reduceMotion)
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.6))
    renderer.outputColorSpace = THREE.SRGBColorSpace

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(0, 0, 8.4)

    const particleCount = isMobile ? 2600 : 6200
    const positions = new Float32Array(particleCount * 3)
    const randoms = new Float32Array(particleCount)

    for (let index = 0; index < particleCount; index += 1) {
      const radius = 2.05 + (Math.random() - 0.5) * 0.18
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const offset = index * 3

      positions[offset] = radius * Math.sin(phi) * Math.cos(theta)
      positions[offset + 1] = radius * Math.cos(phi)
      positions[offset + 2] = radius * Math.sin(phi) * Math.sin(theta)
      randoms[index] = Math.random()
    }

    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))

    const particleMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uProgress;
        uniform float uPixelRatio;
        attribute float aRandom;
        varying float vAlpha;

        void main() {
          vec3 direction = normalize(position);
          float wave = sin(position.y * 4.0 + uTime * 0.65 + aRandom * 8.0);
          float separation = uProgress * (0.8 + aRandom * 4.6);
          vec3 displaced = position * (1.0 + uProgress * 0.72);
          displaced += direction * separation;
          displaced += direction * wave * (0.025 + uProgress * 0.18);

          vec4 modelPosition = modelMatrix * vec4(displaced, 1.0);
          vec4 viewPosition = viewMatrix * modelPosition;
          gl_Position = projectionMatrix * viewPosition;
          gl_PointSize = (2.2 + aRandom * 2.4) * uPixelRatio * (9.0 / -viewPosition.z);
          vAlpha = mix(0.82, 0.18 + aRandom * 0.46, uProgress);
        }
      `,
      fragmentShader: `
        varying float vAlpha;

        void main() {
          float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
          float alpha = 1.0 - smoothstep(0.16, 0.5, distanceToCenter);
          gl_FragColor = vec4(vec3(0.96), alpha * vAlpha);
        }
      `,
    })

    const particleSphere = new THREE.Points(particleGeometry, particleMaterial)
    scene.add(particleSphere)

    const haloGeometry = new THREE.IcosahedronGeometry(2.18, 2)
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.07,
      depthWrite: false,
    })
    const halo = new THREE.Mesh(haloGeometry, haloMaterial)
    scene.add(halo)

    const panelGroup = new THREE.Group()
    scene.add(panelGroup)

    const panelGeometry = new THREE.PlaneGeometry(1.35, 0.68, 8, 4)
    const textureLoader = new THREE.TextureLoader()
    const textures: THREE.Texture[] = []
    const panels: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[] = []
    const panelCount = isMobile ? 9 : 22
    const goldenAngle = Math.PI * (3 - Math.sqrt(5))

    for (let index = 0; index < panelCount; index += 1) {
      const texture = textureLoader.load(
        projectAsset(sceneImages[index % sceneImages.length]),
      )
      texture.colorSpace = THREE.SRGBColorSpace
      texture.minFilter = THREE.LinearFilter
      textures.push(texture)

      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthTest: false,
      })
      const panel = new THREE.Mesh(panelGeometry, material)
      const normalizedY = 1 - (index / Math.max(1, panelCount - 1)) * 2
      const horizontalRadius = Math.sqrt(1 - normalizedY * normalizedY)
      const angle = goldenAngle * index
      const radius = isMobile ? 3.05 : 3.55

      panel.position.set(
        Math.cos(angle) * horizontalRadius * radius,
        normalizedY * radius,
        Math.sin(angle) * horizontalRadius * radius,
      )
      panel.userData.phase = angle
      panel.userData.baseScale = 0.72 + Math.random() * 0.38
      panel.scale.setScalar(panel.userData.baseScale)
      panelGroup.add(panel)
      panels.push(panel)
    }

    const pointer = new THREE.Vector2()
    const smoothPointer = new THREE.Vector2()
    let scrollProgress = 0
    let scrollVelocity = 0
    let lastScrollY = window.scrollY
    let frame = 0
    let isVisible = true
    const clock = new THREE.Clock()
    const panelWorldPosition = new THREE.Vector3()

    const resize = () => {
      const width = canvas.clientWidth || window.innerWidth
      const height = canvas.clientHeight || window.innerHeight
      renderer.setSize(width, height, false)
      camera.aspect = width / Math.max(1, height)
      camera.updateProjectionMatrix()
      particleMaterial.uniforms.uPixelRatio.value = renderer.getPixelRatio()
    }

    const updateScroll = () => {
      const trigger = document.getElementById(triggerId)
      if (!trigger) return

      const rect = trigger.getBoundingClientRect()
      const scrollableDistance = Math.max(1, trigger.offsetHeight - window.innerHeight)
      scrollProgress = clamp(-rect.top / scrollableDistance)
      scrollVelocity += (window.scrollY - lastScrollY - scrollVelocity) * 0.16
      lastScrollY = window.scrollY
    }

    const updatePointer = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.y = -((event.clientY / window.innerHeight) * 2 - 1)
    }

    const render = () => {
      frame = window.requestAnimationFrame(render)
      if (!isVisible) return

      const time = clock.getElapsedTime()
      const easedProgress = scrollProgress * scrollProgress * (3 - 2 * scrollProgress)

      smoothPointer.lerp(pointer, 0.045)
      scrollVelocity *= 0.91
      particleMaterial.uniforms.uTime.value = time
      particleMaterial.uniforms.uProgress.value =
        mode === 'impact' ? 0.2 + easedProgress * 0.72 : easedProgress

      particleSphere.rotation.y = time * 0.035 + scrollProgress * 1.9 + scrollVelocity * 0.00035
      particleSphere.rotation.x = smoothPointer.y * 0.12 + Math.sin(time * 0.16) * 0.04
      halo.rotation.y = -time * 0.02 - scrollProgress * 0.7
      halo.rotation.x = time * 0.013

      panelGroup.rotation.y = -time * 0.022 - scrollProgress * 2.2 + scrollVelocity * 0.00022
      panelGroup.rotation.x = smoothPointer.y * 0.08 + scrollProgress * 0.18
      panelGroup.position.z = scrollProgress * (mode === 'impact' ? 2.1 : 1.4)

      panels.forEach((panel, index) => {
        panel.lookAt(camera.position)
        panel.getWorldPosition(panelWorldPosition)
        const facing = clamp((panelWorldPosition.z + 3.8) / 7.6)
        const reveal = clamp((time - 0.45 - index * 0.035) / 0.55)
        const scrollVisibility =
          mode === 'impact'
            ? clamp((scrollProgress - 0.06) / 0.16) * clamp((0.96 - scrollProgress) / 0.14)
            : 1 - scrollProgress * 0.78
        panel.material.opacity = reveal * (0.1 + facing * 0.78) * scrollVisibility
        const breathing = 1 + Math.sin(time * 0.65 + panel.userData.phase) * 0.035
        const scale =
          panel.userData.baseScale *
          breathing *
          (1 + scrollProgress * (mode === 'impact' ? 2.35 : 1.7))
        panel.scale.setScalar(scale)
      })

      camera.position.x += (smoothPointer.x * 0.55 - camera.position.x) * 0.045
      camera.position.y += (smoothPointer.y * 0.38 - camera.position.y) * 0.045
      camera.position.z =
        mode === 'impact' ? 9.2 - easedProgress * 3.1 : 8.4 - easedProgress * 2.6
      camera.lookAt(0, 0, 0)
      renderer.render(scene, camera)
    }

    resize()
    updateScroll()
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry?.isIntersecting ?? true
      },
      { rootMargin: '100% 0px' },
    )
    observer.observe(canvas)
    window.addEventListener('resize', resize)
    window.addEventListener('scroll', updateScroll, { passive: true })
    if (!isMobile) window.addEventListener('pointermove', updatePointer, { passive: true })

    if (reduceMotion) {
      renderer.render(scene, camera)
    } else {
      render()
    }

    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', updateScroll)
      window.removeEventListener('pointermove', updatePointer)
      particleGeometry.dispose()
      particleMaterial.dispose()
      haloGeometry.dispose()
      haloMaterial.dispose()
      panelGeometry.dispose()
      panels.forEach((panel) => panel.material.dispose())
      textures.forEach((texture) => texture.dispose())
      renderer.dispose()
    }
  }, [mode, triggerId])

  return (
    <canvas
      className={`hero-scene-canvas hero-scene-canvas--${mode}`}
      ref={canvasRef}
      aria-hidden="true"
    />
  )
}
