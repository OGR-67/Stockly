interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-60 bg-bark text-white text-sm text-center py-3 px-4 rounded-xl shadow-lg">
      {message}
    </div>
  );
}
