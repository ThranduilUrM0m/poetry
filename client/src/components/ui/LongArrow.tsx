export default function LongArrow() {
  return (
    <svg 
      viewBox="0 0 200 24"  // Increased width of viewBox
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M0 12H190M190 12L178 2M190 12L178 22"  // Extended line and adjusted arrow head position
        stroke="currentColor" 
        strokeWidth="2"
      />
    </svg>
  );
}