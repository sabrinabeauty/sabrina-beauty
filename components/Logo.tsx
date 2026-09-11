export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-serif text-2xl tracking-wide text-charcoal ${className}`}>
      Sabrina <span className="italic text-sage">Beauty</span>
    </span>
  );
}
