export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';
  return (
    <div className="flex items-center justify-center">
      <div className={`${s} border-2 border-cream-300 border-t-stone-900 rounded-full animate-spin`} />
    </div>
  );
}
