export default function EmptyState({ text }: { text: string }) {
  return (
    <p className="rounded-md border border-dashed border-line px-4 py-6 text-center text-xs text-inkmuted">
      {text}
    </p>
  );
}
