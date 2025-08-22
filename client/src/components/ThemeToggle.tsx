import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme') === 'dark';
    document.documentElement.classList.toggle('dark', saved);
    setDark(saved);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  return (
    <button className="btn rounded-full px-2 py-2" onClick={toggle} title="Toggle theme">
      {dark ? <Sun size={18}/> : <Moon size={18}/>}
    </button>
  );
}
