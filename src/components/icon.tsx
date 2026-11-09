export function Icon({ name = 'arrow', size = 20 }: { name?: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    external: <><path d="M7 17 17 7M7 7h10v10" /></>,
    chat: <><path d="M21 11.5a8.5 8.5 0 0 1-12.7 7.4L3 21l1.9-5.3A8.5 8.5 0 1 1 21 11.5Z"/><path d="M8 8c0 4 2 6 6 6l1-2-2-1-1 1-2-2 1-1-1-2Z"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    grid: <><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></>,
    help: <><path d="M4 13v-2a8 8 0 0 1 16 0v2M4 12h3v7H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1ZM20 12h-3v7h3a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1ZM17 19c0 2-2 2-5 2"/></>,
    shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.arrow}</svg>;
}
