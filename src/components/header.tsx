import kartverketLogo from "@/assets/kartverket.svg"

export function Header() {
  return (
    <header className="flex w-full p-4 justify-between bg-white">
      <img src={kartverketLogo} alt="Kartverket logo" />
    </header>
  )
}
