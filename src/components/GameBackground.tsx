import { useEffect, useState } from 'react';
import { Zap, Cpu, Shield, Wifi, Database, Lock } from 'lucide-react';

interface FloatingIcon {
  id: number;
  icon: React.ComponentType<any>;
  x: number;
  y: number;
  speed: number;
  rotation: number;
  size: number;
}

export default function GameBackground() {
  const [floatingIcons, setFloatingIcons] = useState<FloatingIcon[]>([]);
  const [time, setTime] = useState(0);

  const iconTypes = [Zap, Cpu, Shield, Wifi, Database, Lock];

  useEffect(() => {
    // Initialize floating icons
    const icons: FloatingIcon[] = [];
    for (let i = 0; i < 15; i++) {
      icons.push({
        id: i,
        icon: iconTypes[Math.floor(Math.random() * iconTypes.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        speed: 0.1 + Math.random() * 0.3,
        rotation: Math.random() * 360,
        size: 16 + Math.random() * 16
      });
    }
    setFloatingIcons(icons);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => prev + 1);
      
      setFloatingIcons(prev => prev.map(icon => ({
        ...icon,
        y: (icon.y + icon.speed) % 110,
        rotation: icon.rotation + 0.5
      })));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-blue-900/10 to-purple-900/20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transform: `translate(${Math.sin(time * 0.01) * 10}px, ${Math.cos(time * 0.01) * 10}px)`
          }}
        />
      </div>

      {/* Floating Icons */}
      {floatingIcons.map((iconData) => {
        const IconComponent = iconData.icon;
        return (
          <div
            key={iconData.id}
            className="absolute text-cyan-400/30"
            style={{
              left: `${iconData.x}%`,
              top: `${iconData.y}%`,
              transform: `rotate(${iconData.rotation}deg)`,
              fontSize: `${iconData.size}px`
            }}
          >
            <IconComponent size={iconData.size} />
          </div>
        );
      })}

      {/* Pulsing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-red-500/10 rounded-full animate-pulse" />
      <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-cyan-500/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-purple-500/10 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Scanning Lines */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `linear-gradient(90deg, transparent 0%, rgba(0, 255, 255, 0.1) 50%, transparent 100%)`,
          transform: `translateX(${Math.sin(time * 0.02) * 100}%)`,
          width: '200%'
        }}
      />
      
      {/* Digital Rain Effect */}
      <div className="absolute inset-0 opacity-20">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-px bg-gradient-to-b from-transparent via-cyan-400 to-transparent"
            style={{
              left: `${(i * 5) % 100}%`,
              height: '100px',
              top: `${(time * 0.5 + i * 20) % 120}%`,
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </div>

      {/* Corner Decorations */}
      <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-cyan-400/50" />
      <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-cyan-400/50" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-cyan-400/50" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-cyan-400/50" />
    </div>
  );
}