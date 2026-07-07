import { useRef, useState } from 'react';
import type { EventRecord } from '../lib/api';
import { EventCard } from './EventCard';

const SWIPE_THRESHOLD = 100;

interface SwipeDeckProps {
  events: EventRecord[];
  onSignUp: (event: EventRecord) => void;
  onSkip: (event: EventRecord) => void;
  busy?: boolean;
}

export function SwipeDeck({ events, onSignUp, onSkip, busy }: SwipeDeckProps) {
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [exiting, setExiting] = useState<'left' | 'right' | null>(null);
  const start = useRef({ x: 0, y: 0 });

  const top = events[0];
  const next = events[1];

  function handlePointerDown(e: React.PointerEvent) {
    if (exiting || busy) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging || exiting) return;
    setDrag({ x: e.clientX - start.current.x, y: e.clientY - start.current.y });
  }

  function handlePointerUp() {
    if (!dragging || exiting) return;
    setDragging(false);
    if (drag.x > SWIPE_THRESHOLD) fireSwipe('right');
    else if (drag.x < -SWIPE_THRESHOLD) fireSwipe('left');
    else setDrag({ x: 0, y: 0 });
  }

  function fireSwipe(direction: 'left' | 'right') {
    if (!top) return;
    setDragging(false);
    setExiting(direction);
    setTimeout(() => {
      setExiting(null);
      setDrag({ x: 0, y: 0 });
      if (direction === 'right') onSignUp(top);
      else onSkip(top);
    }, 220);
  }

  if (!top) return null;

  const style: React.CSSProperties = exiting
    ? {
        transform: `translate(${exiting === 'right' ? 600 : -600}px, ${drag.y}px) rotate(${exiting === 'right' ? 24 : -24}deg)`,
        opacity: 0,
        transition: 'transform 220ms ease, opacity 220ms ease',
      }
    : {
        transform: `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x / 18}deg)`,
        transition: dragging ? 'none' : 'transform 200ms ease',
      };

  return (
    <div className="swipe-deck">
      <div className="swipe-deck__stack">
        {next && (
          <div className="swipe-card swipe-card--behind">
            <EventCard event={next} />
          </div>
        )}
        <div
          className="swipe-card"
          style={style}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {drag.x > 20 && <span className="swipe-badge swipe-badge--right">SIGN UP</span>}
          {drag.x < -20 && <span className="swipe-badge swipe-badge--left">SKIP</span>}
          <EventCard event={top} />
        </div>
      </div>

      <div className="swipe-deck__actions">
        <button type="button" className="swipe-action swipe-action--skip" onClick={() => fireSwipe('left')} disabled={busy}>
          Skip
        </button>
        <button type="button" className="swipe-action swipe-action--signup" onClick={() => fireSwipe('right')} disabled={busy}>
          Sign Up
        </button>
      </div>
    </div>
  );
}
