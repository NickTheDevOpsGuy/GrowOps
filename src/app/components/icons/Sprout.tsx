// Sprout.tsx
import { IconBase } from '../PlantIcon';
export function Sprout(props: { className?: string }) {
  return (
    <IconBase title='sprout' {...props}>
      {/* soil */}
      <path d='M3 17c5-4 13-4 18 0v4H3z' className='fill-amber-800' />
      {/* stem */}
      <rect
        x='11.3'
        y='11'
        width='1.4'
        height='6'
        rx='0.7'
        className='fill-green-500'
      />
      {/* leaves */}
      <ellipse
        cx='10'
        cy='12.6'
        rx='2'
        ry='1.2'
        transform='rotate(-18 10 12.6)'
        className='fill-green-500'
      />
      <ellipse
        cx='14'
        cy='12.6'
        rx='2'
        ry='1.2'
        transform='rotate(18 14 12.6)'
        className='fill-green-500'
      />
    </IconBase>
  );
}
