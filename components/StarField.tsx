import React, { useEffect, useRef } from 'react';

const StarField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    
    handleResize(); // Set initial size

    const stars: { x: number; y: number; size: number; alpha: number; speed: number }[] = [];

    const createStars = () => {
      for (let i = 0; i < 150; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.5,
          alpha: Math.random(),
          speed: Math.random() * 0.05
        });
      }
    };

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'white';

      stars.forEach(star => {
        star.alpha += star.speed * (Math.random() > 0.5 ? 1 : -1);
        if (star.alpha < 0) star.alpha = 0;
        if (star.alpha > 1) star.alpha = 1;

        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    createStars();
    animate();

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-40"
    />
  );
};

export default StarField;