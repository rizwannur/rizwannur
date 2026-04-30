import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f6c8a8 0%, #e89272 60%, #c96d52 100%)',
          color: '#2a1810',
          borderRadius: 36,
          fontFamily: 'serif',
          fontStyle: 'italic',
          fontSize: 140,
          fontWeight: 600,
          letterSpacing: -4,
          paddingBottom: 10,
        }}
      >
        R
      </div>
    ),
    size,
  )
}
