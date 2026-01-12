import logo from "../../../aihdl_logo.png";

export function AuthLoading() {
  return (
    <div className="min-h-full bg-[#0B0B0D] bg-gradient-to-br from-[#1A0A24] via-[#0B0B0D] to-[#06141C] flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF3AF2]/20 to-[#00F0FF]/15 flex items-center justify-center">
        <img src={logo} alt="App logo" className="w-10 h-10 object-contain" />
      </div>
      <p className="text-sm text-[#A6A6A6]">Loading your account...</p>
    </div>
  );
}
