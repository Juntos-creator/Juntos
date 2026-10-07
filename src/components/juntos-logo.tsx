import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

export default function JuntosLogo() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 360 320">
      <Defs>
        <LinearGradient id="blue" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#26B6F5" />
          <Stop offset="1" stopColor="#0878D9" />
        </LinearGradient>
        <LinearGradient id="green" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#6CE455" />
          <Stop offset="1" stopColor="#24C74D" />
        </LinearGradient>
      </Defs>

      <Path
        d="M180 164 C145 137 105 136 76 154 C43 174 41 213 65 244 C89 275 137 296 180 314"
        fill="none"
        stroke="#E443D2"
        strokeWidth="48"
        strokeLinecap="round"
      />
      <Path
        d="M180 164 C145 137 105 136 76 154 C43 174 41 213 65 244 C89 275 137 296 180 314"
        fill="none"
        stroke="url(#blue)"
        strokeWidth="44"
        strokeLinecap="round"
      />
      <Path
        d="M180 164 C211 124 249 114 278 132 C309 151 319 190 300 224 C279 260 231 292 180 314"
        fill="none"
        stroke="#E443D2"
        strokeWidth="48"
        strokeLinecap="round"
      />
      <Path
        d="M180 164 C211 124 249 114 278 132 C309 151 319 190 300 224 C279 260 231 292 180 314"
        fill="none"
        stroke="url(#green)"
        strokeWidth="44"
        strokeLinecap="round"
      />
      <Circle cx="93" cy="78" r="37" fill="url(#blue)" stroke="#E443D2" strokeWidth="1.5" />
      <Circle cx="247" cy="47" r="39" fill="url(#green)" stroke="#E443D2" strokeWidth="1.5" />
    </Svg>
  );
}