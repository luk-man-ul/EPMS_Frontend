import './TypingIndicator.css';

interface TypingIndicatorProps {
  userNames: string[];
}

export function TypingIndicator({ userNames }: TypingIndicatorProps) {
  if (userNames.length === 0) return null;

  const displayText =
    userNames.length === 1
      ? `${userNames[0]} is typing...`
      : userNames.length === 2
      ? `${userNames[0]} and ${userNames[1]} are typing...`
      : `${userNames[0]} and ${userNames.length - 1} others are typing...`;

  return (
    <div className="typing-indicator-container">
      <div className="typing-indicator">
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
      </div>
      <span className="typing-text">{displayText}</span>
    </div>
  );
}
