export default function EmptyState({ title = 'Nothing here yet', text = '' }: {
  title?: string;
  text?: string;
}) {
  return (
    <div className="empty-state">
      <div className="empty-title">{title}</div>
      {text && <div className="empty-text">{text}</div>}
    </div>
  );
}
