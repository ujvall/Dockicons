import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Minus, Plus } from 'lucide-react';

export interface StepperProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  onChange?: (val: number) => void;
}

const digitVariants = {
  initial: (dir: number) => ({
    y: dir > 0 ? 20 : -20,
    opacity: 0,
    scale: 0.5,
    z: 0,
    filter: 'blur(2px)',
  }),
  animate: {
    y: 0,
    opacity: 1,
    scale: 1,
    z: 10,
    filter: 'blur(0px)',
  },
  exit: (dir: number) => ({
    y: dir > 0 ? -20 : 20,
    opacity: 0,
    scale: 0.5,
    z: 0,
    filter: 'blur(2px)',
  }),
};

export function Stepper({
  value,
  defaultValue = 0,
  min = 0,
  max = 999,
  onChange,
}: StepperProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const [direction, setDirection] = useState(0);

  const current = isControlled ? value! : internal;
  const digits = current.toString().split('');

  const [prevDigits, setPrevDigits] = useState<string[]>([]);
  const [prevTicks, setPrevTicks] = useState<number[]>([]);
  const [shakeLeft, setShakeLeft] = useState(false);
  const [shakeRight, setShakeRight] = useState(false);

  const len = digits.length;
  const lenDiff = len - prevDigits.length;

  const nextTicks = digits.map((digit, i) => {
    const prevI = i - lenDiff;
    const prevDigit = prevI >= 0 ? prevDigits[prevI] : undefined;
    const prevTick = prevI >= 0 ? prevTicks[prevI] : 0;

    return digit !== prevDigit ? (prevTick ?? 0) + 1 : (prevTick ?? 0);
  });

  if (prevDigits.join("") !== digits.join("")) {
    setPrevTicks(nextTicks);
    setPrevDigits(digits);
  }

  const step = (dir: number) => {
    if (dir < 0 && current <= min) {
      setShakeLeft(true);
      return;
    }
    if (dir > 0 && current >= max) {
      setShakeRight(true);
      return;
    }

    const next = Math.min(max, Math.max(min, current + dir));
    if (next === current) return;
    setDirection(dir);
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  return (
    <div className="export-card" style={{ padding: '3px', gap: '12px', borderRadius: '14px' }}>
      <button
        onClick={() => step(-1)}
        className="btn-copy"
        style={{ padding: 0, width: '32px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '11px', boxSizing: 'border-box' }}
      >
        <motion.div
          animate={shakeLeft ? { rotate: [0, -20, 0] } : { rotate: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          onAnimationComplete={() => setShakeLeft(false)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Minus size={14} />
        </motion.div>
      </button>

      <div 
        style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#fff', fontSize: '1rem', height: '20px', width: '24px', overflow: 'hidden' }}
      >
        {digits.map((digit, index) => (
          <div
            key={len - index}
            style={{ position: 'relative', width: '10px', height: '24px', display: 'flex', justifyContent: 'center' }}
          >
            <AnimatePresence
              mode="popLayout"
              initial={false}
              custom={direction}
            >
              <motion.span
                key={nextTicks[index]}
                custom={direction}
                variants={digitVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 16,
                  mass: 1.2,
                }}
                style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontVariantNumeric: 'tabular-nums' }}
              >
                {digit}
              </motion.span>
            </AnimatePresence>
          </div>
        ))}
      </div>

      <button
        onClick={() => step(1)}
        className="btn-copy"
        style={{ padding: 0, width: '32px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '11px', boxSizing: 'border-box' }}
      >
        <motion.div
          animate={shakeRight ? { rotate: [0, 20, 0] } : { rotate: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          onAnimationComplete={() => setShakeRight(false)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Plus size={14} />
        </motion.div>
      </button>
    </div>
  );
}
