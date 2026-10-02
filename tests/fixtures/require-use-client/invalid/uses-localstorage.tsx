export function Theme() {
  const theme = localStorage.getItem("theme");
  return <span>{theme}</span>;
}
