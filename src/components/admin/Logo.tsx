'use client'

export const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2DB5B5] to-[#249292] flex items-center justify-center text-white font-bold text-lg">
        E
      </div>
      <div>
        <span className="font-bold text-lg text-white">
          EBMC <span style={{ color: '#2DB5B5' }}>GROUP</span>
        </span>
        <div className="text-xs text-gray-400">Administration</div>
      </div>
    </div>
  )
}

export default Logo
