import { useEffect, useRef, useState } from 'react'
import type { Frame, KeypointSet } from '../../types/run'

const MIN_ALPHA = 0.25
const LOW_CONFIDENCE = 0.5
const JOINT_RADIUS = 4

const SIDE_COLOURS = { left: '56, 189, 248', right: '251, 146, 60', centre: '226, 232, 240' }

function sideOf(name: string) {
  if (name.startsWith('left_')) return SIDE_COLOURS.left
  if (name.startsWith('right_')) return SIDE_COLOURS.right
  return SIDE_COLOURS.centre
}

// Bones within one side take that side's colour; bones crossing sides are neutral.
function boneColour(a: string, b: string) {
  const side = sideOf(a)
  return side === sideOf(b) ? side : SIDE_COLOURS.centre
}

const alphaFor =(confidence: number) => Math.max(MIN_ALPHA, confidence)

type Props = {
  frame: Frame | undefined
  keypointSet: KeypointSet
  flaggedJoints: ReadonlySet<string>
}

/** Canvas stacked over the video; keypoints are normalised 0–1 coordinates. */
export function SkeletonOverlay({ frame, keypointSet, flaggedJoints }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(size.width * dpr)
    canvas.height = Math.round(size.height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size.width, size.height)
    if (!frame) return

    const index = new Map(keypointSet.names.map((name, i) => [name, i]))
    const point = (name: string) => {
      const i = index.get(name)
      return i === undefined ? null : frame.keypoints[i]
    }
    const px = (x: number) => x * size.width
    const py = (y: number) => y * size.height

    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    for (const [a, b] of keypointSet.skeleton) {
      const pa = point(a)
      const pb = point(b)
      if (!pa || !pb) continue
      const confidence = Math.min(pa.confidence, pb.confidence)
      ctx.setLineDash(confidence < LOW_CONFIDENCE ? [6, 5] : [])
      ctx.strokeStyle = `rgba(${boneColour(a, b)}, ${alphaFor(confidence)})`
      ctx.beginPath()
      ctx.moveTo(px(pa.x), py(pa.y))
      ctx.lineTo(px(pb.x), py(pb.y))
      ctx.stroke()
    }
    ctx.setLineDash([])

    keypointSet.names.forEach((name, i) => {
      const kp = frame.keypoints[i]
      if (!kp) return
      const colour = `rgba(${sideOf(name)}, ${alphaFor(kp.confidence)})`
      ctx.beginPath()
      ctx.arc(px(kp.x), py(kp.y), JOINT_RADIUS, 0, Math.PI * 2)
      if (kp.confidence < LOW_CONFIDENCE) {
        ctx.lineWidth = 1.5
        ctx.strokeStyle = colour
        ctx.stroke()
      } else {
        ctx.fillStyle = colour
        ctx.fill()
      }
      if (flaggedJoints.has(name)) {
        ctx.beginPath()
        ctx.lineWidth = 2
        ctx.strokeStyle = 'rgb(248, 113, 113)'
        ctx.arc(px(kp.x), py(kp.y), JOINT_RADIUS + 5, 0, Math.PI * 2)
        ctx.stroke()
      }
    })
  }, [frame, keypointSet, flaggedJoints, size])

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
}
