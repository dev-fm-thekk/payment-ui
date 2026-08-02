import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-dvw h-screen flex justify-center items-center border border-black gap-4">
      <Button className="w-32 px-4 py-3 h-8">
        <Link href="/login">Login</Link>
      </Button>
      <Button className="w-32 px-4 py-3 h-8">
        <Link href="/app">App</Link>
      </Button>
    </div>
  );
}
