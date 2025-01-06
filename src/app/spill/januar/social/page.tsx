import { SignedIn } from "@clerk/nextjs";
import SnakeSocial from "../_components/_social/snakeSocial";

export default function Social() {
  return (
    <SignedIn>
      <SnakeSocial />
    </SignedIn>
  );
}
