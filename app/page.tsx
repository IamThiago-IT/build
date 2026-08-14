import Roulette from "./roulette";
import { generateIdea } from "./data";

export default function Home() {
  const initialIdea = generateIdea(null);
  return <Roulette initialIdea={initialIdea} />;
}