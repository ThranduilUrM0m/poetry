export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideIn = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
};

export const defaultTransition = {
  type: "tween",
  duration: 0.4,
  ease: [0.65, 0, 0.35, 1], // matches $ease-in-out-soft
};

export const bounceTransition = {
  type: "spring",
  stiffness: 200,
  damping: 20,
};
