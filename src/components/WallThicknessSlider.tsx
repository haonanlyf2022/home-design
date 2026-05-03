import { WallConfig } from '../types';

interface Props {
  config: WallConfig;
  onChange: (config: WallConfig) => void;
}

export default function WallThicknessSlider({ config, onChange }: Props) {
  return (
    <div className="wall-slider" style={{ marginTop: 16 }}>
      <h3>墙体厚度</h3>
      <label style={{ display: 'block', marginTop: 6, fontSize: 12 }}>
        外墙: {config.outerThickness}mm
        <input type="range" min={100} max={500} step={10}
          value={config.outerThickness}
          style={{ width: '100%', marginTop: 2 }}
          onChange={e => onChange({ ...config, outerThickness: Number(e.target.value) })} />
      </label>
      <label style={{ display: 'block', marginTop: 6, fontSize: 12 }}>
        内墙: {config.innerThickness}mm
        <input type="range" min={60} max={300} step={10}
          value={config.innerThickness}
          style={{ width: '100%', marginTop: 2 }}
          onChange={e => onChange({ ...config, innerThickness: Number(e.target.value) })} />
      </label>
    </div>
  );
}
