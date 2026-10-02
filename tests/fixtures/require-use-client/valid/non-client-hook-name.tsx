export function useMyThing() {
  return 1;
}

export function Page() {
  return <div>{useMyThing()}</div>;
}
