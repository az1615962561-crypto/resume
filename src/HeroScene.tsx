import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const sceneImages = [
  'eureka-orchestration.png',
  'gateway-observability.png',
  'gateway-models.png',
  'ai-studio-home.png',
  'ai-studio-media.png',
  'ai-studio-script.png',
]

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))

export function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const isMobile = window.matchMedia('(max-width: 768px)').matches
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
    })
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
        `${import.meta.env.BASE_URL}projects/${sceneImages[index % sceneImages.length]}`,
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
    const clock = new THREE.Clock()

    const resize = () => {
      const width = canvas.clientWidth || window.innerWidth
      const height = canvas.clientHeight || window.innerHeight
      renderer.setSize(width, height, false)
      camera.aspect = width / Math.max(1, height)
      camera.updateProjectionMatrix()
      particleMaterial.uniforms.uPixelRatio.value = renderer.getPixelRatio()
    }

    const updateScroll = () => {
      const trigger = document.querySelector<HTMLElement>('#hero-trigger')
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
      const time = clock.getElapsedTime()
      const easedProgress = scrollProgress * scrollProgress * (3 - 2 * scrollProgress)

      smoothPointer.lerp(pointer, 0.045)
      scrollVelocity *= 0.91
      particleMaterial.uniforms.uTime.value = time
      particleMaterial.uniforms.uProgress.value = easedProgress

      particleSphere.rotation.y = time * 0.035 + scrollProgress * 1.9 + scrollVelocity * 0.00035
      particleSphere.rotation.x = smoothPointer.y * 0.12 + Math.sin(time * 0.16) * 0.04
      halo.rotation.y = -time * 0.02 - scrollProgress * 0.7
      halo.rotation.x = time * 0.013

      panelGroup.rotation.y = -time * 0.022 - scrollProgress * 2.2 + scrollVelocity * 0.00022
      panelGroup.rotation.x = smoothPointer.y * 0.08 + scrollProgress * 0.18
      panelGroup.position.z = scrollProgress * 1.4

      panels.forEach((panel, index) => {
        panel.lookAt(camera.position)
        const worldPosition = new THREE.Vector3()
        panel.getWorldPosition(worldPosition)
        const facing = clamp((worldPosition.z + 3.8) / 7.6)
        const reveal = clamp((time - 0.45 - index * 0.035) / 0.55)
        panel.material.opacity = reveal * (0.1 + facing * 0.78) * (1 - scrollProgress * 0.78)
        const breathing = 1 + Math.sin(time * 0.65 + panel.userData.phase) * 0.035
        const scale = panel.userData.baseScale * breathing * (1 + scrollProgress * 1.7)
        panel.scale.setScalar(scale)
      })

      camera.position.x += (smoothPointer.x * 0.55 - camera.position.x) * 0.045
      camera.position.y += (smoothPointer.y * 0.38 - camera.position.y) * 0.045
      camera.position.z = 8.4 - easedProgress * 2.6
      camera.lookAt(0, 0, 0)
      renderer.render(scene, camera)
    }

    resize()
    updateScroll()
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
  }, [])

  return <canvas className="hero-scene-canvas" ref={canvasRef} aria-hidden="true" />
}
