import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
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
          borderRadius: 8,
          fontFamily: 'serif',
          fontStyle: 'italic',
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: -1,
          paddingBottom: 2,
        }}
      >
        R
      </div>
    ),
    size,
  )
}
